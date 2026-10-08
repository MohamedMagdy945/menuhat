import {
  Component,
  input,
  inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.css',
})
export class FormInputComponent implements ControlValueAccessor, OnInit {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly autocomplete = input<string>('off');
  readonly errorMessage = input<string>('');
  readonly customErrors = input<Record<string, string>>({});
  readonly id = input<string>('');

  value: any = '';
  disabled = false;
  showPassword = false;

  public readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {}

  get isPasswordType(): boolean {
    return this.type() === 'password';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get control() {
    return this.ngControl?.control;
  }

  get isInvalid(): boolean {
    const c = this.control;
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  get isValid(): boolean {
    const c = this.control;
    return !!(c && c.valid && (c.touched || c.dirty));
  }

  /**
   * استخراج رسالة الخطأ الواحدة النشطة حالياً للحقل
   */
  get resolvedError(): string | null {
    const c = this.control;
    if (!c || !c.errors || !this.isInvalid) {
      return null;
    }

    // إذا تم تمرير رسالة ثابتة
    if (this.errorMessage()) {
      return this.errorMessage();
    }

    const errors = c.errors;
    const custom = this.customErrors();

    // فحص الخطأ النشط وإرجاع رسالته المحددة فقط
    for (const key of Object.keys(errors)) {
      if (custom[key]) {
        return custom[key];
      }

      switch (key) {
        case 'required':
          return 'هذا الحقل مطلوب';
        case 'email':
          return 'يرجى إدخال بريد إلكتروني صحيح';
        case 'minlength': {
          const reqLen = errors['minlength']?.requiredLength ?? 6;
          return `يجب إدخال ${reqLen} أحرف على الأقل`;
        }
        case 'maxlength': {
          const maxLen = errors['maxlength']?.requiredLength;
          return `الحد الأقصى هو ${maxLen} أحرف`;
        }
        case 'pattern':
          return 'صيغة الإدخال غير صحيحة';
        case 'missmatch':
          return 'كلمة المرور غير متطابقة';
        default:
          if (typeof errors[key] === 'string') {
            return errors[key];
          } else if (errors[key]?.message) {
            return errors[key].message;
          }
          return 'البيانات المدخلة غير صحيحة';
      }
    }

    return null;
  }

  writeValue(val: any): void {
    this.value = val ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}