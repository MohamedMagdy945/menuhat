import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class Login {

  private readonly _AuthServices = inject(LoginService);
  private readonly _Router = inject(Router);
  private readonly _SweetAlertService = inject(SweetAlertService);

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

    const loginData = {
      appId: this.appId,
      mobile: this.loginForm.value.mobile,
      password: this.loginForm.value.password
    };

    this._AuthServices.SetLoginForm(loginData).subscribe({
      next: (res) => {
        console.log(res);
        if (res && res.data) {
          // 1. حفظ الـ Token
          localStorage.setItem('usertoken', res.data.token);

          localStorage.setItem('userData', JSON.stringify(res.data));

          this._AuthServices.SaveUserData(res.data);

          this._Router.navigate(['/home']);
        }
      },

      error: (err: HttpErrorResponse) => {
        this._SweetAlertService.showToast(err?.error?.message, 'error');
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Logging in with Google...');
  }
}
