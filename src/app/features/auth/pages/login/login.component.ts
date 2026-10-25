import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { LoginRequest, LoginResponse } from '../../models';
import { UserDataService } from '../../../../core/services/userData.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
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
export class LoginComponent implements OnInit {


  private readonly _fb = inject(FormBuilder);
  private readonly _AuthServices = inject(LoginService);
  private readonly _Router = inject(Router);
  private readonly _userDataService = inject(UserDataService);
  private readonly _cdr = inject(ChangeDetectorRef);

  loginForm!: FormGroup;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
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

  ngOnInit(): void {
    this.loginForm = this._fb.group({
      mobile: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
        this._cdr.detectChanges();
      }
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

    this.isLoading.set(true);
    this.errorMessage.set('');

    const loginData: LoginRequest = {
      appId: this.appId,
      mobile: this.loginForm.value.mobile,
      password: this.loginForm.value.password
    };

    this._AuthServices.login(loginData)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this._cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: LoginResponse) => {
          if (res && res.data) {
            this._userDataService.setUserData(res.data, res.data.token);
            this._Router.navigate(['/home']);
          } else {
            this.errorMessage.set(res?.message || 'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات والمحاولة مجدداً');
            this._cdr.detectChanges();
          }
        },
        error: (err: HttpErrorResponse) => {
          const message =
            err?.error?.message ||
            (typeof err?.error === 'string' ? err.error : null) ||
            (err?.status === 401 ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : null) ||
            'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات والمحاولة مجدداً';
          this.errorMessage.set(message);
          this._cdr.detectChanges();
        }
      });
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
  }
}

export { LoginComponent as Login };

