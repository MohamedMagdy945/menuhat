import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import { RestaurantService } from '../restaurants/restaurant.service';
import { MenuItemService } from '../menu-items/services/menu-item.service';
import { HomeMenuItemSectionComponent } from './components/home-menu-item-section/home-menu-item-section.component';

@Component({
  selector: 'app-home',
  imports: [HomeMenuItemSectionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  private readonly responsiveService = inject(ResponsiveService);

  protected readonly restaurantService = inject(RestaurantService);

  readonly isMobile = this.responsiveService.isMobile;

  protected readonly menuItemService = inject(MenuItemService);

  ngOnInit(): void {
    this.menuItemService.loadMostRequested({
      globalLoading: true,
    });
  }
  loadMoreMostRequested(): void {
    this.menuItemService.loadMostRequested({
      globalLoading: false,
    });
  }
}
