import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { OwnerOrderDetails } from '../../models';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './order-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  readonly order = input.required<OwnerOrderDetails>();
  readonly actionInProgress = input<boolean>(false);
  readonly onReceive = output<void>();
  readonly onCancel = output<void>();
  readonly onPrint = output<void>();
}

