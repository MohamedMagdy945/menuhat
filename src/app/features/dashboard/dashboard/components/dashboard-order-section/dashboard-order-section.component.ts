import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderCardData } from '../../../orders/models/order-card-data.model';
import { DashboardOrderCardComponent } from '../dashboard-order-card/dashboard-order-card.component';

@Component({
  selector: 'app-dashboard-order-section',
  standalone: true,
  imports: [CommonModule, RouterLink, DashboardOrderCardComponent],
  templateUrl: './dashboard-order-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOrderSectionComponent {
  readonly orders = input.required<OrderCardData[]>();
}

