import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { APP_ID } from '../../../../core/constants/app.constants';
import { ToastService } from '../../../../core/services/toast.service';
import { PhoneVerificationService } from '../../../auth/services/phone-verification.service';
import { CheckoutContactService } from '../../checkout-contact.service';

/** Egyptian mobile number, same rule as the auth phone-verification page. */
const PHONE_PATTERN = /^01[0125][0-9]{8}$/;
const OTP_LENGTH = 6;
const RESEND_SECONDS = 55;

/**
 * Adds a new phone number to the account: send code → enter OTP → verified.
 * Uses the auth PhoneVerificationService, then reloads the user's verified numbers.
 */
@Component({
  selector: 'app-add-phone-dialog',
  imports: [FormsModule],
  templateUrl: './add-phone-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPhoneDialogComponent {
  private readonly _phoneVerification = inject(PhoneVerificationService);
  private readonly _contactService = inject(CheckoutContactService);
  private readonly _toast = inject(ToastService);

  readonly isOpen = input<boolean>(false);

  /** Emits the number as stored by the backend (from the refreshed list) once verified. */
  readonly verified = output<string>();
  readonly closed = output<void>();

  readonly step = signal<'phone' | 'otp'>('phone');
  readonly phone = signal('');
  readonly otp = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly timeLeft = signal(0);

  readonly isPhoneValid = computed(() => PHONE_PATTERN.test(this.phone().trim()));
  readonly isOtpComplete = computed(() => this.otp().length === OTP_LENGTH);
  readonly otpLength = OTP_LENGTH;

  private _timer?: Subscription;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        untracked(() => this.reset());
      }
    });
    inject(DestroyRef).onDestroy(() => this._timer?.unsubscribe());
  }

  onPhoneInput(value: string): void {
    this.phone.set(value.replace(/[^0-9]/g, '').slice(0, 11));
    this.errorMessage.set(null);
  }

  onOtpInput(value: string): void {
    this.otp.set(value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH));
    this.errorMessage.set(null);
  }

  sendCode(): void {
    if (!this.isPhoneValid()) {
      this.errorMessage.set('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01xxxxxxxxx)');
      return;
    }
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._phoneVerification.recievePhoneVerification(this.phone().trim(), APP_ID).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.otp.set('');
        this.step.set('otp');
        this.startTimer();
        this._toast.success('تم إرسال رمز التحقق إلى رقم هاتفك');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'حدث خطأ أثناء إرسال رمز التحقق، يرجى المحاولة مرة أخرى',
        );
      },
    });
  }

  verifyCode(): void {
    if (!this.isOtpComplete() || this.isLoading()) return;

    const knownNumbers = new Set(this._contactService.phones());
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._phoneVerification.checkVerified(this.phone().trim(), this.otp(), APP_ID).subscribe({
      next: () => {
        // Refresh the verified numbers so the new one appears in the checkout.
        this._contactService.loadPhones().subscribe({
          next: (list) => this.finish(list.find((n) => !knownNumbers.has(n))),
          error: () => this.finish(undefined),
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى');
      },
    });
  }

  resendCode(): void {
    if (this.timeLeft() > 0) return;
    this.sendCode();
  }

  changePhone(): void {
    this._timer?.unsubscribe();
    this.step.set('phone');
    this.otp.set('');
    this.errorMessage.set(null);
  }

  close(): void {
    if (this.isLoading()) return;
    this._timer?.unsubscribe();
    this.closed.emit();
  }

  private finish(storedNumber: string | undefined): void {
    this.isLoading.set(false);
    this._timer?.unsubscribe();
    this._toast.success('تم التحقق من رقم الهاتف وإضافته');
    // The backend may store the number with a country code (e.g. 2010…): prefer its own format.
    this.verified.emit(storedNumber ?? this.phone().trim());
  }

  private startTimer(): void {
    this._timer?.unsubscribe();
    this.timeLeft.set(RESEND_SECONDS);
    this._timer = timer(1000, 1000).subscribe(() => {
      this.timeLeft.update((t) => Math.max(t - 1, 0));
      if (this.timeLeft() === 0) {
        this._timer?.unsubscribe();
      }
    });
  }

  private reset(): void {
    this._timer?.unsubscribe();
    this.step.set('phone');
    this.phone.set('');
    this.otp.set('');
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.timeLeft.set(0);
  }
}
