import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import { LocationService } from '../../core/services/location.service';

import { MenuItemService } from '../menu-items/menu-item.service';
import { RestaurantsService } from '../restaurants/services/restaurants.service';

import { HomeMenuItemSectionComponent } from './components/home-menu-item-section/home-menu-item-section.component';
import { HomeRestaurantSectionComponent } from './components/home-restaurant-section/home-restaurant-section.component';

@Component({
  selector: 'app-home',
  imports: [
    HomeMenuItemSectionComponent,
    HomeRestaurantSectionComponent,
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
        globalLoading: true,
      });
    }

    // ============================================
    // Top Rated Restaurants
    // ============================================

    // Load only if there is no data already
    if (this.restaurantsService.topRates().length === 0) {
      this.restaurantsService.loadTopRates({
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

  loadMoreTopVisits(): void {
    this.restaurantsService.loadTopVisits({
      globalLoading: false,
    });
  }

  // ============================================
  // Top Rates
  // ============================================

  loadMoreTopRates(): void {
    this.restaurantsService.loadTopRates({
      globalLoading: false,
    });
  }

  // ============================================
  // Nearest Restaurants
  // ============================================

  loadMoreNearestRestaurants(): void {
    this.restaurantsService.loadNearestRestaurants({
      globalLoading: false,
    });
  }
}