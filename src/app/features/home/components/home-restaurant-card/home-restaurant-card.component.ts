import { Component, input } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { Restaurant } from '../../../restaurants/models/restaurant';
import { LucideMapPin, LucideStar, LucideTag } from '@lucide/angular';

@Component({
  imports: [LucideStar,LucideMapPin ,LucideTag ],
  selector: 'app-home-restaurant-card',
  styleUrl: './home-restaurant-card.component.css',
  templateUrl: './home-restaurant-card.component.html',
})
export class HomeRestaurantCardComponent {
  readonly restaurant = input.required<Restaurant>();
  readonly apiUrl = environment.filesUrl;
  Math: any;
}
