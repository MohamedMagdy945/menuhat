import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { ResponsiveService } from '../../core/services/responsive.service';
import { HomeRestaurantSectionComponent } from './components/home-restaurant-section/home-restaurant-section.component';
import { RestaurantService } from '../restaurants/restaurant.service';
import { LocationService } from '../../core/services/location.service';

@Component({
  imports: [HomeRestaurantSectionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly responsiveService = inject(ResponsiveService);
  protected readonly restaurantService = inject(RestaurantService);
  private readonly locationService = inject(LocationService);

  readonly isMobile = this.responsiveService.isMobile;

  ngOnInit(): void {
    if (this.restaurantService.trending().length === 0) {
      this.restaurantService.loadTrending();
    }

    this.loadNearest();

    if (this.restaurantService.mostVisited().length === 0) {
      this.restaurantService.loadMostVisited();
    }
  }

  private loadNearest(): void {
    if (this.restaurantService.nearst().length > 0) {
      return;
    }

    const location = this.locationService.currentLocation();

    const lat = location?.lat ?? 30.0444;
    const lng = location?.lng ?? 31.2357;

    this.restaurantService.loadNearst(lat, lng);
  }

  loadMoreTrending(): void {
    this.restaurantService.loadTrending();
  }

  loadMorePopular(): void {
    this.loadNearest();
  }

  loadMoreMostVisited(): void {
    this.restaurantService.loadMostVisited();
  }
}
