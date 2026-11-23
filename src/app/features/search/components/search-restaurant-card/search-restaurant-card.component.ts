import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchResultItem } from '../../models/search-result-item.model';
import { resolveSearchImageUrl, useFallbackImage } from '../../utils/search-image-url';

@Component({
  selector: 'app-search-restaurant-card',
  imports: [RouterLink],
  templateUrl: './search-restaurant-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchRestaurantCardComponent {
  readonly restaurant = input.required<SearchResultItem>();

  readonly imageUrl = computed(() =>
    resolveSearchImageUrl(this.restaurant().imagePath, this.restaurant().fallbackImage),
  );

  onImageError(event: Event): void {
    useFallbackImage(event, this.restaurant().fallbackImage);
  }
}
