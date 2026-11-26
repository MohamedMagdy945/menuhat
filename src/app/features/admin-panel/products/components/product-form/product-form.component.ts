import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, map, of, switchMap } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../shared/components/form-select/form-select.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { FormSelectOption } from '../../../../../shared/models/form-select-option.model';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { AdminCategoriesService } from '../../../categories/admin-categories.service';
import { AdminRestaurantsService } from '../../../restaurants/admin-restaurants.service';
import { AdminRestaurantMediaFieldComponent } from '../../../restaurants/components/restaurant-media-field/restaurant-media-field.component';
import { ConfirmModalComponent } from '../../../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminMenu } from '../../../restaurants/models/admin-menu.model';
import { AdminProductsService } from '../../admin-products.service';
import { AdminProductDetail } from '../../models/admin-product-detail.model';
import { AdminProductDetailRequest } from '../../models/admin-product-detail-request.model';
import { AdminProductRecord } from '../../models/admin-product-record.model';
import { AdminProductRequest } from '../../models/admin-product-request.model';
import { AdminProductRestaurant } from '../../models/admin-product-restaurant.model';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
/** Enough for one restaurant's whole category tree in a single select. */
const OPTIONS_PAGE_SIZE = 500;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Admin add / edit product page.
 * - `/admin/products/new`: restaurant (picker) → main category → sub category, then
 *   PreparedForInsertProduct + AddMenuProduct/{serial} (sizes in `details`, photo as data URL).
 *   `?subCategoryId=` / `?categoryId=` / `?menuId=` preselect the tree (and are the way back).
 * - `/admin/products/:id/edit`: GetProduct/{id} + GetSubCategory (restaurant) → UpdateMenuProduct/{id}.
 *   The restaurant is fixed; main/sub category can move inside it. Sizes are added / removed
 *   immediately (AddMenuProductPrice / DeleteProductPrice), and so is the photo
 *   (UpdatePhotoProduct / DeletePhotoProduct).
 */
@Component({
  selector: 'app-admin-product-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    FormSelectComponent,
    LoadingButtonComponent,
    AdminRestaurantMediaFieldComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './product-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductFormComponent implements OnInit {
  private readonly _productsService = inject(AdminProductsService);
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  private readonly _snapshot = inject(ActivatedRoute).snapshot;
  private readonly _id = Number(this._snapshot.paramMap.get('id')) || 0;
  readonly isEdit = !!this._id;

  // Scope we came from: preselects the tree (create) and is kept for the way back.
  private readonly _subCategoryId = Number(this._snapshot.queryParamMap.get('subCategoryId')) || 0;
  private readonly _categoryId = Number(this._snapshot.queryParamMap.get('categoryId')) || 0;
  private readonly _menuId = Number(this._snapshot.queryParamMap.get('menuId')) || 0;
  readonly backQueryParams: Record<string, number> = this._subCategoryId
    ? { subCategoryId: this._subCategoryId }
    : this._categoryId
      ? { categoryId: this._categoryId }
      : this._menuId
        ? { menuId: this._menuId }
        : {};

  readonly isLoading = signal(
    this.isEdit || !!(this._subCategoryId || this._categoryId || this._menuId),
  );
  readonly notFound = signal(false);
  readonly isSaving = signal(false);

  /** Create: next number from PreparedForInsertProduct. */
  readonly nextNumber = signal<number | null>(null);

  // Restaurant (picker on create, fixed on edit)
  readonly restaurant = signal<AdminProductRestaurant | null>(null);
  readonly restaurantSearch = signal('');
  readonly restaurantResults = signal<AdminMenu[]>([]);
  readonly isSearchingRestaurants = signal(false);
  readonly restaurantTouched = signal(false);
  private readonly _restaurantQuery = new Subject<string>();

  // Category tree of the chosen restaurant
  readonly categoryOptions = signal<FormSelectOption[]>([]);
  readonly subOptions = signal<FormSelectOption[]>([]);
  readonly isLoadingCategories = signal(false);
  readonly isLoadingSubs = signal(false);

  // Pricing
  readonly pricingMode = signal<'single' | 'multiple'>('single');
  /** Edit: sizes saved on the server (managed live). */
  readonly savedSizes = signal<AdminProductDetail[]>([]);
  readonly isAddingSize = signal(false);
  readonly deletingSizeId = signal<number | null>(null);
  readonly pendingSizeDelete = signal<AdminProductDetail | null>(null);

  // Photo: edit → resolved server URL, create → picked image as a data URL.
  readonly photo = signal('');
  readonly photoBusy = signal(false);
  readonly confirmPhotoDelete = signal(false);

  readonly form = this._fb.nonNullable.group({
    menuCategoryId: this._fb.control<number | null>(null, Validators.required),
    menuSubCategoryId: this._fb.control<number | null>(null, Validators.required),
    name: ['', [Validators.required, Validators.minLength(2)]],
    name_En: [''],
    description: [''],
    description_En: [''],
    price: ['', Validators.pattern(PRICE_PATTERN)],
    /** Create: sizes sent with the product. */
    sizes: this._fb.nonNullable.array([this.createSizeGroup(), this.createSizeGroup()]),
  });

  /** Edit: the size being added through AddMenuProductPrice. */
  readonly newSize = this.createSizeGroup();

  readonly priceErrors = { pattern: 'أدخل سعرًا صحيحًا' };

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

  get sizes() {
    return this.form.controls.sizes;
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.loadProduct();
      return;
    }

    this._productsService.getPreparedInsert().subscribe({
      next: (res) => this.nextNumber.set(res?.rank ?? null),
      error: (err) => console.error('Failed to prepare product insert:', err),
    });
    this._restaurantQuery.next('');
    this.preselect();
  }

  // ---------- Loading ----------

  /** Create: fill restaurant / main / sub from `?subCategoryId=` → `?categoryId=` → `?menuId=`. */
  private preselect(): void {
    const tree$ = this._subCategoryId
      ? this._categoriesService
          .getSubCategory(this._subCategoryId)
          .pipe(
            map((sub) => ({ menuId: sub.menuId, categoryId: sub.menuCategoryId, subId: sub.id })),
          )
      : this._categoryId
        ? this._categoriesService
            .getCategory(this._categoryId)
            .pipe(map((main) => ({ menuId: main.menuId, categoryId: main.id, subId: 0 })))
        : this._menuId
          ? of({ menuId: this._menuId, categoryId: 0, subId: 0 })
          : null;
    if (!tree$) return;

    tree$
      .pipe(
        switchMap((tree) =>
          this._restaurantsService.getMenu(tree.menuId).pipe(map((menu) => ({ tree, menu }))),
        ),
      )
      .subscribe({
        next: ({ tree, menu }) => {
          this.isLoading.set(false);
          if (!menu.serial) return;
          this.restaurant.set({
            menuId: tree.menuId,
            serial: menu.serial,
            clientName: menu.clientName ?? '',
            no: menu.no ?? 0,
            logoURL: menu.logoURL ?? null,
          });
          this.form.patchValue({
            menuCategoryId: tree.categoryId || null,
            menuSubCategoryId: tree.subId || null,
          });
          this.loadCategories(tree.menuId);
          if (tree.categoryId) this.loadSubs(tree.categoryId);
        },
        error: (err) => {
          console.error('Failed to preselect product category:', err);
          this.isLoading.set(false);
        },
      });
  }

  private loadProduct(): void {
    this._productsService
      .getProduct(this._id)
      .pipe(
        switchMap((product) => {
          if (!product) throw { status: 404 };
          this.applyProduct(product);
          return this._categoriesService.getSubCategory(product.menuSubCategoryId);
        }),
      )
      .subscribe({
        next: (sub) => {
          this.restaurant.set({
            menuId: sub.menuId,
            serial: '',
            clientName: sub.clientName ?? '',
            no: 0,
            logoURL: null,
          });
          this.loadCategories(sub.menuId);
          this.loadSubs(sub.menuCategoryId);
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err?.status !== 404) console.error('Failed to load product:', err);
          this.isLoading.set(false);
          this.notFound.set(true);
        },
      });
  }

  private applyProduct(product: AdminProductRecord): void {
    const sizes = product.details ?? [];
    this.pricingMode.set(product.haveMoreInfo && sizes.length > 0 ? 'multiple' : 'single');
    this.savedSizes.set(sizes);
    this.photo.set(resolveAdminFileUrl(product.photoURL));
    this.form.patchValue({
      menuCategoryId: product.menuCategoryId,
      menuSubCategoryId: product.menuSubCategoryId,
      name: product.name ?? '',
      name_En: product.name_En ?? '',
      description: product.description ?? '',
      description_En: product.description_En ?? '',
      price: product.price != null ? String(product.price) : '',
    });
  }

  private loadCategories(menuId: number): void {
    this.isLoadingCategories.set(true);
    this._categoriesService
      .getCategories({ pageNumber: 1, pageSize: OPTIONS_PAGE_SIZE, menuId })
      .subscribe({
        next: (res) => {
          this.categoryOptions.set(
            res.items.map((c) => ({ value: c.id, label: c.menuMainCategoryName || `#${c.id}` })),
          );
          this.isLoadingCategories.set(false);
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.isLoadingCategories.set(false);
          this._toast.error('تعذر تحميل أقسام المطعم');
        },
      });
  }

  private loadSubs(menuCategoryId: number): void {
    this.isLoadingSubs.set(true);
    this.subOptions.set([]);
    this._categoriesService
      .getSubCategories({ pageNumber: 1, pageSize: OPTIONS_PAGE_SIZE, menuCategoryId })
      .subscribe({
        next: (res) => {
          this.subOptions.set(
            res.items.map((s) => ({ value: s.id, label: s.menuSubCategoryName || `#${s.id}` })),
          );
          this.isLoadingSubs.set(false);
        },
        error: (err) => {
          console.error('Failed to load sub categories:', err);
          this.isLoadingSubs.set(false);
          this._toast.error('تعذر تحميل الأقسام الفرعية');
        },
      });
  }

  // ---------- Restaurant / category pickers ----------

  onRestaurantSearch(value: string): void {
    this.restaurantSearch.set(value);
    this._restaurantQuery.next(value.trim());
  }

  selectRestaurant(menu: AdminMenu): void {
    this.restaurant.set(menu);
    this.form.patchValue({ menuCategoryId: null, menuSubCategoryId: null });
    this.categoryOptions.set([]);
    this.subOptions.set([]);
    this.loadCategories(menu.menuId);
  }

  clearRestaurant(): void {
    this.restaurant.set(null);
    this.form.patchValue({ menuCategoryId: null, menuSubCategoryId: null });
    this.categoryOptions.set([]);
    this.subOptions.set([]);
  }

  onCategoryChange(categoryId: number): void {
    this.form.controls.menuSubCategoryId.setValue(null);
    if (categoryId) this.loadSubs(Number(categoryId));
    else this.subOptions.set([]);
  }

  restaurantLogo(menu: AdminProductRestaurant): string {
    return resolveAdminFileUrl(menu.logoURL);
  }

  // ---------- Sizes ----------

  setPricingMode(mode: 'single' | 'multiple'): void {
    this.pricingMode.set(mode);
  }

  addSizeRow(): void {
    this.sizes.push(this.createSizeGroup());
  }

  removeSizeRow(index: number): void {
    if (this.sizes.length > 1) this.sizes.removeAt(index);
  }

  /** Edit: POST AddMenuProductPrice, then reload the sizes (the response shape is not documented). */
  addSavedSize(): void {
    if (this.isAddingSize()) return;
    if (this.newSize.invalid) {
      this.newSize.markAllAsTouched();
      return;
    }

    const v = this.newSize.getRawValue();
    this.isAddingSize.set(true);
    this._productsService
      .addPrice(this._id, {
        id: 0,
        title: v.title.trim(),
        title_En: v.title_En.trim() || null,
        price: Number(v.price),
      })
      .pipe(switchMap(() => this._productsService.getProduct(this._id)))
      .subscribe({
        next: (product) => {
          this.isAddingSize.set(false);
          this.savedSizes.set(product?.details ?? []);
          this.newSize.reset();
          this._toast.success('تم إضافة الحجم');
        },
        error: (err) => {
          console.error('Failed to add product size:', err);
          this.isAddingSize.set(false);
          this._toast.error(this.errorMessage(err, 'تعذر إضافة الحجم'));
        },
      });
  }

  askDeleteSize(size: AdminProductDetail): void {
    if (this.deletingSizeId() === null) this.pendingSizeDelete.set(size);
  }

  deleteSavedSize(): void {
    const size = this.pendingSizeDelete();
    if (!size || this.deletingSizeId() !== null) return;

    this.deletingSizeId.set(size.id);
    this._productsService.deletePrice(size.id).subscribe({
      next: () => {
        this.deletingSizeId.set(null);
        this.pendingSizeDelete.set(null);
        this.savedSizes.update((list) => list.filter((s) => s.id !== size.id));
        this._toast.success('تم حذف الحجم');
      },
      error: (err) => {
        console.error('Failed to delete product size:', err);
        this.deletingSizeId.set(null);
        this.pendingSizeDelete.set(null);
        this._toast.error(this.errorMessage(err, 'تعذر حذف الحجم'));
      },
    });
  }

  // ---------- Save ----------

  save(): void {
    if (this.isSaving() || this.isLoading()) return;
    this.restaurantTouched.set(true);

    const restaurant = this.restaurant();
    if (!this.isEdit && !restaurant) {
      this._toast.warning('اختر المطعم أولًا');
      return;
    }

    const multiple = this.pricingMode() === 'multiple';
    const priceControl = this.form.controls.price;
    priceControl.updateValueAndValidity();
    if (!multiple && priceControl.valid && !(Number(priceControl.value) > 0)) {
      priceControl.setErrors({ required: true });
    }

    const keys = ['menuCategoryId', 'menuSubCategoryId', 'name', ...(multiple ? [] : ['price'])];
    const mainInvalid = keys.some((key) => this.form.get(key)?.invalid);
    const sizesInvalid = multiple && !this.isEdit && this.sizes.invalid;
    if (mainInvalid || sizesInvalid) {
      this.form.markAllAsTouched();
      this._toast.warning('يرجى ملء الحقول المطلوبة بشكل صحيح');
      return;
    }

    const details: AdminProductDetailRequest[] = !multiple
      ? []
      : this.isEdit
        ? this.savedSizes().map((s) => ({
            id: s.id,
            title: s.title ?? '',
            title_En: s.title_En,
            price: s.price ?? 0,
          }))
        : this.sizes.getRawValue().map((s) => ({
            id: 0,
            title: s.title.trim(),
            title_En: s.title_En.trim() || null,
            price: Number(s.price),
          }));

    if (multiple && details.length === 0) {
      this._toast.warning('أضف حجمًا واحدًا على الأقل');
      return;
    }

    const v = this.form.getRawValue();
    const request: AdminProductRequest = {
      name: v.name.trim(),
      name_En: v.name_En.trim() || null,
      menuCategoryId: Number(v.menuCategoryId),
      menuSubCategoryId: Number(v.menuSubCategoryId),
      price: multiple ? details[0].price : Number(v.price),
      description: v.description.trim() || null,
      description_En: v.description_En.trim() || null,
      haveMoreInfo: multiple,
      photoURL: !this.isEdit && this.photo() ? { base64String: this.photo() } : null,
      details: multiple || !this.isEdit ? details : null,
      selectedSystemImageId: null,
      additions: this.isEdit ? null : [],
    };

    const request$ = this.isEdit
      ? this._productsService.updateProduct(this._id, request)
      : this._productsService.createProduct(restaurant!.serial, request);

    this.isSaving.set(true);
    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this._toast.success(this.isEdit ? 'تم تحديث المنتج' : 'تم إضافة المنتج بنجاح');
        const back = Object.keys(this.backQueryParams).length
          ? this.backQueryParams
          : { subCategoryId: request.menuSubCategoryId };
        this._router.navigate(['/admin/products'], { queryParams: back });
      },
      error: (err) => {
        console.error('Failed to save product:', err);
        this.isSaving.set(false);
        this._toast.error(
          this.errorMessage(err, this.isEdit ? 'تعذر تحديث المنتج' : 'تعذر إضافة المنتج'),
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
    this._productsService
      .updatePhoto(this._id, dataUrl)
      .pipe(switchMap(() => this._productsService.getProduct(this._id)))
      .subscribe({
        next: (product) => {
          this.photoBusy.set(false);
          if (!product?.photoURL) {
            this._toast.error('لم يتم حفظ الصورة، حاول مرة أخرى');
            return;
          }
          this.photo.set(resolveAdminFileUrl(product.photoURL));
          this._toast.success('تم تحديث صورة المنتج');
        },
        error: (err) => {
          console.error('Failed to upload product photo:', err);
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
    this._productsService.deletePhoto(this._id).subscribe({
      next: () => {
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this.photo.set('');
        this._toast.success('تم حذف صورة المنتج');
      },
      error: (err) => {
        console.error('Failed to delete product photo:', err);
        this.photoBusy.set(false);
        this.confirmPhotoDelete.set(false);
        this._toast.error(this.errorMessage(err, 'تعذر حذف الصورة'));
      },
    });
  }

  // ---------- Helpers ----------

  private createSizeGroup() {
    return this._fb.nonNullable.group({
      title: ['', Validators.required],
      title_En: [''],
      price: ['', [Validators.required, Validators.pattern(PRICE_PATTERN), Validators.min(0.01)]],
    });
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
