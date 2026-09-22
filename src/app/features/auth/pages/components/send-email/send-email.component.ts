import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../register/register.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  selector: 'app-send-email',
  styleUrl: './send-email.component.css',
  templateUrl: './send-email.component.html',
})
export class SendEmail implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _registerService = inject(RegisterService);
  private readonly _Route = inject(Router);

  signupForm!: FormGroup;
  isCodeSent: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  otpDigits: string[] = ['', '', '', '', '', ''];
  timer: number = 55;
  intervalId: any;

  ngOnInit(): void {
    this.signupForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get emailControl() {
    return this.signupForm.get('email');
  }

  // دالة إرسال الرمز للبريد
  onSendCode(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.signupForm.value.email,
      appId: 2,
      isForRegister: true
    };

    this._registerService.sendemail(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isCodeSent = true;
        this.startTimer();
        console.log('OTP sent successfully:', res);
        this._Route.navigate(['/ValidateOtp']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'حدث خطأ أثناء إرسال الرمز، يرجى المحاولة لاحقاً';
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