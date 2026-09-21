import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Restaurant } from '../../models/restaurant';

@Component({
  imports: [],
  selector: 'app-restaurant-item',
  styleUrl: './restaurant-item.css',
  templateUrl: './restaurant-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantItem {
onCardClick() {
throw new Error('Method not implemented.');
}
  restaurant = input.required<Restaurant>();
}
