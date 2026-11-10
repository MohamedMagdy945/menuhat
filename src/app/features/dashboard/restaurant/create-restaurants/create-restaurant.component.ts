import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';
import { CommonDateService } from '../../../../core/common-data/common-date';
import { ClientsMenuService, CreateRestaurantRequest } from '../../../restaurants/services/clients-menu.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-create-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    FormSelectComponent,
    LoadingButtonComponent
  ],
  templateUrl: './create-restaurant.component.html',
  styleUrl: './create-restaurant.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateRestaurantComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _commonDataService = inject(CommonDateService);
  private readonly _clientsMenuService = inject(ClientsMenuService);
  private readonly _router = inject(Router);
  private readonly _toast = inject(ToastService);
  private readonly _dashboardService = inject(DashboardService);
  private readonly _cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  readonly isLoading = signal<boolean>(false);

  // Dropdown lists
  governorates: { value: string; label: string }[] = [];
  cities: { value: string; label: string }[] = [];
  fields: { value: string; label: string }[] = [];
  orderConditions: { value: string; label: string }[] = [];

  readonly isLoadingGovernorates = signal<boolean>(false);
  readonly isLoadingCities = signal<boolean>(false);
  readonly isLoadingFields = signal<boolean>(false);
  readonly isLoadingConditions = signal<boolean>(false);

  // Media files (Base64 data URLs with data:image/...;base64, prefix)
  readonly logoBase64 = signal<string>('');
  readonly logoPreviewUrl = signal<string>('');

  readonly coverBase64 = signal<string>('');
  readonly coverPreviewUrl = signal<string>('');

  readonly menuImageBase64 = signal<string>('');
  readonly menuImagePreviewUrl = signal<string>('');

  // Response success state
  readonly responseSuccess = signal<boolean>(false);
  readonly createdRestaurantData = signal<any>(null);

  readonly validationMessages = {
    clientName: {
      required: 'اسم المطعم بالعربية مطلوب'
    },
    governmentId: {
      required: 'يرجى اختيار المحافظة'
    },
    cityId: {
      required: 'يرجى اختيار المدينة'
    },
    address: {
      required: 'العنوان بالتفصيل مطلوب'
    },
    fieldId: {
      required: 'يرجى اختيار نشاط / تصنيف المطعم'
    },
    orderConditionId: {
      required: 'يرجى اختيار شروط وخيارات الطلب'
    }
  };

  ngOnInit(): void {
    this.initForm();
    this.loadGovernorates();
    this.loadFields();
    this.loadOrderConditions();
    this.tryPreloadUserData();
  }

  private initForm(): void {
    this.form = this._fb.group({
      clientName: ['', [Validators.required]],
      clientName_En: [''],
      governmentId: ['', [Validators.required]],
      cityId: [{ value: '', disabled: true }, [Validators.required]],
      address: ['', [Validators.required]],
      address_En: [''],
      fieldId: ['1', [Validators.required]],
      orderConditionId: ['1', [Validators.required]],
      latitude: [30.0444],
      longitude: [31.2357],
      fromTimeString: ['10:00'],
      toTimeString: ['22:00'],
      notes: [''],
      isVisable: [true]
    });
  }

  private tryPreloadUserData(): void {
    try {
      const rawUser = localStorage.getItem('userData');
      if (rawUser) {
        const userData = JSON.parse(rawUser);
        if (userData.address) {
          this.form.patchValue({ address: userData.address });
        }
        if (userData.governmentId) {
          this.form.patchValue({ governmentId: userData.governmentId.toString() });
          this.loadCities(Number(userData.governmentId), userData.cityId?.toString());
        }
      }
    } catch {
      // Ignored
    }
  }

  private loadGovernorates(): void {
    this.isLoadingGovernorates.set(true);
    this._commonDataService.getGovernments().subscribe({
      next: (res) => {
        this.governorates = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));
        this.isLoadingGovernorates.set(false);
        this._cdr.markForCheck();
      },
      error: () => {
        this.isLoadingGovernorates.set(false);
        this._cdr.markForCheck();
      }
    });
  }

  onGovernorateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const governmentId = Number(select.value);

    this.cities = [];
    this.form.patchValue({ cityId: '' });

    if (!governmentId) {
      this.form.get('cityId')?.disable();
      this._cdr.markForCheck();
      return;
    }

    this.form.get('cityId')?.enable();
    this.loadCities(governmentId);
  }

  private loadCities(governmentId: number, defaultCityId?: string): void {
    this.isLoadingCities.set(true);
    this._cdr.markForCheck();

    this._commonDataService.getCitiesByGovernmentId(governmentId).subscribe({
      next: (res) => {
        this.cities = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));
        this.isLoadingCities.set(false);
        this.form.get('cityId')?.enable();
        if (defaultCityId) {
          this.form.patchValue({ cityId: defaultCityId });
        }
        this._cdr.markForCheck();
      },
      error: () => {
        this.isLoadingCities.set(false);
        this._cdr.markForCheck();
      }
    });
  }

  private loadFields(): void {
    this.isLoadingFields.set(true);
    this._commonDataService.getFields().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.fields = res.map(item => ({
            value: item.id.toString(),
            label: item.name
          }));
        } else {
          this.useDefaultFields();
        }
        this.isLoadingFields.set(false);
        this._cdr.markForCheck();
      },
      error: () => {
        this.useDefaultFields();
        this.isLoadingFields.set(false);
        this._cdr.markForCheck();
      }
    });
  }

  private useDefaultFields(): void {
    this.fields = [
      { value: '1', label: 'مطاعم ومأكولات شرقية' },
      { value: '2', label: 'وجبات سريعة وبرجر' },
      { value: '3', label: 'مشويات وكباب' },
      { value: '4', label: 'بيتزا وفطائر ومعجنات' },
      { value: '5', label: 'أسماك ومأكولات بحرية' },
      { value: '6', label: 'كافيهات ومشروبات' },
      { value: '7', label: 'حلويات وآيس كريم' }
    ];
  }

  private loadOrderConditions(): void {
    this.isLoadingConditions.set(true);
    this._commonDataService.getOrderConditions().subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.orderConditions = res.map(item => ({
            value: item.id.toString(),
            label: item.name
          }));
        } else {
          this.useDefaultOrderConditions();
        }
        this.isLoadingConditions.set(false);
        this._cdr.markForCheck();
      },
      error: () => {
        this.useDefaultOrderConditions();
        this.isLoadingConditions.set(false);
        this._cdr.markForCheck();
      }
    });
  }

  private useDefaultOrderConditions(): void {
    this.orderConditions = [
      { value: '1', label: 'توصيل طلبات واستلام من الفرع' },
      { value: '2', label: 'توصيل فقط' },
      { value: '3', label: 'استلام من الفرع فقط' }
    ];
  }

  // --- File Handlers ---
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this._toast.warning('يرجى اختيار ملف صورة صالح للشعار');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.logoPreviewUrl.set(dataUrl);
      this.logoBase64.set(dataUrl);
      this._cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeLogo(fileInput: HTMLInputElement): void {
    this.logoPreviewUrl.set('');
    this.logoBase64.set('');
    fileInput.value = '';
    this._cdr.markForCheck();
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this._toast.warning('يرجى اختيار ملف صورة صالح للغلاف');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.coverPreviewUrl.set(dataUrl);
      this.coverBase64.set(dataUrl);
      this._cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeCover(fileInput: HTMLInputElement): void {
    this.coverPreviewUrl.set('');
    this.coverBase64.set('');
    fileInput.value = '';
    this._cdr.markForCheck();
  }

  onMenuImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this._toast.warning('يرجى اختيار ملف صورة صالح لقائمة الطعام');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.menuImagePreviewUrl.set(dataUrl);
      this.menuImageBase64.set(dataUrl);
      this._cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeMenuImage(fileInput: HTMLInputElement): void {
    this.menuImagePreviewUrl.set('');
    this.menuImageBase64.set('');
    fileInput.value = '';
    this._cdr.markForCheck();
  }

  private formatTimeString(timeStr: string, fallback: string): string {
    if (!timeStr) return fallback;
    const parts = timeStr.trim().split(':');
    if (parts.length === 2) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${h}:${m}:00`;
    }
    if (parts.length === 3) {
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const s = parts[2].padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return timeStr;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._toast.warning('يرجى ملء جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    this.isLoading.set(true);
    const raw = this.form.getRawValue();

    const payload: CreateRestaurantRequest = {
      clientName: raw.clientName || '',
      clientName_En: raw.clientName_En || '',
      governmentId: Number(raw.governmentId),
      cityId: Number(raw.cityId),
      address: raw.address || '',
      address_En: raw.address_En || '',
      fieldId: Number(raw.fieldId) || 1,
      orderConditionId: Number(raw.orderConditionId) || 1,
      latitude: Number(raw.latitude) || 0,
      longitude: Number(raw.longitude) || 0,
      pdfURL: this.menuImageBase64() ? { base64String: this.menuImageBase64() } : null,
      logoURL: this.logoBase64() ? { base64String: this.logoBase64() } : null,
      coverURL: this.coverBase64() ? { base64String: this.coverBase64() } : null,
      fromTime: this.formatTimeString(raw.fromTimeString, '10:00:00'),
      toTime: this.formatTimeString(raw.toTimeString, '22:00:00'),
      notes: raw.notes || '',
      isVisable: raw.isVisable ?? true
    };

    this._clientsMenuService.createRestaurant(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.createdRestaurantData.set(res?.data || res || {});
        this.responseSuccess.set(true);
        this._toast.success('تم تسجيل المطعم بنجاح! جاري التوجيه إلى لوحة التحكم...');
        this._cdr.markForCheck();
        this._dashboardService.loadDashboard();
        setTimeout(() => {
          this.goToDashboard();
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || err?.error?.title || 'حدث خطأ أثناء تسجيل المطعم، يرجى مراجعة البيانات';
        this._toast.error(msg);
        this._cdr.markForCheck();
      }
    });
  }

  goToDashboard(): void {
    this._router.navigate(['/dashboard']);
  }
}

export { CreateRestaurantComponent as CreateRestaurant };

