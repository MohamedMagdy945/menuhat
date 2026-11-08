import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderCardData } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-order-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-order-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOrderCardComponent {
  readonly order = input.required<OrderCardData>();
}

