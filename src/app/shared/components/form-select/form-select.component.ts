import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  DestroyRef,
  inject,
  input,
  output,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NgControl,
  FormsModule,
} from '@angular/forms';
import { FormSelectOption } from '../../models/form-select-option.model';
@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-select.component.html',
  styleUrl: './form-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSelectComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly id = input<string>('');
  readonly options = input<FormSelectOption[] | any[]>([]);
  readonly disabledInput = input<boolean>(false, { alias: 'disabled' });
  readonly errorMessage = input<string>('');
  readonly customErrors = input<Record<string, string>>({});

  readonly selectionChange = output<any>();
  readonly change = output<Event>();

  value: any = '';
  disabled = false;

  public readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.disabledInput()) {
      this.disabled = true;
    }
  }

  /**
   * Touched/dirty/status changes made by the parent (e.g. markAllAsTouched on submit)
   * do not mark this OnPush view dirty, so listen to the control's events.
   */
  ngAfterViewInit(): void {
    this.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
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

  get resolvedError(): string | null {
    const c = this.control;
    if (!c || !c.errors || !this.isInvalid) {
      return null;
    }

    if (this.errorMessage()) {
      return this.errorMessage();
    }

    const errors = c.errors;
    const custom = this.customErrors();

    for (const key of Object.keys(errors)) {
      if (custom[key]) {
        return custom[key];
      }
      if (key === 'required') {
        return 'هذا الحقل مطلوب';
      }
    }

    return 'البيانات المدخلة غير صحيحة';
  }

  writeValue(val: any): void {
    this.value = val !== null && val !== undefined ? val : '';
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

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const rawVal = select.value;

    // Preserve original option value type (number, string, etc.)
    const matched = this.options().find(
      (opt: any) => String(opt.value ?? opt.id ?? '') === String(rawVal)
    );

    this.value = matched ? (matched.value ?? matched.id) : rawVal;

    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.change.emit(event);
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.onTouched();
  }
}
