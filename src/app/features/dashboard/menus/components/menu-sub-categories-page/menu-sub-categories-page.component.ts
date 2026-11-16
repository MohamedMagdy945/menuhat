import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuSubCategoriesService } from './menu-sub-categories.service';
import { MenusService } from '../../menus.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { MenuSubCategory } from '../../models/menu-sub-category.model';
import { MenuMainCategory } from '../../models/menu-main-category.model';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-menu-sub-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormInputComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './menu-sub-categories-page.component.html',
  styleUrl: './menu-sub-categories-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSubCategoriesPageComponent implements OnInit {
  protected readonly subCategoriesService = inject(MenuSubCategoriesService);
  protected readonly menusService = inject(MenusService);
  protected readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals
  readonly subCategories = this.subCategoriesService.subCategories;
  readonly mainCategories = this.menusService.mainCategories;
  readonly isLoading = this.subCategoriesService.isLoading;
  readonly isSaving = this.subCategoriesService.isSaving;
  readonly errorMessage = this.subCategoriesService.errorMessage;

  // Selected filter (null means All)
  readonly activeCategoryFilter = signal<number | null>(null);

  // Modals state
  readonly showAddModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  // Active item & form fields
  readonly selectedSubCategory = signal<MenuSubCategory | null>(null);
  readonly formName = signal<string>('');
  readonly formNameEn = signal<string>('');
  readonly formMenuCategoryId = signal<number>(1);
  readonly formDescription = signal<string>('');
  readonly formPhotoBase64 = signal<string | null>(null);
  readonly formPhotoPreview = signal<string | null>(null);

  readonly restaurantName = computed<string>(() => {
    const data = this.dashboardService.dashboardData();
    return data?.restaurant?.name || 'كومبو سفن فودز';
  });

  readonly filteredSubCategories = computed(() => {
    const filterId = this.activeCategoryFilter();
    const list = this.subCategories();
    if (!filterId) return list;
    return list.filter((item) => {
      const itemCatId = Number(item.menuCategoryId ?? item.menuMainCategoryId ?? 0);
      return !itemCatId || itemCatId === filterId;
    });
  });

  ngOnInit(): void {
    if (!this.dashboardService.dashboardData()) {
      this.dashboardService.loadDashboard();
    }

    // Determine target category ID from route query or param
    const qParam = this.route.snapshot.queryParamMap.get('menuCategoryId') ||
                   this.route.snapshot.queryParamMap.get('MenuCategoryId');
    const routeParam = this.route.snapshot.paramMap.get('id');
    const initialCatId = Number(qParam || routeParam || 1);
    this.activeCategoryFilter.set(initialCatId === 1 ? null : initialCatId);

    // Load main categories for dropdown
    this.menusService.getAllMainCategories().subscribe({
      next: (cats) => {
        if (cats.length > 0 && !this.formMenuCategoryId()) {
          this.formMenuCategoryId.set(cats[0].id);
        }
      },
    });

    // Load subcategories with initial category ID
    this.loadSubCategories(initialCatId);
  }

  loadSubCategories(catId: number = 1): void {
    this.subCategoriesService.getAllSubCategories(catId).subscribe();
  }

  openProducts(sub: MenuSubCategory): void {
    const catId = sub.menuCategoryId ?? sub.menuMainCategoryId ?? 1;
    this.router.navigate(['/dashboard/menu/products'], {
      queryParams: {
        menuCategoryId: catId,
        menuSubCategoryId: sub.id,
        subCategoryName: sub.menuSubCategoryName || sub.name,
        categoryName: sub.menuCategoryName || sub.mainCategoryName,
      },
    });
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.subCategoriesService.resolveImageUrl(url);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/menu/details']);
  }

  setCategoryFilter(catId: number | null): void {
    this.activeCategoryFilter.set(catId);
    this.subCategoriesService.getAllSubCategories(catId || 1).subscribe();
  }

  // =========================================================================
  // Image Selection (Base64)
  // =========================================================================
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.formPhotoPreview.set(result);
        // Extract raw base64 string
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        this.formPhotoBase64.set(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.formPhotoPreview.set(null);
    this.formPhotoBase64.set(null);
  }

  // =========================================================================
  // Add Modal Actions
  // =========================================================================
  openAddModal(): void {
    const cats = this.mainCategories();
    this.formName.set('');
    this.formNameEn.set('');
    this.formDescription.set('');
    this.formPhotoBase64.set(null);
    this.formPhotoPreview.set(null);
    this.formMenuCategoryId.set(this.activeCategoryFilter() ?? (cats[0]?.id ?? 1));
    this.selectedSubCategory.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  createSubCategory(): void {
    const name = this.formName().trim();
    const catId = this.formMenuCategoryId();
    if (!name || !catId) return;

    this.subCategoriesService
      .createSubCategory({
        name,
        name_En: this.formNameEn().trim() || undefined,
        menuCategoryId: catId,
        description: this.formDescription().trim() || undefined,
        photoBase64: this.formPhotoBase64(),
      })
      .subscribe({
        next: () => {
          this.closeAddModal();
        },
      });
  }

  // =========================================================================
  // Edit Modal Actions
  // =========================================================================
  openEditModal(sub: MenuSubCategory): void {
    this.selectedSubCategory.set(sub);
    this.formName.set(sub.menuSubCategoryName || sub.name || '');
    this.formNameEn.set(sub.menuSubCategoryName_En || sub.name_En || '');
    this.formMenuCategoryId.set(sub.menuCategoryId ?? sub.menuMainCategoryId ?? 1);
    this.formDescription.set(sub.description || '');
    this.formPhotoBase64.set(null);
    this.formPhotoPreview.set(sub.photoURL ? this.resolveImageUrl(sub.photoURL) : null);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedSubCategory.set(null);
  }

  saveEditSubCategory(): void {
    const sub = this.selectedSubCategory();
    const name = this.formName().trim();
    const catId = this.formMenuCategoryId();
    if (!sub || !name || !catId) return;

    this.subCategoriesService
      .updateSubCategory(sub.id, {
        name,
        name_En: this.formNameEn().trim() || undefined,
        menuCategoryId: catId,
        description: this.formDescription().trim() || undefined,
        photoBase64: this.formPhotoBase64(),
      })
      .subscribe({
        next: () => {
          this.closeEditModal();
        },
      });
  }

  // =========================================================================
  // Delete Modal Actions
  // =========================================================================
  askDeleteSubCategory(sub: MenuSubCategory): void {
    this.selectedSubCategory.set(sub);
    this.showDeleteModal.set(true);
  }

  deleteSubCategory(): void {
    const sub = this.selectedSubCategory();
    if (!sub) return;

    this.subCategoriesService.deleteSubCategory(sub.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.selectedSubCategory.set(null);
      },
    });
  }
}
