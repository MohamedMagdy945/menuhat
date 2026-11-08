import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accept-order-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-order-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptOrderModalComponent {
  readonly orderNumber = input<string>('');
  readonly customerName = input<string>('');
  readonly orderType = input<string>('طلب توصيل (دليفري)');
  readonly isDelivery = input<boolean>(true);

  readonly close = output<void>();
  readonly confirm = output<{ deliveryFee?: number }>();

  readonly deliveryFee = signal<string>('15.00');

  onFeeChange(value: string): void {
    this.deliveryFee.set(value);
  }

  submit(): void {
    const feeNum = parseFloat(this.deliveryFee());
    this.confirm.emit({
      deliveryFee: !isNaN(feeNum) && feeNum > 0 ? feeNum : undefined,
    });
  }
}

