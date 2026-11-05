import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { timer, Subscription } from 'rxjs';
import { PhoneVerificationService } from '../../services/phone-verification.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

@Component({
  selector: 'app-send-mobile-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormInputComponent,
    LoadingButtonComponent
  ],
  templateUrl: './send-mobile-verification.component.html',
  styleUrl: './send-mobile-verification.component.css'
})
export class SendMobileVerificationComponent implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _phoneService = inject(PhoneVerificationService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _toast = inject(ToastService);
  private readonly _cdr = inject(ChangeDetectorRef);

  step = signal<'phone' | 'otp'>('phone');
  isLoading = signal<boolean>(false);

  phoneForm!: FormGroup;
  phone: string = '';
  role: 'owner' | 'customer' = 'owner';

  // OTP State
  otpDigits: string[] = ['', '', '', '', '', ''];
  timeLeft: number = 55;
  private timerSubscription?: Subscription;

  readonly validationMessages = {
    phone: {
      required: 'رقم الهاتف مطلوب',
      pattern: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01xxxxxxxxx)'
    }
  };

  get isVerifyDisabled(): boolean {
    return this.otpDigits.join('').length < 6 || this.isLoading();
  }

  ngOnInit(): void {
    this.phoneForm = this._fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]]
    });

    this._route.queryParams.subscribe(params => {
      this.role = params['role'] === 'customer' ? 'customer' : 'owner';
      const phoneParam = params['phone'] || '';

      if (phoneParam) {
        this.phone = phoneParam;
        this.phoneForm.patchValue({ phone: phoneParam });

        // If arrived with a valid phone from register, auto-send code
        if (/^01[0125][0-9]{8}$/.test(phoneParam)) {
          this.sendPhoneVerification(phoneParam);
        }
      }
    });
  }

  onSendCode(): void {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this._toast.warning('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    const phoneValue = this.phoneForm.get('phone')?.value;
    this.sendPhoneVerification(phoneValue);
  }

  sendPhoneVerification(phone: string): void {
    this.phone = phone;
    this.isLoading.set(true);

    this._phoneService.recievePhoneVerification(phone, 2).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set('otp');
        this.otpDigits = ['', '', '', '', '', ''];
        this.startTimer();
        this._toast.success('تم إرسال رمز التحقق إلى رقم هاتفك');
        this._cdr.detectChanges();

        // Focus first OTP input
        setTimeout(() => {
          const firstInput = document.getElementById('otp-input-0') as HTMLInputElement;
          if (firstInput) firstInput.focus();
        }, 100);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'حدث خطأ أثناء إرسال رمز التحقق، يرجى المحاولة مرة أخرى';
        this._toast.error(msg);
        this._cdr.detectChanges();
      }
    });
  }

  startTimer(): void {
    this.timeLeft = 55;
    this.timerSubscription?.unsubscribe();

    this.timerSubscription = timer(0, 1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerSubscription?.unsubscribe();
      }
      this._cdr.detectChanges();
    });
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');

    if (value.length > 1) {
      const digits = value.split('').slice(0, 6);
      digits.forEach((digit, i) => {
        if (i < 6) {
          this.otpDigits[i] = digit;
          const inputElem = document.getElementById(`otp-input-${i}`) as HTMLInputElement;
          if (inputElem) inputElem.value = digit;
        }
      });

      const lastIndex = Math.min(digits.length, 5);
      const nextElem = document.getElementById(`otp-input-${lastIndex}`) as HTMLInputElement;
      if (nextElem) nextElem.focus();
      return;
    }

    this.otpDigits[index] = value;
    input.value = value;

    if (value && index < 5) {
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        setTimeout(() => {
          const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
            this.otpDigits[index - 1] = '';
            prevInput.value = '';
          }
        }, 10);
      }
    }
  }

  onVerifyCode(): void {
    const otpCode = this.otpDigits.join('');

    if (otpCode.length < 6) {
      this._toast.warning('يرجى إدخال رمز التحقق كاملاً (6 أرقام)');
      return;
    }

    if (!this.phone) {
      this._toast.error('رقم الهاتف غير متاح، يرجى إعادة محاولة الإرسال');
      this.step.set('phone');
      return;
    }

    this.isLoading.set(true);

    this._phoneService.checkVerified(this.phone, otpCode, 2).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._toast.success('تم التحقق من رقم الهاتف بنجاح! مرحباً بك');

        // Go to create restaurant page for owner, home for customer
        if (this.role === 'owner') {
          this._router.navigate(['/create-restaurant']);
        } else {
          this._router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى';
        this._toast.error(msg);
        this._cdr.detectChanges();
      }
    });
  }

  resendCode(): void {
    if (!this.phone) return;
    this.sendPhoneVerification(this.phone);
  }

  changePhone(): void {
    this.step.set('phone');
    this.timerSubscription?.unsubscribe();
    this.otpDigits = ['', '', '', '', '', ''];
    this._cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }
}

export { SendMobileVerificationComponent as SendMobileVerification };

