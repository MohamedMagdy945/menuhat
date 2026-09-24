import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MOCK_RESTAURANTS } from '../../core/mocks/restaurant.mock';
import { Restaurant } from './models/restaurant';
import { RestaurantItemComponent } from './components/restaurant-item/restaurant-item.component';

@Component({
  imports: [RestaurantItemComponent],
  selector: 'app-restaurants',
  styleUrl: './restaurants.component.css',
  templateUrl: './restaurants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly restaurants = signal<Restaurant[]>(MOCK_RESTAURANTS);

  readonly title = signal('كل المطاعم');
  constructor() {

    this.route.queryParams.subscribe(params => {

      const section = params['section'];

      switch (section) {

        case 'trending':
          this.title.set('رائج الآن');
          break;

        case 'popular':
          this.title.set('الأكثر طلباً في منطقتك');
          break;

        case 'most-visited':
          this.title.set('الأكثر زيارة');
          break;

        default:
          this.title.set('كل المطاعم');
      }

    });

  }
}
