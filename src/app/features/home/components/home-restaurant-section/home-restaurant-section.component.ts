import {
  Component,
  input,
  output,
} from '@angular/core';

import { HorizontalScrollComponent } from '../../../../shared/components/horizontal-scroll/horizontal-scroll.component';
import { HorizontalCardSkeletonComponent } from '../../../../shared/skeleton/horizontal-card-skeleton/horizontal-card-skeleton.component';
import { Restaurant } from '../../../restaurants/models/restaurant';
import { HomeRestaurantCardComponent } from '../home-restaurant-card/home-restaurant-card.component';

@Component({
  selector: 'app-home-restaurant-section',
  imports: [
    HomeRestaurantCardComponent,
    HorizontalScrollComponent,
    HorizontalCardSkeletonComponent,
  ],
  templateUrl: './home-restaurant-section.component.html',
  styleUrl: './home-restaurant-section.component.css',
})
export class HomeRestaurantSectionComponent {




  // Section title
  readonly title = input.required<string>();

  // Restaurants displayed inside the section
  readonly restaurants = input.required<Restaurant[]>();

  // Pagination state
  readonly hasMoreData = input(true);
  readonly isLoadingMore = input(false);

  // Emit when more products should be loaded
  readonly loadMore = output<void>();

  onLoadMore(): void {
    if (!this.hasMoreData() || this.isLoadingMore()) {
      return;
    }

    this.loadMore.emit();
  }
}