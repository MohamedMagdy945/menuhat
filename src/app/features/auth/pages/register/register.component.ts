import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';
import { CommonDateService } from '../../../../core/common-data/common-date';
import { RegisterService } from '../../services/register.service';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { RegisterRequest } from '../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    FormSelectComponent,
    LoadingButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _commonDataService = inject(CommonDateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _registerService = inject(RegisterService);
  private readonly _swal = inject(SweetAlertService);

  readonly defaultAvatar = 'assets/images/default-avatar.png';
  photoPreviewUrl = this.defaultAvatar;
  emailFromQuery = '';

  /**
   * userTypeId:
   * 1: عميل (صاحب مطعم)
   * 3: عميل العميل (حساب عادي)
   */
  userTypeId: number = 3;

  get isOwner(): boolean {
    return this.userTypeId === 1;
  }

  governorates: { value: string; label: string }[] = [];
  cities: { value: string; label: string }[] = [];
  isLoadingGovernorates = false;
  isLoadingCities = false;
  isLoading = false;

  readonly validationMessages = {
    fullName: {
      required: 'الاسم بالكامل مطلوب'
    },
    username: {
      required: 'اسم المستخدم مطلوب',
      pattern: 'اسم المستخدم يجب أن يكون من 6-20 حرفاً أو رقماً ولا يحتوي على @'
    },
    mobile: {
      required: 'رقم الهاتف مطلوب',
      pattern: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01xxxxxxxxx)'
    },
    mobile2: {
      pattern: 'يرجى إدخال رقم هاتف صحيح'
    },
    password: {
      required: 'كلمة المرور مطلوبة',
      minlength: 'يجب ألا تقل كلمة المرور عن 8 أحرف'
    },
    confirmPassword: {
      required: 'تأكيد كلمة المرور مطلوب',
      minlength: 'يجب ألا تقل كلمة المرور عن 8 أحرف',
      missmatch: 'كلمة المرور غير متطابقة'
    },
    governmentId: {
      required: 'يرجى اختيار المحافظة'
    },
    cityId: {
      required: 'يرجى اختيار المدينة'
    },
    address: {
      required: 'العنوان بالتفصيل مطلوب'
    }
  };

  readonly form = this._fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.pattern(/^(?=.{6,20}$)(?![0-9]+$)(?!.*@)[a-zA-Z0-9._]+$/)]],
    mobile: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    mobile2: ['', [Validators.pattern(/^01[0125][0-9]{8}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    governmentId: ['', [Validators.required]],
    cityId: ['', [Validators.required]],
    address: ['', [Validators.required]]
  }, { validators: this.confirmPassValidator });

  confirmPassValidator(g: AbstractControl) {
    const pass = g.get('password')?.value;
    const confirmPassControl = g.get('confirmPassword');
    const confirmPass = confirmPassControl?.value;

    if (!pass || !confirmPass) {
      return null;
    }

    if (pass !== confirmPass) {
      confirmPassControl?.setErrors({ ...confirmPassControl.errors, missmatch: true });
      return { missmatch: true };
    } else {
      if (confirmPassControl?.hasError('missmatch')) {
        delete confirmPassControl.errors?.['missmatch'];
        if (!Object.keys(confirmPassControl.errors || {}).length) {
          confirmPassControl.setErrors(null);
        }
      }
      return null;
    }
  }

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.emailFromQuery = params['email'] || '';

      // Determine userTypeId: 1 for owner (عميل), 3 for customer (عميل العميل)
      if (params['userTypeId'] !== undefined) {
        this.userTypeId = Number(params['userTypeId']) === 1 ? 1 : 3;
      } else if (params['role'] === 'owner') {
        this.userTypeId = 1;
      } else {
        this.userTypeId = 3;
      }
    });

    this.loadGovernorates();
  }

  setUserType(typeId: number): void {
    this.userTypeId = typeId;
    this._cdr.detectChanges();
  }

  private loadGovernorates(): void {
    this.isLoadingGovernorates = true;
    this._commonDataService.getGovernments().subscribe({
      next: (res) => {
        this.governorates = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));
        this.isLoadingGovernorates = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoadingGovernorates = false;
        this._cdr.detectChanges();
      }
    });
  }

  onGovernorateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const governmentId = Number(select.value);

    this.cities = [];
    this.form.patchValue({ cityId: '' });

    if (!governmentId) return;

    this.loadCities(governmentId);
  }

  private loadCities(governmentId: number): void {
    this.isLoadingCities = true;
    this._cdr.detectChanges();

    this._commonDataService.getCitiesByGovernmentId(governmentId).subscribe({
      next: (res) => {
        this.cities = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));
        this.isLoadingCities = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCities = false;
        this._cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this._swal.showToast('يرجى اختيار ملف صورة صالح', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
      this._cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoPreviewUrl = this.defaultAvatar;
    fileInput.value = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._swal.showToast('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'warning');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    const { confirmPassword, ...cleanFormValue } = rawValue;

    const payload: RegisterRequest = {
      userTypeId: this.userTypeId,
      fullName: cleanFormValue.fullName || '',
      username: cleanFormValue.username || '',
      mobile: cleanFormValue.mobile || null,
      mobile2: cleanFormValue.mobile2 || null,
      password: cleanFormValue.password || '',
      email: this.emailFromQuery,
      defaultLang: 'ar',
      photoURL: this.photoPreviewUrl !== this.defaultAvatar ? this.photoPreviewUrl : '',
      governmentId: Number(cleanFormValue.governmentId),
      cityId: Number(cleanFormValue.cityId),
      address: cleanFormValue.address || '',
      appId: 2
    };

    this._registerService.SetRegister(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          localStorage.setItem('usertoken', res.data.token);
          localStorage.setItem('userData', JSON.stringify(res.data));
          const message = this.isOwner
            ? 'تم إنشاء حساب صاحب المطعم بنجاح! مرحباً بك شريكاً لنا'
            : 'تم إنشاء حساب العميل بنجاح! استمتع بأشهى الوجبات والعروض';
          this._swal.showToast(message, 'success');
          this._router.navigate([this.isOwner ? '/dashboard' : '/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this._swal.showToast(err?.error?.message || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً', 'error');
      }
    });
  }
}