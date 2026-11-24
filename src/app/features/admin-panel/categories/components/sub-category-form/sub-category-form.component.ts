import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { AdminRestaurantsService } from '../../../restaurants/admin-restaurants.service';
import { AdminRestaurantMediaFieldComponent } from '../../../restaurants/components/restaurant-media-field/restaurant-media-field.component';
import { ConfirmModalComponent } from '../../../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminCategoriesService } from '../../admin-categories.service';
import { AdminCategory } from '../../models/admin-category.model';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Add / edit a sub category of a main category.
 * - `/admin/categories/:id/subcategories/new`: GetMainCategory/{id} → GetMenu/{menuId} (serial)
 *   + PreparedForInsertSubCategory → PostSubCategory/{serial}.
 * - `/admin/categories/:id/subcategories/:subId/edit`: GetSubCategory/{subId} → PutSubCategory/{subId};
 *   photo saved immediately (UpdatePhotoSubCategory / DeletePhotoSubCategory).
 */
@Component({
  selector: 'app-admin-sub-category-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    LoadingButtonComponent,
    AdminRestaurantMediaFieldComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './sub-category-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSubCategoryFormComponent implements OnInit {
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  private readonly _params = inject(ActivatedRoute).snapshot.paramMap;
  readonly mainId = Number(this._params.get('id')) || 0;
  private readonly _subId = Number(this._params.get('subId')) || 0;
  readonly isEdit = !!this._subId;

  readonly isLoading = signal(true);
  readonly notFound = signal(false);
  readonly isSaving = signal(false);

  readonly main = signal<AdminCategory | null>(null);
  readonly nextNumber = signal<number | null>(null);
  /** Serial of the main category's own restaurant (create only). */
  private _menuSerial = '';

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

  ngOnInit(): void {
    if (!this.mainId) {
      this.fail();
      return;
    }

    // Main category (header + restaurant) → restaurant serial (needed to create).
    this._categoriesService
      .getCategory(this.mainId)
      .pipe(
        switchMap((main) => {
          this.main.set(main);
          return this._restaurantsService.getMenu(main.menuId);
        }),
      )
      .subscribe({
        next: (menu) => {
          this._menuSerial = menu.serial ?? '';
          if (!this.isEdit) this.isLoading.set(false);
        },
        error: (err) => {
          if (err?.status !== 404) console.error('Failed to load main category:', err);
          this.fail();
        },
      });

    if (this.isEdit) {
      this._categoriesService.getSubCategory(this._subId).subscribe({
        next: (sub) => {
          if (sub.menuCategoryId !== this.mainId) {
            this.fail();
            return;
          }
          this.photo.set(resolveAdminFileUrl(sub.photoURL));
          this.form.patchValue({
            name: sub.menuSubCategoryName ?? '',
            name_En: sub.menuSubCategoryName_En ?? '',
            description: sub.description ?? '',
            description_En: sub.description_En ?? '',
            catOrder: sub.catOrder != null ? String(sub.catOrder) : '',
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err?.status !== 404) console.error('Failed to load sub category:', err);
          this.fail();
        },
      });
    } else {
      this._categoriesService.getSubPreparedInsert().subscribe({
        next: (res) => this.nextNumber.set(res?.rank ?? null),
        error: (err) => console.error('Failed to prepare sub category insert:', err),
      });
    }
  }

  save(): void {
    if (this.isSaving() || this.isLoading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._toast.warning('يرجى ملء الحقول المطلوبة بشكل صحيح');
      return;
    }
    if (!this.isEdit && !this._menuSerial) {
      this._toast.error('تعذر تحديد مطعم هذا القسم');
      return;
    }

    const v = this.form.getRawValue();
    const common = {
      menuCategoryId: this.mainId,
      name: v.name.trim(),
      name_En: v.name_En.trim() || null,
      description: v.description.trim() || null,
      description_En: v.description_En.trim() || null,
      catOrder: v.catOrder.trim() ? Number(v.catOrder) : null,
    };

    const request$ = this.isEdit
      ? this._categoriesService.updateSubCategory({ ...common, id: this._subId })
      : this._categoriesService.createSubCategory(this._menuSerial, {
          ...common,
          id: 0,
          photoURL: this.photo() ? { base64String: this.photo() } : null,
        });

    this.isSaving.set(true);
    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this._toast.success(this.isEdit ? 'تم تحديث القسم الفرعي' : 'تم إضافة القسم الفرعي');
        this._router.navigate(['/admin/categories', this.mainId, 'subcategories']);
      },
      error: (err) => {
        console.error('Failed to save sub category:', err);
        this.isSaving.set(false);
        this._toast.error(
          this.errorMessage(
            err,
            this.isEdit ? 'تعذر تحديث القسم الفرعي' : 'تعذر إضافة القسم الفرعي',
          ),
        );
      },
    });
  }

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
    this._categoriesService.updateSubPhoto(this._subId, dataUrl).subscribe({
      next: (record) => {
        this.photoBusy.set(false);
        if (!record?.photoURL) {
          this._toast.error('لم يتم حفظ الصورة، حاول مرة أخرى');
          return;
        }
        this.photo.set(resolveAdminFileUrl(record.photoURL));
        this._toast.success('تم تحديث صورة القسم الفرعي');
      },
      error: (err) => {
        console.error('Failed to upload sub category photo:', err);
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
    this._categoriesService.deleteSubPhoto(this._subId).subscribe({
      next: () => {
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this.photo.set('');
        this._toast.success('تم حذف صورة القسم الفرعي');
      },
      error: (err) => {
        console.error('Failed to delete sub category photo:', err);
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this._toast.error(this.errorMessage(err, 'تعذر حذف الصورة'));
      },
    });
  }

  private fail(): void {
    this.isLoading.set(false);
    this.notFound.set(true);
  }

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
