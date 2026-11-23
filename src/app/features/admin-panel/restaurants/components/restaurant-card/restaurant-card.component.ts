import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AdminMenu } from '../../models/admin-menu.model';
import { AdminRestaurantRow } from '../../models/admin-restaurant-row.model';

/** One restaurant in the admin restaurants grid. */
@Component({
  selector: 'app-admin-restaurant-card',
  imports: [DecimalPipe],
  templateUrl: './restaurant-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AdminRestaurantCardComponent {
  readonly row = input.required<AdminRestaurantRow>();
  /** True while this restaurant is being deleted. */
  readonly deleting = input(false);

  readonly edit = output<AdminMenu>();
  readonly delete = output<AdminMenu>();

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/images/default-restaurant.png')) {
      img.src = '/images/default-restaurant.png';
    }
  }
}
