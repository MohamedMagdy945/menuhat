import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RestaurantList } from '../../components/restaurant-desktop-list/restaurant-desktop-list';
import { MOCK_RESTAURANTS } from '../../mocks/restaurant.mock';

@Component({
  imports: [RestaurantList],
  selector: 'app-restaurants',
  styleUrl: './restaurants.css',
  templateUrl: './restaurants.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class Restaurants {
  restaurants = MOCK_RESTAURANTS;
}
