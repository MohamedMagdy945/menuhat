import {
  Component,
  input,
  output,
} from '@angular/core';

import { CarouselComponent, ResponsiveItems } from '../../../../shared/components/carousel/carousel.component';
import { Restaurant } from '../../../restaurants/models/restaurant';
import { HomeRestaurantCardComponent } from '../home-restaurant-card/home-restaurant-card.component';

@Component({
  selector: 'app-home-restaurants',
  imports: [
    HomeRestaurantCardComponent,
    CarouselComponent,
  ],
  templateUrl: './home-restaurants.component.html',
  styleUrl: './home-restaurants.component.css',
})
export class HomeRestaurantsComponent {
  // Section title
  readonly title = input.required<string>();

  // Restaurants displayed inside the section
  readonly restaurants = input.required<Restaurant[]>();

  // Easily control how many items are visible side-by-side (e.g. 5, 6, 7 or '2 sm:3 md:4 lg:5')
  readonly itemsCount = input<string | number | ResponsiveItems>('2 sm:3 md:4 lg:5');

  // Pagination state (defaults to false for single-batch carousel display)
  readonly hasMoreData = input(false);
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