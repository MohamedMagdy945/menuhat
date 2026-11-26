import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminProductRow } from '../../models/admin-product-row.model';

/** Table of products (photo + names, price, category path, restaurant, actions). */
@Component({
  selector: 'app-admin-product-table',
  imports: [RouterLink],
  templateUrl: './product-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AdminProductTableComponent {
  readonly rows = input.required<AdminProductRow[]>();
  /** Hide the restaurant column when the list is already scoped to one restaurant. */
  readonly showRestaurant = input(true);
  /** Query params added to the edit links (keeps the list scope for the way back). */
  readonly linkQueryParams = input<Record<string, number>>({});
  /** Id of the row being deleted. */
  readonly deletingId = input<number | null>(null);
  /** Dims the rows while a new page loads. */
  readonly loading = input(false);

  readonly delete = output<number>();

  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/images/default-meal.png')) img.src = '/images/default-meal.png';
  }
}
