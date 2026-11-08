import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reject-order-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reject-order-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RejectOrderModalComponent {
  readonly orderNumber = input<string>('');
  readonly customerName = input<string>('');

  readonly close = output<void>();
  readonly confirm = output<string>();

  readonly reason = signal<string>('');
  readonly errorMessage = signal<string | null>(null);

  onReasonInput(value: string): void {
    this.reason.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set(null);
    }
  }

  submit(): void {
    const val = this.reason().trim();
    if (!val) {
      this.errorMessage.set('يرجى كتابة سبب الرفض');
      return;
    }
    this.confirm.emit(val);
  }
}

