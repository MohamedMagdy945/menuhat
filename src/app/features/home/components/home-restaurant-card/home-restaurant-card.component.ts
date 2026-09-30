import { Component, input } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { Restaurant } from '../../../restaurants/models/restaurant';

@Component({
  imports: [],
  selector: 'app-home-restaurant-card',
  styleUrl: './home-restaurant-card.component.css',
  templateUrl: './home-restaurant-card.component.html',
})
export class HomeRestaurantCardComponent {
  readonly restaurant = input.required<Restaurant>();
  readonly apiUrl = environment.filesUrl;
  Math: any;
}
