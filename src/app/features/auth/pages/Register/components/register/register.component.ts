import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { SweetAlertService } from '../../../../../../core/sweet-alert/sweet-alert';
import { CommonDateService, DropdownItem } from '../../../../../../core/CommonData/common-date';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgClass],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class Register implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly commonDataService = inject(CommonDateService);
  private readonly registerService = inject(RegisterService);
  private readonly swal = inject(SweetAlertService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly defaultAvatar: string = '/icons/default-avatar.webp';
  readonly passwordPattern = '^(?=.{6,20}$)(?![0-9]+$)(?!.*@)[a-zA-Z0-9._]+$';
  readonly usernamePattern = '^(?=.{6,20}$)(?![0-9]+$)(?!.*@)[a-zA-Z0-9._]+$';

  registerForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword:boolean = false;
  isLoading: boolean = false;
  email: string = '';
  photoBase64: string = '';
  photoPreviewUrl: string = '';

  governorates: DropdownItem[] = [];
  cities: DropdownItem[] = [];
  isLoadingCities: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });

    this.photoPreviewUrl = this.defaultAvatar;
    this.initForm();
    this.loadGovernorates();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      username: ['', [
        Validators.required, 
        Validators.pattern(this.usernamePattern)
      ]],
      
      password: ['', [
        Validators.required, 
        Validators.pattern(this.passwordPattern)
      ]],
      
      confirmPassword: ['', [Validators.required]],
      governmentId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      address: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  // 1. استلام الملف وتطبيق الضغط الفوري
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      this.compressAndConvertToBase64(file, 500, 0.7, (compressedBase64) => {
        this.photoPreviewUrl = compressedBase64;
        this.photoBase64 = compressedBase64;
        this.cdr.detectChanges();
      });
    }
  }

  // 2. دالة ضغط الصورة وتقليل أبعادها باستخدام Canvas
  private compressAndConvertToBase64(
    file: File, 
    maxWidth: number, 
    quality: number, 
    callback: (base64: string) => void
  ): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // ضبط الأبعاد بدون تشويه نسبة الطول للعرض
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل الصورة إلى JPEG مضغوطة وسريعة التحميل
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        callback(compressedBase64);
      };
    };
  }
  
  passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
  } else {
    // إزالة الخطأ عند تطابقهما
    if (control.get('confirmPassword')?.hasError('passwordMismatch')) {
      control.get('confirmPassword')?.setErrors(null);
    }
  }
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoPreviewUrl = this.defaultAvatar;
    this.photoBase64 = '';
    fileInput.value = ''; 
    this.cdr.detectChanges();
  }

  loadGovernorates(): void {
    this.commonDataService.getGovernments().subscribe({
      next: (data) => (this.governorates = data),
      error: () => this.swal.showAlert('حدث خطأ أثناء جلب المحافظات', 'error')
    });
  }

  onGovernorateChange(event: Event): void {
    const selectedGovId = (event.target as HTMLSelectElement).value;
    if (!selectedGovId) return;

    this.registerForm.patchValue({ cityId: '' });
    this.cities = [];
    this.isLoadingCities = true;

    this.commonDataService.getCitiesByGovernmentId(Number(selectedGovId)).subscribe({
      next: (data) => {
        this.cities = data;
        this.isLoadingCities = false;
      },
      error: () => {
        this.isLoadingCities = false;
        this.swal.showAlert('حدث خطأ أثناء جلب المدن', 'error');
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    console.log('Form Errors:', this.registerForm.errors);
Object.keys(this.registerForm.controls).forEach(key => {
  const controlErrors = this.registerForm.get(key)?.errors;
  if (controlErrors) {
    console.log(`Field [${key}] Errors:`, controlErrors);
  }
});

    console.log("registerForm", this.registerForm.value);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.swal.showToast('يرجى ملء كافة البيانات المطلوبة', 'warning');
      return;
    }

    this.isLoading = true;

    const payload = {
      userTypeId: 3,
      fullName: this.registerForm.value.fullName,
      mobile: null,
      mobile2: null,
      password: this.registerForm.value.password,
      username: this.registerForm.value.username,
      email: this.email,
      defaultLang: 'ar',
      photoURL: this.photoBase64 || '',
      governmentId: Number(this.registerForm.value.governmentId),
      cityId: Number(this.registerForm.value.cityId),
      address: this.registerForm.value.address,
      appId: 2
    };
console.log("payload", payload);
    this.registerService.SetRegister(payload).subscribe({
      next: (res) => {
         console.log("res", res)
        this.isLoading = false;
        this.swal.showToast('تم التسجيل بنجاح!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
         console.log("err", err)
        this.isLoading = false;
        const errorMsg = err?.error?.message || 'حدث خطأ أثناء إتمام عملية التسجيل';
        this.swal.showAlert(errorMsg, 'error');
      }
    });
  }
}