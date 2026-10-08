import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class Login {

  private readonly _AuthServices = inject(LoginService);
  private readonly _Router = inject(Router);
  private readonly _SweetAlertService = inject(SweetAlertService);

  loginForm!: FormGroup;
  isLoading = false;
  appId = 2;

  // Model مركزي لرسائل التحقق والأخطاء الخاصة بالنموذج
  readonly validationMessages = {
    mobile: {
      required: 'البريد الإلكتروني أو رقم الهاتف مطلوب',
      email: 'يرجى إدخال بريد إلكتروني صحيح',
      pattern: 'يرجى إدخال رقم هاتف صحيح أو بريد إلكتروني صالح'
    },
    password: {
      required: 'كلمة المرور مطلوبة',
      minlength: 'يجب ألا تقل كلمة المرور عن 6 أحرف'
    }
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get mobileControl() {
    return this.loginForm.get('mobile');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const loginData = {
      appId: this.appId,
      mobile: this.loginForm.value.mobile,
      password: this.loginForm.value.password
    };

    this._AuthServices.SetLoginForm(loginData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          localStorage.setItem('usertoken', res.data.token);
          localStorage.setItem('userData', JSON.stringify(res.data));
          this._AuthServices.SaveUserData(res.data);
          this._Router.navigate(['/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this._SweetAlertService.showToast(
          err?.error?.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً',
          'error'
        );
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
  }
}
