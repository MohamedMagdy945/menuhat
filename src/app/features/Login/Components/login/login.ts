import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly _AuthServices = inject(LoginService);
  private readonly _Router = inject(Router);

  ErrorMsg = '';
  loginForm!: FormGroup;
  showPassword = false;
  appId = 2;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      mobile: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.ErrorMsg = '';

    const loginData = {
      appId: this.appId,
      mobile: this.loginForm.value.mobile,
      password: this.loginForm.value.password
    };

    this._AuthServices.SetLoginForm(loginData).subscribe({

      next: (res) => {

        if (res.message === 'LoggedIn Successfully') {
          localStorage.setItem(
            'usertoken',
            res.data.token
          );

          this._AuthServices.SaveUserData();

          this._Router.navigate(['/home']);
        }
      },

      error: (err: HttpErrorResponse) => {
        this.ErrorMsg =
          err.error?.message ||
          'حدث خطأ أثناء تسجيل الدخول';

        console.log('Login Error:', err);
      }

    });
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
  }
}
