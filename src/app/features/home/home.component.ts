import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { LocationService } from '../../core/services/location.service';

import { HomeMealSectionComponent } from './components/home-meal-section/home-meal-section.component';
import { MealService } from '../meals/services/meal.service';

@Component({
  selector: 'app-home',
  imports: [HomeMealSectionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly mealService = inject(MealService);

  private readonly responsiveService = inject(ResponsiveService);

  protected readonly restaurantService = inject(RestaurantService);


  readonly isMobile = this.responsiveService.isMobile;

  readonly mostRequested = this.mealService.mostRequested;

  readonly mostRequestedHasNext = this.mealService.mostRequestedHasNext;

  readonly isLoadingMostRequested = this.mealService.isLoadingMostRequested;

  ngOnInit(): void {
    this.mealService.loadMostRequested({
      globalLoading: true,
    });
  }
  loadMoreMostRequested(): void {
    this.mealService.loadMostRequested({
      globalLoading: false,
    });
  }
}
