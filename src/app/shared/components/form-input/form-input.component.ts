import {
  Component,
  forwardRef,
  input,
  Injector,
  inject,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor, OnInit {
  readonly label = input('');
  readonly placeholder = input('');
  readonly type = input('text');
  readonly autocomplete = input('off');

  value: any = null;
  disabled = false;
  touched = false;
  showPassword = false;

  control: NgControl | null = null;
  private injector = inject(Injector);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get isPasswordType(): boolean {
    return this.type() === 'password';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  ngOnInit(): void {
    // الحصول على NgControl المربوط بالمكون (مثل formControlName="username")
    this.control = this.injector.get(NgControl, null);
  }

  // خاصية للتحقق مما إذا كان هناك أخطاء والحقل تم لمسه أو تعديله
  get isInvalid(): boolean {
    return !!(
      this.control &&
      this.control.invalid &&
      (this.control.touched || this.control.dirty)
    );
  }

  // خاصية للتحقق مما إذا كان المدخل صحيحاً
  get isValid(): boolean {
    return !!(
      this.control &&
      this.control.valid &&
      (this.control.touched || this.control.dirty)
    );
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.touched = true;
    this.onTouched();
  }
}