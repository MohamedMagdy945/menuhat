import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../models/restaurant';
import { environment } from '../../../../core/environments/environment';

@Component({
  imports: [RouterLink],
  selector: 'app-restaurant-card',
  styleUrl: './restaurant-card.component.css',
  templateUrl: './restaurant-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantCardComponent {
  readonly apiUrl = environment.filesUrl;
  readonly defaultImage = '/images/default-restaurant.png';

  readonly restaurant = input.required<Restaurant>();
  readonly isFavorite = signal(false);

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
