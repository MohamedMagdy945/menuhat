import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import { LocationService } from '../../core/services/location.service';

import { RestaurantsService } from '../restaurants/services/restaurants.service';

import { HomeRestaurantsComponent } from './components/home-restaurants/home-restaurants.component';
import { HomeMenuItemsComponent } from './components/home-menu-items/home-menu-items.component';
import { MenuItemService } from '../menu-items/menu-item.service';

@Component({
  selector: 'app-home',
  imports: [
    HomeMenuItemsComponent,
    HomeRestaurantsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly responsiveService = inject(ResponsiveService);
  private readonly locationService = inject(LocationService);

  readonly isMobile = this.responsiveService.isMobile;

  protected readonly menuItemService = inject(MenuItemService);
  protected readonly restaurantsService = inject(RestaurantsService);

  async ngOnInit(): Promise<void> {
    // ============================================
    // Most Requested Menu Items
    // ============================================

    // Load only if there is no data already
    if (this.menuItemService.mostRequested().length === 0) {
      this.menuItemService.loadMostRequested({
        globalLoading: true,
      });
    }

    // ============================================
    // Most Visited Restaurants
    // ============================================

    // Load only if there is no data already
    if (this.restaurantsService.topVisits().length === 0) {
      this.restaurantsService.loadTopVisits({
        pageNumber: 1,
        pageSize: 10,
        globalLoading: true,
      });
    }

    // ============================================
    // Top Rated Restaurants
    // ============================================

    // Load only if there is no data already
    if (this.restaurantsService.topRates().length === 0) {
      this.restaurantsService.loadTopRates({
        pageNumber: 1,
        pageSize: 10,
        globalLoading: true,
      });
    }

    // ============================================
    // Nearest Restaurants
    // ============================================

    // Load nearest restaurants only if there is no data already
    if (this.restaurantsService.nearestRestaurants().length === 0) {
      try {
        const location =
          await this.locationService.getSmartLocation();

        console.log('Nearest Restaurants Location:', {
          lat: location.lat,
          lng: location.lng,
        });

        if (
          location.lat === null ||
          location.lng === null
        ) {
          console.warn(
            'Could not get valid coordinates for nearest restaurants',
          );

          return;
        }

        this.restaurantsService.loadNearestRestaurants({
          pageNumber: 1,
          pageSize: 10,
          globalLoading: false,
          extraParams: {
            lat: location.lat,
            lon: location.lng,
          },
        });
      } catch (error) {
        console.warn(
          'Could not get location for nearest restaurants:',
          error,
        );
      }
    }
  }

  // ============================================
  // Most Requested
  // ============================================

  loadMoreMostRequested(): void {
    this.menuItemService.loadMostRequested({
      globalLoading: false,
    });
  }

  // ============================================
  // Top Visits
  // ============================================

  private topVisitsPage = 1;

  loadMoreTopVisits(): void {
    this.topVisitsPage++;
    this.restaurantsService.loadTopVisits({
      pageNumber: this.topVisitsPage,
      pageSize: 10,
      globalLoading: false,
    });
  }

  // ============================================
  // Top Rates
  // ============================================

  private topRatesPage = 1;

  loadMoreTopRates(): void {
    this.topRatesPage++;
    this.restaurantsService.loadTopRates({
      pageNumber: this.topRatesPage,
      pageSize: 10,
      globalLoading: false,
    });
  }

  // ============================================
  // Nearest Restaurants
  // ============================================

  private nearestRestaurantsPage = 1;

  loadMoreNearestRestaurants(): void {
    this.nearestRestaurantsPage++;
    this.restaurantsService.loadNearestRestaurants({
      pageNumber: this.nearestRestaurantsPage,
      pageSize: 10,
      globalLoading: false,
    });
  }
}