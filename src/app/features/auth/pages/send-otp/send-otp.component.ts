import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-send-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    LoadingButtonComponent,
  ],
  styleUrl: './send-otp.component.css',
  templateUrl: './send-otp.component.html',
})
export class SendOtpComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  role: 'owner' | 'customer' = 'customer';
  signupForm!: FormGroup;
  readonly isLoading = signal<boolean>(false);

  readonly validationMessages = {
    email: {
      required: 'البريد الإلكتروني مطلوب',
      email: 'يرجى إدخال بريد إلكتروني صحيح'
    }
  };

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.queryParams.subscribe(params => {
      this.role = params['role'] === 'owner' ? 'owner' : 'customer';
    });
  }

  onSendCode(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const payload = {
      email: this.signupForm.value.email,
      appId: 2,
      isForRegister: true
    };

    this._registerServiceSend(payload);
  }

  private _registerServiceSend(payload: { email: string; appId: number; isForRegister: boolean }): void {
    this.registerService.sendemail(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        this.router.navigate(['/validate-otp'], {
          queryParams: {
            email: this.signupForm.value.email,
            role: this.role
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'حدث خطأ أثناء إرسال الرمز، يرجى المحاولة مرة أخرى';
        this.toast.error(msg);
      }
    });
  }
}

export { SendOtpComponent as SendOtp };
