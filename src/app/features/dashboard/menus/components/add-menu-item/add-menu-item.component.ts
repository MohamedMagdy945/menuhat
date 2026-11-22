import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuItemSize } from '../../models/menu-item-size.model';
import { SystemImageSuggestion } from '../../models/system-image-suggestion.model';
import { AddMenuProductPayload } from '../../models/add-menu-product-payload.model';
import { AddMenuItemService } from './add-menu-item.service';
import { MenusService } from '../../menus.service';
import { MenuSubCategoriesService } from '../menu-sub-categories-page/menu-sub-categories.service';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../shared/components/form-select/form-select.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { SystemImagesModalComponent } from '../../modals/system-images-modal/system-images-modal.component';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-add-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    FormSelectComponent,
    LoadingButtonComponent,
    SystemImagesModalComponent,
  ],
  templateUrl: './add-menu-item.component.html',
  styleUrl: './add-menu-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenuItemComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly addMenuItemService = inject(AddMenuItemService);
  protected readonly menusService = inject(MenusService);
  protected readonly subCategoriesService = inject(MenuSubCategoriesService);
  private readonly toast = inject(ToastService);

  // Categories
  readonly mainCategories = this.menusService.mainCategories;
  readonly subCategories = this.subCategoriesService.subCategories;
  readonly menuCategoryId = signal<number>(1);
  readonly menuSubCategoryId = signal<number>(1);

  readonly mainCategoryOptions = computed(() =>
    this.mainCategories().map((cat) => ({
      value: cat.id,
      label: cat.menuMainCategoryName || cat.name,
    }))
  );

  readonly subCategoryOptions = computed(() =>
    this.subCategories().map((sub) => ({
      value: sub.id,
      label: sub.menuSubCategoryName || sub.name,
    }))
  );

  // Form Fields - Basic Info
  readonly nameAr = signal<string>('');
  readonly nameEn = signal<string>('');
  readonly descriptionAr = signal<string>('');
  readonly descriptionEn = signal<string>('');

  // Image Upload / System Image
  readonly imagePreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedSystemImageId = signal<number>(0);
  readonly selectedSystemImageUrl = signal<string | null>(null);
  readonly selectedSystemImageName = signal<string | null>(null);

  // System Images Suggestion Picker Modal
  readonly showSystemImagesModal = signal<boolean>(false);
  readonly systemImageSearchKeyword = signal<string>('');
  readonly suggestedImages = this.addMenuItemService.suggestedImages;
  readonly isLoadingSuggestions = this.addMenuItemService.isLoadingSuggestions;

  // Search Debounce Subject to avoid sending too many requests on each keystroke
  private readonly searchSubject = new Subject<string>();

  // Pricing Mode: 'single' | 'multiple'
  readonly pricingMode = signal<'single' | 'multiple'>('multiple');

  // Single Price
  readonly singlePrice = signal<number | null>(null);

  // Multiple Sizes (Matching screenshot default with 2 sizes)
  readonly sizes = signal<MenuItemSize[]>([
    {
      id: '1',
      nameAr: 'صغير',
      nameEn: 'Small',
      price: 45,
    },
    {
      id: '2',
      nameAr: 'وسط',
      nameEn: 'Medium',
      price: 65,
    },
  ]);

  readonly isSubmitting = this.addMenuItemService.isSubmitting;
  readonly errorMessage = this.addMenuItemService.errorMessage;

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((keyword) => this.addMenuItemService.suggestSystemImages(keyword)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ngOnInit(): void {
    const qParamCat = this.route.snapshot.queryParamMap.get('menuCategoryId');
    const qParamSub = this.route.snapshot.queryParamMap.get('menuSubCategoryId');

    if (qParamCat) {
      this.menuCategoryId.set(Number(qParamCat));
    }
    if (qParamSub) {
      this.menuSubCategoryId.set(Number(qParamSub));
    }

    // Load main categories
    this.menusService.getAllMainCategories().subscribe({
      next: (cats) => {
        if (cats.length > 0 && !qParamCat) {
          this.menuCategoryId.set(cats[0].id);
        }
        // Load subcategories for selected category
        const catId = this.menuCategoryId();
        this.subCategoriesService.getAllSubCategories(catId).subscribe({
          next: (subs) => {
            if (subs.length > 0 && !qParamSub) {
              this.menuSubCategoryId.set(subs[0].id);
            }
          },
        });
      },
    });
  }

  onCategoryChange(catId: number): void {
    this.menuCategoryId.set(catId);
    this.subCategoriesService.getAllSubCategories(catId).subscribe({
      next: (subs) => {
        if (subs.length > 0) {
          this.menuSubCategoryId.set(subs[0].id);
        }
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      // Clear system image when local file is selected
      this.selectedSystemImageId.set(0);
      this.selectedSystemImageUrl.set(null);
      this.selectedSystemImageName.set(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.selectedFile.set(null);
    this.selectedSystemImageId.set(0);
    this.selectedSystemImageUrl.set(null);
    this.selectedSystemImageName.set(null);
  }

  // =========================================================================
  // System Images Suggestion Methods
  // =========================================================================
  openSystemImagesPicker(): void {
    // Initially send empty string to load all/default system images
    this.systemImageSearchKeyword.set('');
    this.addMenuItemService.suggestSystemImages('').subscribe();
    this.showSystemImagesModal.set(true);
  }

  closeSystemImagesPicker(): void {
    this.showSystemImagesModal.set(false);
  }

  onSearchKeywordChange(keyword: string): void {
    this.systemImageSearchKeyword.set(keyword);
    // Debounced query on each letter typed
    this.searchSubject.next(keyword);
  }

  searchSystemImages(): void {
    const query = this.systemImageSearchKeyword();
    this.addMenuItemService.suggestSystemImages(query).subscribe();
  }

  selectSystemImage(item: SystemImageSuggestion): void {
    this.selectedSystemImageId.set(item.id);
    this.selectedSystemImageUrl.set(item.imageUrl);
    this.selectedSystemImageName.set(item.nameAr || item.nameEn);
    this.imagePreview.set(this.addMenuItemService.resolveImageUrl(item.imageUrl));
    this.selectedFile.set(null);
    this.closeSystemImagesPicker();
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.addMenuItemService.resolveImageUrl(url);
  }

  // =========================================================================
  // Pricing & Sizes Methods
  // =========================================================================
  setPricingMode(mode: 'single' | 'multiple'): void {
    this.pricingMode.set(mode);
  }

  addSize(): void {
    const current = this.sizes();
    const nextIdx = current.length + 1;
    this.sizes.update((list) => [
      ...list,
      {
        id: Date.now().toString(),
        nameAr: nextIdx === 3 ? 'كبير' : `حجم #${nextIdx}`,
        nameEn: nextIdx === 3 ? 'Large' : `Size #${nextIdx}`,
        price: null,
      },
    ]);
  }

  removeSize(id: string): void {
    if (this.sizes().length <= 1) {
      this.toast.warning('يجب الإبقاء على حجم واحد على الأقل أو التحويل لخيار "سعر واحد"');
      return;
    }
    this.sizes.update((list) => list.filter((s) => s.id !== id));
  }

  updateSizeField(id: string, field: 'nameAr' | 'nameEn' | 'price', value: any): void {
    this.sizes.update((list) =>
      list.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  getSizeOrdinalArabic(index: number): string {
    const ordinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
    return ordinals[index] || `#${index + 1}`;
  }

  // =========================================================================
  // Save & Cancel Actions
  // =========================================================================
  async save(): Promise<void> {
    if (!this.nameAr().trim()) {
      this.toast.error('يرجى إدخال اسم الصنف (بالعربية)');
      return;
    }

    if (this.pricingMode() === 'single') {
      if (!this.singlePrice() || this.singlePrice()! <= 0) {
        this.toast.error('يرجى تحديد السعر');
        return;
      }
    } else {
      const invalid = this.sizes().some((s) => !s.nameAr.trim() || !s.price || s.price <= 0);
      if (invalid) {
        this.toast.error('يرجى ملء جميع أسماء وأسعار الأحجام بشكل صحيح');
        return;
      }
    }

    let base64Photo: string | undefined;
    const file = this.selectedFile();
    if (file) {
      base64Photo = await this.fileToBase64(file);
    }

    const haveMoreInfo = this.pricingMode() === 'multiple';
    const basePrice = haveMoreInfo
      ? (this.sizes()[0]?.price || 0)
      : (this.singlePrice() || 0);

    const details = haveMoreInfo
      ? this.sizes().map((s) => ({
          id: 0,
          oneClickParentId: null,
          oneClickProductId: null,
          title: s.nameAr.trim(),
          title_En: (s.nameEn || s.nameAr).trim(),
          price: Number(s.price || 0),
        }))
      : [];

    const payload: AddMenuProductPayload = {
      name: this.nameAr().trim(),
      name_En: this.nameEn().trim() || this.nameAr().trim(),
      menuCategoryId: Number(this.menuCategoryId() || 1),
      menuSubCategoryId: Number(this.menuSubCategoryId() || 1),
      price: Number(basePrice),
      description: this.descriptionAr().trim(),
      description_En: this.descriptionEn().trim(),
      haveMoreInfo,
      photoURL: base64Photo ? { base64String: base64Photo } : null,
      details,
      selectedSystemImageId: Number(this.selectedSystemImageId() || 0),
    };

    this.addMenuItemService.addMenuProduct(payload).subscribe({
      next: () => {
        this.toast.success('تمت إضافة الصنف بنجاح!');
        this.router.navigate(['/dashboard/menu']);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'حدث خطأ أثناء إضافة الصنف');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/menu']);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
