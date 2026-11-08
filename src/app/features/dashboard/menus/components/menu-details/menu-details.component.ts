import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuRestaurantCardData } from '../menu-card/menu-card.component';

@Component({
  selector: 'app-menu-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDetailsComponent {
  readonly restaurant = input.required<MenuRestaurantCardData>();
  readonly isMenuClosed = input<boolean>(false);
  readonly isMenuHidden = input<boolean>(true);

  readonly onOpenElectronicMenu = output<void>();
  readonly onOpenPaperMenu = output<void>();
  readonly onOpenQrModal = output<void>();
  readonly onToggleCloseMenu = output<void>();
  readonly onToggleHideMenu = output<void>();
  readonly onOpenEditInfo = output<void>();
  readonly onOpenCategories = output<void>();
  readonly onOpenSubCategories = output<void>();
  readonly onOpenDeletePdf = output<void>();
}

