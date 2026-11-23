import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SearchResultItem } from '../../models/search-result-item.model';
import { resolveSearchImageUrl, useFallbackImage } from '../../utils/search-image-url';

@Component({
  selector: 'app-search-menu-item-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './search-menu-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchMenuItemCardComponent {
  readonly menuItem = input.required<SearchResultItem>();

  readonly imageUrl = computed(() =>
    resolveSearchImageUrl(this.menuItem().imagePath, this.menuItem().fallbackImage),
  );

  onImageError(event: Event): void {
    useFallbackImage(event, this.menuItem().fallbackImage);
  }
}
