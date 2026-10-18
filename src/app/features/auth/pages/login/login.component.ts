import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { LoginRequest, LoginResponse } from '../../models';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { UserDataService } from '../../../../core/services/userData.service';
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
  private readonly _userDataService = inject(UserDataService);

  loginForm!: FormGroup;
  isLoading = false;
  appId = 2;

  readonly validationMessages = {
    mobile: {
      required: 'البريد الإلكتروني أو رقم الهاتف مطلوب',
      email: 'يرجى إدخال بريد إلكتروني صحيح',
      pattern: 'يرجى إدخال رقم هاتف صحيح أو بريد إلكتروني صالح'
    },
    password: {
      required: 'كلمة المرور مطلوبة'
    }
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required]]
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

    const loginData: LoginRequest = {
      appId: this.appId,
      mobile: this.loginForm.value.mobile,
      password: this.loginForm.value.password
    };

    this._AuthServices.login(loginData).subscribe({
      next: (res: LoginResponse) => {
        this.isLoading = false;
        if (res && res.data) {
          this._userDataService.setUserData(res.data, res.data.token);
          this._SweetAlertService.showToast(res.message || 'تم تسجيل الدخول بنجاح', 'success');
          this._Router.navigate(['/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this._SweetAlertService.showToast(
          err?.error?.message || 'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات والمحاولة مجدداً',
          'error'
        );
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
  }
}
