import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Restaurant } from '../../models/restaurant';
import { environment } from '../../../../core/environments/environment';

@Component({
  imports: [],
  selector: 'app-restaurant-item',
  styleUrl: './restaurant-item.component.css',
  templateUrl: './restaurant-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantItemComponent {
    readonly apiUrl = environment.filesUrl;
    readonly defaultImage = '/images/default-restaurant.png';


    restaurant = input.required<Restaurant>();

  
    onCardClick() {
      throw new Error('Method not implemented.');
    }
}
