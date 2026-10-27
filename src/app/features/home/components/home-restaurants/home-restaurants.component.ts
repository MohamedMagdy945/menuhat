import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeRestaurantsComponent {
  // Section title
  readonly title = input.required<string>();

  // Restaurants displayed inside the section
  readonly restaurants = input.required<Restaurant[]>();
}