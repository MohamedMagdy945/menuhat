import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { timer, Subscription } from 'rxjs';
import { RegisterService } from '../../services/register.service';
import { SweetAlertService } from '../../../../../../core/sweet-alert/sweet-alert';

export interface ValidateOtpPayload {
  email: string;
  otp: string;
  appId: number;
}

@Component({
  selector: 'app-validate-otp',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './validate-otp.component.html',
  styleUrls: ['./validate-otp.component.css']
})
export class ValidateOtp implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registerService = inject(RegisterService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly swal = inject(SweetAlertService);

  email: string = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  timeLeft: number = 55;
  private timerSubscription?: Subscription;

  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
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
      this.swal.showToast('يرجى إدخال رمز التحقق كاملاً (6 أرقام)', 'warning');
      return;
    }

    if (!this.email) {
      this.swal.showAlert('البريد الإلكتروني غير متاح، يرجى إعادة محاولة الإرسال', 'error');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: ValidateOtpPayload = {
      email: this.email,
      otp: otpCode,
      appId: 2
    };

    this.registerService.ValidateOtp(payload).subscribe({
      next: (response) => {
          this.swal.showToast('تم التحقق بنجاح, يرجي تسجيل بياناتك الأن', 'success');      
          this.router.navigate(['/register'], { queryParams: { email: this.email } });
      },
      error: (err) => {
        this.swal.showAlert(err.error?.message,'error');
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
        this.swal.showToast('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني', 'info');
      },
      error: (err) => {
        this.isLoading = false;
        const msg = 'حدث خطأ أثناء إعادة إرسال الرمز';
        this.swal.showAlert(msg, 'error');
      }
    });
  }

  changeEmail(): void {
    this.router.navigate(['/sendEmail']);
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }
}