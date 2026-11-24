import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { AdminRestaurantsService } from '../../../restaurants/admin-restaurants.service';
import { AdminRestaurantMediaFieldComponent } from '../../../restaurants/components/restaurant-media-field/restaurant-media-field.component';
import { ConfirmModalComponent } from '../../../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminMenu } from '../../../restaurants/models/admin-menu.model';
import { AdminCategoriesService } from '../../admin-categories.service';
import { AdminCategory } from '../../models/admin-category.model';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Admin add / edit main category page.
 * - `/admin/categories/new`: pick a restaurant → PreparedForInsertMainCategory + PostMainCategory/{serial}.
 * - `/admin/categories/:id/edit`: GetMainCategory/{id} → PutMainCategory/{id}; the photo is
 *   uploaded / deleted immediately (UpdatePhotoMainCategory / DeletePhotoMainCategory).
 */
@Component({
  selector: 'app-admin-category-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    LoadingButtonComponent,
    AdminRestaurantMediaFieldComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './category-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoryFormComponent implements OnInit {
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  private readonly _id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;
  readonly isEdit = !!this._id;

  readonly isLoading = signal(this.isEdit);
  readonly notFound = signal(false);
  readonly isSaving = signal(false);

  /** Edit: the loaded category (restaurant name, number…). */
  readonly category = signal<AdminCategory | null>(null);
  /** Create: next number from PreparedForInsertMainCategory. */
  readonly nextNumber = signal<number | null>(null);

  // Restaurant picker (create)
  readonly restaurantSearch = signal('');
  readonly restaurantResults = signal<AdminMenu[]>([]);
  readonly isSearchingRestaurants = signal(false);
  readonly selectedRestaurant = signal<AdminMenu | null>(null);
  readonly restaurantTouched = signal(false);
  private readonly _restaurantQuery = new Subject<string>();

  /** Edit: resolved server URL. Create: picked image as a data URL. */
  readonly photo = signal('');
  readonly photoBusy = signal(false);
  readonly confirmPhotoDelete = signal(false);

  readonly form = this._fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    name_En: [''],
    description: [''],
    description_En: [''],
    catOrder: ['', Validators.pattern(/^\d+$/)],
  });

  readonly catOrderErrors = { pattern: 'أدخل رقمًا صحيحًا' };

  constructor() {
    this._restaurantQuery
      .pipe(
        debounceTime(350),
        switchMap((query) => {
          this.isSearchingRestaurants.set(true);
          return this._restaurantsService.getMenus({
            pageNumber: 1,
            pageSize: 8,
            searchValue: query,
          });
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (res) => {
          this.restaurantResults.set(res.items);
          this.isSearchingRestaurants.set(false);
        },
        error: (err) => {
          console.error('Failed to search restaurants:', err);
          this.isSearchingRestaurants.set(false);
        },
      });
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.loadCategory();
    } else {
      this._categoriesService.getPreparedInsert().subscribe({
        next: (res) => this.nextNumber.set(res?.rank ?? null),
        error: (err) => console.error('Failed to prepare category insert:', err),
      });
      this._restaurantQuery.next('');
    }
  }

  private loadCategory(): void {
    this._categoriesService.getCategory(this._id).subscribe({
      next: (category) => {
        this.category.set(category);
        this.photo.set(resolveAdminFileUrl(category.photoURL));
        this.form.patchValue({
          name: category.menuMainCategoryName ?? '',
          name_En: category.menuMainCategoryName_En ?? '',
          description: category.description ?? '',
          description_En: category.description_En ?? '',
          catOrder: category.catOrder != null ? String(category.catOrder) : '',
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err?.status !== 404) console.error('Failed to load category:', err);
        this.isLoading.set(false);
        this.notFound.set(true);
      },
    });
  }

  // ---------- Restaurant picker ----------
  onRestaurantSearch(value: string): void {
    this.restaurantSearch.set(value);
    this._restaurantQuery.next(value.trim());
  }

  selectRestaurant(menu: AdminMenu): void {
    this.selectedRestaurant.set(menu);
  }

  clearRestaurant(): void {
    this.selectedRestaurant.set(null);
  }

  restaurantLogo(menu: AdminMenu): string {
    return resolveAdminFileUrl(menu.logoURL);
  }

  // ---------- Save ----------
  save(): void {
    if (this.isSaving() || this.isLoading()) return;
    this.restaurantTouched.set(true);
    const restaurant = this.selectedRestaurant();
    if (this.form.invalid || (!this.isEdit && !restaurant)) {
      this.form.markAllAsTouched();
      this._toast.warning(
        !this.isEdit && !restaurant ? 'اختر المطعم أولًا' : 'يرجى ملء الحقول المطلوبة بشكل صحيح',
      );
      return;
    }

    const v = this.form.getRawValue();
    const common = {
      name: v.name.trim(),
      name_En: v.name_En.trim() || null,
      description: v.description.trim() || null,
      description_En: v.description_En.trim() || null,
    };

    const request$ = this.isEdit
      ? this._categoriesService.updateCategory({
          ...common,
          id: this._id,
          catOrder: v.catOrder.trim() ? Number(v.catOrder) : null,
        })
      : this._categoriesService.createCategory(restaurant!.serial, {
          ...common,
          id: 0,
          photoURL: this.photo() ? { base64String: this.photo() } : null,
        });

    this.isSaving.set(true);
    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this._toast.success(this.isEdit ? 'تم تحديث القسم' : 'تم إضافة القسم بنجاح');
        this._router.navigate(['/admin/categories']);
      },
      error: (err) => {
        console.error('Failed to save category:', err);
        this.isSaving.set(false);
        this._toast.error(
          this.errorMessage(err, this.isEdit ? 'تعذر تحديث القسم' : 'تعذر إضافة القسم'),
        );
      },
    });
  }

  // ---------- Photo ----------
  async onPhotoSelected(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this._toast.warning('اختر صورة');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this._toast.warning('حجم الصورة يجب ألا يزيد عن 5 ميجابايت');
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await this.readAsDataUrl(file);
    } catch {
      this._toast.error('تعذر قراءة الصورة');
      return;
    }

    if (!this.isEdit) {
      this.photo.set(dataUrl);
      return;
    }

    this.photoBusy.set(true);
    this._categoriesService.updatePhoto(this._id, dataUrl).subscribe({
      next: (record) => {
        this.photoBusy.set(false);
        if (!record?.photoURL) {
          this._toast.error('لم يتم حفظ الصورة، حاول مرة أخرى');
          return;
        }
        this.photo.set(resolveAdminFileUrl(record.photoURL));
        this._toast.success('تم تحديث صورة القسم');
      },
      error: (err) => {
        console.error('Failed to upload category photo:', err);
        this.photoBusy.set(false);
        this._toast.error(this.errorMessage(err, 'تعذر رفع الصورة'));
      },
    });
  }

  onPhotoRemove(): void {
    if (!this.isEdit) {
      this.photo.set('');
      return;
    }
    this.confirmPhotoDelete.set(true);
  }

  deletePhoto(): void {
    if (this.photoBusy()) return;
    this.photoBusy.set(true);
    this._categoriesService.deletePhoto(this._id).subscribe({
      next: () => {
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this.photo.set('');
        this._toast.success('تم حذف صورة القسم');
      },
      error: (err) => {
        console.error('Failed to delete category photo:', err);
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this._toast.error(this.errorMessage(err, 'تعذر حذف الصورة'));
      },
    });
  }

  // ---------- Helpers ----------
  /** Backend errors come as `{ message: string }` or `{ message: { value } }`. */
  private errorMessage(err: unknown, fallback: string): string {
    const message = (err as { error?: { message?: unknown } })?.error?.message;
    if (typeof message === 'string' && message) return message;
    const value = (message as { value?: unknown } | undefined)?.value;
    return typeof value === 'string' && value ? value : fallback;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
