import { Component, inject } from '@angular/core';
import { DesktopHome } from './desktop-home/desktop-home';
import { MobileHome } from './mobile-home/mobile-home';
import { RestaurantList } from '../../features/restaurants/components/restaurant-desktop-list/restaurant-desktop-list';
import { ResponsiveService } from '../../core/services/responsive.service';
import { Restaurants } from '../../features/restaurants/pages/restaurants/restaurants';

@Component({
  imports: [DesktopHome, MobileHome, Restaurants],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly responsiveService = inject(ResponsiveService);

  readonly isMobile = this.responsiveService.isMobile;
}
