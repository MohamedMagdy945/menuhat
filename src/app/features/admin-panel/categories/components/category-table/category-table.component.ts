import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminCategoryTile } from '../../models/admin-category-tile.model';

/** Table of main or sub categories (order, photo + names, subtitle column, actions). */
@Component({
  selector: 'app-admin-category-table',
  imports: [RouterLink],
  templateUrl: './category-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AdminCategoryTableComponent {
  readonly rows = input.required<AdminCategoryTile[]>();
  /** Header of the subtitle column (e.g. "المطعم" / "الوصف"). */
  readonly subtitleLabel = input('التفاصيل');
  /** Id of the row being deleted. */
  readonly deletingId = input<number | null>(null);
  /** Dims the rows while a new page loads. */
  readonly loading = input(false);

  readonly delete = output<number>();

  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/images/default.png')) img.src = '/images/default.png';
  }
}
