import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { ConfirmModalState } from '../../models/confirm-modal-state.model';

/** Must match the leave animation duration in confirm-modal.component.css. */
const LEAVE_MS = 180;

/**
 * Confirmation dialog — use instead of the native `confirm()`.
 * Keep it in the template and drive it with `[open]`; it animates in and out by itself.
 * Close it on `cancelled`, or after the confirmed action finishes (pass `loading` meanwhile).
 */
@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cancel()' },
})
export class ConfirmModalComponent {
  readonly open = input(false);
  readonly title = input('تأكيد');
  readonly message = input('');
  readonly confirmText = input('تأكيد');
  readonly cancelText = input('إلغاء');
  readonly icon = input('warning');
  readonly variant = input<'danger' | 'primary'>('danger');
  /** Shows a spinner on the confirm button and blocks closing. */
  readonly loading = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  /** In the DOM (stays true while the leave animation runs). */
  readonly rendered = signal(false);
  readonly closing = signal(false);

  /**
   * Text shown in the dialog. Frozen while closing, so it doesn't go blank when the parent
   * clears the state its inputs come from.
   */
  readonly content = linkedSignal<ConfirmModalState, ConfirmModalState>({
    source: () => ({
      open: this.open(),
      title: this.title(),
      message: this.message(),
      confirmText: this.confirmText(),
      cancelText: this.cancelText(),
      icon: this.icon(),
      variant: this.variant(),
    }),
    computation: (source, previous) => (source.open || !previous ? source : previous.value),
  });

  readonly isDanger = computed(() => this.content().variant === 'danger');

  private _leaveTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const open = this.open();
      clearTimeout(this._leaveTimer);
      if (open) {
        this.closing.set(false);
        this.rendered.set(true);
      } else if (this.rendered()) {
        this.closing.set(true);
        this._leaveTimer = setTimeout(() => {
          this.rendered.set(false);
          this.closing.set(false);
        }, LEAVE_MS);
      }
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this._leaveTimer));
  }

  confirm(): void {
    if (this.open() && !this.closing() && !this.loading()) this.confirmed.emit();
  }

  cancel(): void {
    if (this.open() && !this.closing() && !this.loading()) this.cancelled.emit();
  }
}
