import { Component, inject, signal } from '@angular/core';
import { DesktopHome } from '../components/desktop-home/desktop-home.component';
import { MobileHome } from '../components/mobile-home/mobile-home.component';
import { HomeRestaurantSection } from '../../restaurants/components/home-restaurant-section/home-restaurant-section';
import { ResponsiveService } from '../../../core/services/responsive.service';
import { Restaurant } from '../../restaurants/models/restaurant';
import { MOCK_RESTAURANT_PAGES } from '../../restaurants/mocks/restaurant.mock';

@Component({
  imports: [DesktopHome, MobileHome, HomeRestaurantSection
  ],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class Home {

  private readonly responsiveService = inject(ResponsiveService);

  readonly isMobile = this.responsiveService.isMobile;


  // =========================
  // Trending
  // =========================

  trendingRestaurants = signal<Restaurant[]>([
    ...MOCK_RESTAURANT_PAGES[0]
  ]);

  private trendingPage = 0;


  // =========================
  // Popular
  // =========================

  popularRestaurants = signal<Restaurant[]>([
    ...MOCK_RESTAURANT_PAGES[0]
  ]);

  private popularPage = 0;


  // =========================
  // Most Visited
  // =========================

  mostVisitedRestaurants = signal<Restaurant[]>([
    ...MOCK_RESTAURANT_PAGES[0]
  ]);

  private mostVisitedPage = 0;


  // =========================
  // Trending
  // =========================

  loadMoreTrending(): void {

    if (
      this.trendingPage >=
      MOCK_RESTAURANT_PAGES.length - 1
    ) {
      return;
    }

    this.trendingPage++;

    const nextPage =
      MOCK_RESTAURANT_PAGES[this.trendingPage];

    this.trendingRestaurants.update(restaurants => [
      ...restaurants,
      ...nextPage
    ]);
  }


  // =========================
  // Popular
  // =========================

  loadMorePopular(): void {

    if (
      this.popularPage >=
      MOCK_RESTAURANT_PAGES.length - 1
    ) {
      return;
    }

    this.popularPage++;

    const nextPage =
      MOCK_RESTAURANT_PAGES[this.popularPage];

    this.popularRestaurants.update(restaurants => [
      ...restaurants,
      ...nextPage
    ]);
  }


  // =========================
  // Most Visited
  // =========================

  loadMoreMostVisited(): void {

    if (
      this.mostVisitedPage >=
      MOCK_RESTAURANT_PAGES.length - 1
    ) {
      return;
    }

    this.mostVisitedPage++;

    const nextPage =
      MOCK_RESTAURANT_PAGES[this.mostVisitedPage];

    this.mostVisitedRestaurants.update(restaurants => [
      ...restaurants,
      ...nextPage
    ]);
  }
}