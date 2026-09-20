import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MOCK_RESTAURANTS } from '../../mocks/restaurant.mock';
import { Restaurant } from '../../models/restaurant';
import { RestaurantItem } from '../restaurant-item/restaurant-item';

@Component({
  imports: [RestaurantItem],
  selector: 'app-restaurant-all',
  styleUrl: './restaurant-all.css',
  templateUrl: './restaurant-all.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantAll {
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
