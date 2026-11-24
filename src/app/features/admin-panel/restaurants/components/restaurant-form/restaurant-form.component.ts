import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { AdminRestaurantsService } from '../../admin-restaurants.service';
import { CommonDateService } from '../../../../../core/common-data/common-date';
import { FormSelectOption } from '../../../../../shared/models/form-select-option.model';
import { AdminMenuSerialMain } from '../../models/admin-menu-serial-main.model';
import { formatWorkingHours } from '../../../utils/admin-time';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { AdminMenuBySerial } from '../../models/admin-menu-by-serial.model';
import { AdminMenuDetails } from '../../models/admin-menu-details.model';
import { AdminMenuRecord } from '../../models/admin-menu-record.model';
import { DropdownItem } from '../../../../../core/models/dropdown-item.model';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../shared/components/form-select/form-select.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { AdminRestaurantMediaFieldComponent } from '../restaurant-media-field/restaurant-media-field.component';
import { ConfirmModalComponent } from '../../modals/confirm-modal/confirm-modal.component';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Admin add / edit restaurant page.
 * - `/admin/restaurants/new`: PreparedForInsertMenu + PostMenu (logo/PDF are sent in the body).
 * - `/admin/restaurants/:serial/edit`: GetMenus/{serial} + GetMenu/{id} → PutMenu; the logo and
 *   menu PDF are uploaded/deleted immediately through their own endpoints.
 */
@Component({
  selector: 'app-admin-restaurant-form',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    FormSelectComponent,
    LoadingButtonComponent,
    AdminRestaurantMediaFieldComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './restaurant-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRestaurantFormComponent implements OnInit {
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _commonData = inject(CommonDateService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  /** Route param; empty on the "new" route. */
  readonly serial = inject(ActivatedRoute).snapshot.paramMap.get('serial') ?? '';
  readonly isEdit = !!this.serial;

  /**
   * GetMenu / GetMenus do not return the address, so the list page passes it in the navigation
   * state. Read here because the navigation is only current while the page is being created.
   */
  private readonly _navAddress = this.readNavigationAddress();

  readonly isLoading = signal(this.isEdit);
  readonly notFound = signal(false);
  readonly isSaving = signal(false);

  readonly governmentOptions = signal<FormSelectOption[]>([]);
  readonly cityOptions = signal<FormSelectOption[]>([]);
  readonly fieldOptions = signal<FormSelectOption[]>([]);
  readonly orderConditionOptions = signal<FormSelectOption[]>([]);

  /** Create: next menu number from PreparedForInsertMenu. */
  readonly nextNumber = signal<number | null>(null);

  /** Edit: restaurant info from GetMenus/{serial}. */
  readonly summary = signal<AdminMenuSerialMain | null>(null);
  readonly categoriesCount = signal(0);
  readonly productsCount = signal(0);

  /** Edit: server file URL (resolved). Create: the picked file as a data URL. */
  readonly logo = signal('');
  readonly pdf = signal('');
  readonly logoBusy = signal(false);
  readonly pdfBusy = signal(false);
  /** File waiting for delete confirmation in the confirm modal (edit mode). */
  readonly pendingRemove = signal<'logo' | 'pdf' | null>(null);

  readonly summaryHours = computed(() => {
    const s = this.summary();
    return s ? formatWorkingHours(s.fromTime, s.toTime) : '';
  });
  readonly summaryLocation = computed(() => {
    const s = this.summary();
    return s ? [s.government_Ar, s.city_Ar].filter(Boolean).join(' - ') : '';
  });

  readonly form = this._fb.nonNullable.group({
    userId: ['', this.isEdit ? [] : [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
    clientName: ['', [Validators.required, Validators.minLength(2)]],
    clientName_En: [''],
    governmentId: [null as number | null, Validators.required],
    cityId: [null as number | null, Validators.required],
    address: [''],
    address_En: [''],
    latitude: ['', Validators.pattern(/^-?\d+(\.\d+)?$/)],
    longitude: ['', Validators.pattern(/^-?\d+(\.\d+)?$/)],
    fieldId: [null as number | null, Validators.required],
    orderConditionId: [null as number | null, Validators.required],
    fromTime: ['10:00', Validators.required],
    toTime: ['22:00', Validators.required],
    notes: [''],
    isVisable: [true],
  });

  readonly coordinateErrors = { pattern: 'أدخل رقمًا صحيحًا مثل 30.0444' };
  readonly userIdErrors = {
    required: 'رقم المالك مطلوب',
    pattern: 'أدخل رقم مستخدم صحيح',
  };

  /** Kept from GetMenu so PutMenu does not reset it. */
  private _hasNoImage: boolean | null = null;
  private _menuId = 0;

  constructor() {
    this.form.controls.governmentId.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.form.controls.cityId.setValue(null);
      this.loadCities(id);
    });
  }

  ngOnInit(): void {
    this.loadLookup(this._commonData.getGovernments(), this.governmentOptions, 'governments');
    this.loadLookup(this._commonData.getFields(), this.fieldOptions, 'fields');
    this.loadLookup(
      this._commonData.getOrderConditions(),
      this.orderConditionOptions,
      'order conditions',
    );

    if (this.isEdit) {
      this.loadMenu();
    } else {
      this._restaurantsService.getPreparedInsert().subscribe({
        next: (res) => this.nextNumber.set(res?.rank ?? null),
        error: (err) => console.error('Failed to prepare menu insert:', err),
      });
    }
  }

  // ---------- Load (edit) ----------
  private loadMenu(): void {
    let bySerial: AdminMenuBySerial | null = null;

    this._restaurantsService
      .getMenuBySerial(this.serial)
      .pipe(
        switchMap((res) => {
          if (!res) throw new Error('not-found');
          bySerial = res;
          this.applySerial(res);
          return this._restaurantsService.getMenu(res.main.id);
        }),
      )
      .subscribe({
        next: (details) => {
          this.applyDetails(details);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (!bySerial) {
            if (err?.message !== 'not-found') console.error('Failed to load menu:', err);
            this.notFound.set(true);
            return;
          }
          // GetMenus succeeded; only the extra fields (order condition) are missing.
          console.error('Failed to load menu details:', err);
          this._toast.warning('تعذر تحميل بعض بيانات المطعم، راجع شروط الطلب قبل الحفظ');
        },
      });
  }

  private applySerial({ main, details }: AdminMenuBySerial): void {
    this._menuId = main.id;
    this._hasNoImage = main.hasNoImage;
    this.summary.set(main);
    this.logo.set(resolveAdminFileUrl(main.logoURL));
    this.pdf.set(resolveAdminFileUrl(main.pdfURL));

    const categories = details ?? [];
    const subCategories = categories.flatMap((c) => c.subCategories ?? []);
    this.categoriesCount.set(categories.length);
    this.productsCount.set(
      subCategories.reduce((sum, s) => sum + (s.menuProducts?.length ?? 0), 0),
    );

    // Government first, without the listener that clears the city.
    this.form.controls.governmentId.setValue(main.governmentId || null, { emitEvent: false });
    this.loadCities(main.governmentId);
    this.form.patchValue({
      clientName: main.clientName ?? '',
      clientName_En: main.clientName_En ?? '',
      cityId: main.cityId || null,
      fieldId: main.fieldId || null,
      latitude: main.latitude != null ? String(main.latitude) : '',
      longitude: main.longitude != null ? String(main.longitude) : '',
      fromTime: main.fromTime ? main.fromTime.slice(0, 5) : '',
      toTime: main.toTime ? main.toTime.slice(0, 5) : '',
      notes: main.notes ?? '',
      address: this._navAddress,
    });
  }

  private applyDetails(details: AdminMenuDetails): void {
    if (details.hasNoImage !== undefined) this._hasNoImage = details.hasNoImage;
    this.form.patchValue({
      orderConditionId: details.orderConditionId || null,
      address_En: details.address_En ?? '',
      ...(details.address ? { address: details.address } : {}),
    });
  }

  // ---------- Save ----------
  save(): void {
    if (this.isSaving() || this.isLoading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._toast.warning('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    const v = this.form.getRawValue();
    const common = {
      clientName: v.clientName.trim(),
      clientName_En: v.clientName_En.trim() || null,
      governmentId: Number(v.governmentId),
      cityId: Number(v.cityId),
      address: v.address.trim() || null,
      address_En: v.address_En.trim() || null,
      fieldId: Number(v.fieldId),
      orderConditionId: Number(v.orderConditionId),
      latitude: v.latitude.trim() ? Number(v.latitude) : null,
      longitude: v.longitude.trim() ? Number(v.longitude) : null,
      fromTime: this.toTimeSpan(v.fromTime),
      toTime: this.toTimeSpan(v.toTime),
      notes: v.notes.trim() || null,
    };

    const request$ = this.isEdit
      ? this._restaurantsService.updateMenu({
          ...common,
          id: this._menuId,
          hasNoImage: this._hasNoImage,
        })
      : this._restaurantsService.createMenu({
          ...common,
          userId: Number(v.userId),
          isVisable: v.isVisable,
          logoURL: this.logo() ? { base64String: this.logo() } : null,
          pdfURL: this.pdf() ? { base64String: this.pdf() } : null,
          coverURL: null,
          deliveryCompanies: [],
        });

    this.isSaving.set(true);
    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this._toast.success(this.isEdit ? 'تم تحديث بيانات المطعم' : 'تم إضافة المطعم بنجاح');
        this._router.navigate(['/admin/restaurants']);
      },
      error: (err) => {
        console.error('Failed to save menu:', err);
        this.isSaving.set(false);
        this._toast.error(
          this.errorMessage(err, this.isEdit ? 'تعذر تحديث بيانات المطعم' : 'تعذر إضافة المطعم'),
        );
      },
    });
  }

  // ---------- Logo / menu file ----------
  async onFileSelected(kind: 'logo' | 'pdf', file: File): Promise<void> {
    const allowed = kind === 'logo' ? /^image\// : /^(image\/|application\/pdf$)/;
    if (!allowed.test(file.type)) {
      this._toast.warning(kind === 'logo' ? 'اختر صورة للشعار' : 'اختر ملف PDF أو صورة');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this._toast.warning('حجم الملف يجب ألا يزيد عن 5 ميجابايت');
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await this.readAsDataUrl(file);
    } catch {
      this._toast.error('تعذر قراءة الملف');
      return;
    }

    const target = kind === 'logo' ? this.logo : this.pdf;
    if (!this.isEdit) {
      target.set(dataUrl);
      return;
    }

    const busy = kind === 'logo' ? this.logoBusy : this.pdfBusy;
    busy.set(true);
    const upload$: Observable<AdminMenuRecord> =
      kind === 'logo'
        ? this._restaurantsService.updateLogo(this._menuId, dataUrl)
        : this._restaurantsService.updatePdf(this._menuId, dataUrl);

    upload$.subscribe({
      next: (record) => {
        busy.set(false);
        const path = kind === 'logo' ? record?.logoURL : record?.pdfURL;
        if (!path) {
          this._toast.error('لم يتم حفظ الملف، حاول مرة أخرى');
          return;
        }
        target.set(resolveAdminFileUrl(path));
        this._toast.success(kind === 'logo' ? 'تم تحديث الشعار' : 'تم تحديث ملف المنيو');
      },
      error: (err) => {
        console.error('Failed to upload file:', err);
        busy.set(false);
        this._toast.error(this.errorMessage(err, 'تعذر رفع الملف'));
      },
    });
  }

  onFileRemove(kind: 'logo' | 'pdf'): void {
    const target = kind === 'logo' ? this.logo : this.pdf;
    if (!this.isEdit) {
      target.set('');
      return;
    }
    // Saved files are deleted on the server — ask first (confirmFileRemove runs the delete).
    this.pendingRemove.set(kind);
  }

  confirmFileRemove(): void {
    const kind = this.pendingRemove();
    if (!kind) return;
    const target = kind === 'logo' ? this.logo : this.pdf;
    const busy = kind === 'logo' ? this.logoBusy : this.pdfBusy;
    if (busy()) return;

    busy.set(true);
    const delete$ =
      kind === 'logo'
        ? this._restaurantsService.deleteLogo(this._menuId)
        : this._restaurantsService.deletePdf(this._menuId);

    delete$.subscribe({
      next: () => {
        busy.set(false);
        this.pendingRemove.set(null);
        target.set('');
        this._toast.success(kind === 'logo' ? 'تم حذف الشعار' : 'تم حذف ملف المنيو');
      },
      error: (err) => {
        console.error('Failed to delete file:', err);
        busy.set(false);
        this.pendingRemove.set(null);
        this._toast.error(this.errorMessage(err, 'تعذر حذف الملف'));
      },
    });
  }

  // ---------- Helpers ----------
  private loadCities(governmentId: number | null): void {
    this.cityOptions.set([]);
    if (!governmentId) return;
    this._commonData.getCitiesByGovernmentId(Number(governmentId)).subscribe({
      next: (list) => this.cityOptions.set(this.toOptions(list)),
      error: (err) => console.error('Failed to load cities:', err),
    });
  }

  private loadLookup(
    source: Observable<DropdownItem[]>,
    target: { set(value: FormSelectOption[]): void },
    name: string,
  ): void {
    source.subscribe({
      next: (list) => target.set(this.toOptions(list)),
      error: (err) => console.error(`Failed to load ${name}:`, err),
    });
  }

  private toOptions(list: DropdownItem[] | null): FormSelectOption[] {
    return (list ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  /** "10:00" → "10:00:00" (TimeSpan). */
  private toTimeSpan(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
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

  private readNavigationAddress(): string {
    const state =
      this._router.currentNavigation()?.extras.state ?? (history.state as object | null);
    const address = (state as { address?: unknown } | null)?.address;
    return typeof address === 'string' ? address : '';
  }
}
