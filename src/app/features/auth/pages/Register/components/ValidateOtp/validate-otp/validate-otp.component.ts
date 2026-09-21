import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RegisterService } from '../../../services/register.service';

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

  email: string = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  timer: number = 55;
  intervalId: any;
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    // استقبال الإيميل الممرر عبر Query Params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });

    this.startTimer();
  }

  // التحكم بالتركيز والانتقال الآلي بين خانات الإدخال الـ 6
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

  // إدارة العداد التنازلي
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

  // إرسال طلب التحقق من الـ OTP عبر الـ Service
  onVerifyCode(): void {
    const otpCode = this.otpDigits.join('');

    if (otpCode.length < 6) {
      this.errorMessage = 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: ValidateOtpPayload = {
      email: this.email,
      otp: otpCode,
      appId: 2 
    };

    this.registerService.calidateOtp(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('OTP Validated successfully:', response);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى';
      }
    });
  }

  resendCode(): void {
    if (!this.email) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.email,
      appId: 2,
      isForRegister: true
    };

    this.registerService.sendemail(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.startTimer();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'حدث خطأ أثناء إعادة إرسال الرمز';
      }
    });
  }

  changeEmail(): void {
    this.router.navigate(['/login/sendEmail']);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}