import { Component, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { Restaurant } from '../../../restaurants/models/restaurant';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-restaurant-card',
  styleUrl: './home-restaurant-card.component.css',
  templateUrl: './home-restaurant-card.component.html',
})
export class HomeRestaurantCardComponent {
  readonly restaurant = input.required<Restaurant>();
  readonly apiUrl = environment.filesUrl;
  Math: any;
  readonly isFavorite = signal(false);

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
