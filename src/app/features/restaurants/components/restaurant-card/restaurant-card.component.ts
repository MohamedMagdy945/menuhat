import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Restaurant } from '../../models/restaurant';
import { environment } from '../../../../core/environments/environment';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-restaurant-card',
  styleUrl: './restaurant-card.component.css',
  templateUrl: './restaurant-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantCardComponent {
    readonly apiUrl = environment.filesUrl;
    readonly defaultImage = '/images/default-restaurant.png';
    private readonly router = inject(Router);

    restaurant = input.required<Restaurant>();

    onCardClick() {
     const serial = this.restaurant().serial;     
     if (serial) {
      console.log("Serial fom item",serial);
      this.router.navigate(['/restaurantProfile', serial]);
    }
  }
}
