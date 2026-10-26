import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { timer, Subscription } from 'rxjs';
import { RegisterService } from '../../services/register.service';
import { ToastService } from '../../../../core/services/toast.service';

import { LoadingButtonComponent } from '../../../../shared/components/loading-button/loading-button.component';

export interface ValidateOtpPayload {
  email: string;
  otp: string;
  appId: number;
}

@Component({
  selector: 'app-validate-otp',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingButtonComponent],
  templateUrl: './validate-otp.component.html',
  styleUrls: ['./validate-otp.component.css']
})
export class ValidateOtpComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registerService = inject(RegisterService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  get isVerifyDisabled(): boolean {
    return this.otpDigits.join('').length < 6 || this.isLoading;
  }

  email: string = '';
  role: 'owner' | 'customer' = 'customer';
  otpDigits: string[] = ['', '', '', '', '', ''];
  timeLeft: number = 55;
  private timerSubscription?: Subscription;

  isLoading: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.role = params['role'] === 'owner' ? 'owner' : 'customer';
    });

    this.startTimer();
  }

  trackByIndex(index: number): number {
    return index;
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
      this.cdr.detectChanges();
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
      this.toast.warning('يرجى إدخال رمز التحقق كاملاً (6 أرقام)');
      return;
    }

    if (!this.email) {
      this.toast.error('البريد الإلكتروني غير متاح، يرجى إعادة محاولة الإرسال');
      return;
    }

    this.isLoading = true;

    const payload: ValidateOtpPayload = {
      email: this.email,
      otp: otpCode,
      appId: 2
    };

    this.registerService.ValidateOtp(payload).subscribe({
      next: (response) => {
        this.toast.success('تم التحقق بنجاح, يرجي تسجيل بياناتك الأن');
        const userTypeId = this.role === 'owner' ? 1 : 3;
        this.router.navigate(['/register'], {
          queryParams: {
            email: this.email,
            userTypeId: userTypeId,
            role: this.role
          }
        });
      },

      error: (err) => {
        this.toast.error(err.error?.message || 'رمز التحقق غير صحيح');
        this.isLoading = false;
      }
    });
  }

  resendCode(): void {
    if (!this.email) return;

    this.isLoading = true;

    const payload = {
      email: this.email,
      appId: 2,
      isForRegister: true
    };

    this.registerService.sendemail(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.startTimer();
        this.toast.info('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني');
      },
      error: (err) => {
        this.isLoading = false;
        const msg = 'حدث خطأ أثناء إعادة إرسال الرمز';
        this.toast.error(msg);
      }
    });
  }

  changeEmail(): void {
    this.router.navigate(['/send-otp'], { queryParams: { role: this.role } });
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }
}

export { ValidateOtpComponent as ValidateOtp };
