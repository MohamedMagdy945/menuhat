import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuRestaurantCardData } from '../../models/menu-restaurant-card.model';

@Component({
  selector: 'app-menu-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCardComponent {
  readonly restaurant = input.required<MenuRestaurantCardData>();
  readonly onViewDetails = output<void>();
}
