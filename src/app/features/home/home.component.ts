import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { LocationService } from '../../core/services/location.service';

import { HomeMealComponent } from './components/home-meal-section/home-meal-section.component';
import { HomeMealService } from './services/home-meal.service';

@Component({
  selector: 'app-home',
  imports: [HomeMealComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly homeMealService = inject(HomeMealService);

  private readonly responsiveService =
    inject(ResponsiveService);

  protected readonly restaurantService =
    inject(RestaurantService);

  private readonly locationService =
    inject(LocationService);

  readonly isMobile =
    this.responsiveService.isMobile;

  readonly mostRequested =
    this.homeMealService.mostRequested;

  readonly mostRequestedHasNext =
    this.homeMealService.mostRequestedHasNext;

  constructor() {
  
  }

  ngOnInit(): void {
    this.homeMealService.loadMostRequested();
  }
}