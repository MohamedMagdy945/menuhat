import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuRestaurantCardData {
  id: number;
  name: string;
  location: string;
  isOpen: boolean;
  isVisible: boolean;
  coverUrl: string;
  profileUrl: string;
  pdfUrl: string;
  qrCodeUrl: string;
  visitsCount: number;
}

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

