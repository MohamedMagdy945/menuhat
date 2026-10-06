import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantsService } from './services/restaurants.service';
import { RestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { HomeRestaurantCardComponent } from '../home/components/home-restaurant-card/home-restaurant-card.component';

@Component({
  imports: [RestaurantCardComponent],
  selector: 'app-restaurants',
  styleUrl: './restaurants.component.css',
  templateUrl: './restaurants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantsService = inject(RestaurantsService);
  private readonly filter = this.route.snapshot.data['filter'] as string | undefined;

  readonly restaurants = computed(() =>
    this.filter === 'top-rated'
      ? this.restaurantsService.topRates()
      : this.restaurantsService.topVisits(),
  );

  readonly title = computed(() =>
    this.filter === 'top-rated' ? 'الأعلى تقييمًا' : 'الأكثر زيارة',
  );
  readonly hasMore = computed(() =>
    this.filter === 'top-rated'
      ? this.restaurantsService.topRatesHasNext()
      : this.restaurantsService.topVisitsHasNext(),
  );
  readonly isLoading = computed(() =>
    this.filter === 'top-rated'
      ? this.restaurantsService.isLoadingTopRates()
      : this.restaurantsService.isLoadingTopVisits(),
  );

  ngOnInit(): void {
    if (this.filter === 'top-rated') {
      if (this.restaurantsService.topRates().length === 0) {
        this.restaurantsService.loadTopRates({ globalLoading: false });
      }
      return;
    }

    if (this.restaurantsService.topVisits().length === 0) {
      this.restaurantsService.loadTopVisits({ globalLoading: false });
    }
  }

  loadMore(): void {
    if (this.filter === 'top-rated') {
      this.restaurantsService.loadTopRates({ globalLoading: false });
      return;
    }

    this.restaurantsService.loadTopVisits({ globalLoading: false });
  }
}
