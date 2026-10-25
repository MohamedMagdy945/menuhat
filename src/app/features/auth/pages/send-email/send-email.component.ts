import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    LoadingButtonComponent,
  ],
  styleUrl: './send-email.component.css',
  templateUrl: './send-email.component.html',
})
export class SendEmailComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _registerService = inject(RegisterService);
  private readonly _Route = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _SweetAlertService = inject(SweetAlertService);

  role: 'owner' | 'customer' = 'customer';

  signupForm!: FormGroup;
  isCodeSent: boolean = false;
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  readonly validationMessages = {
    email: {
      required: 'البريد الإلكتروني مطلوب',
      email: 'يرجى إدخال بريد إلكتروني صحيح'
    }
  };

  otpDigits: string[] = ['', '', '', '', '', ''];
  timer: number = 55;
  intervalId: any;

  ngOnInit(): void {
    this.signupForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.signupForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set('');
      }
    });

    this._route.queryParams.subscribe(params => {
      this.role = params['role'] === 'owner' ? 'owner' : 'customer';
    });
  }

  get emailControl() {
    return this.signupForm.get('email');
  }

  onSendCode(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      email: this.signupForm.value.email,
      appId: 2,
      isForRegister: true
    };

    this._registerService.sendemail(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isCodeSent = true;
        this.startTimer();

        this._Route.navigate(['/validate-otp'], {
          queryParams: {
            email: this.signupForm.value.email,
            role: this.role
          }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'حدث خطأ أثناء إرسال الرمز، يرجى المحاولة مرة أخرى';
        this.errorMessage.set(msg);
        this._SweetAlertService.showAlert(msg, 'error');
      }
    });
  }

  onOtpInput(event: any, index: number): void {
    const value = event.target.value;
    this.otpDigits[index] = value;

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }

  startTimer(): void {
    this.timer = 55;
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendCode(): void {
    this.onSendCode();
  }

  changeEmail(): void {
    this.isCodeSent = false;
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onVerifyCode(): void {
    const code = this.otpDigits.join('');
    console.log('OTP Entered:', code);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export { SendEmailComponent as SendEmail };