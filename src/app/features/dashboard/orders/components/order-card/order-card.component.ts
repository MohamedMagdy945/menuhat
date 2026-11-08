import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderCardData } from '../../models';


@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  readonly order = input.required<OrderCardData>();

  readonly onAccept = output<string | number>();
  readonly onReject = output<string | number>();

  handleAccept(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.onAccept.emit(this.order().id);
  }

  handleReject(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.onReject.emit(this.order().id);
  }
}

