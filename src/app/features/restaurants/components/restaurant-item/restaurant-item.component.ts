import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Restaurant } from '../../models/restaurant';

@Component({
  imports: [],
  selector: 'app-restaurant-item',
  styleUrl: './restaurant-item.component.css',
  templateUrl: './restaurant-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantItemComponent {
  restaurant = input.required<Restaurant>();
  onCardClick() {
    throw new Error('Method not implemented.');
  }
}
