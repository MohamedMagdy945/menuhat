import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocationSelectorComponent } from '../../../../shared/components/location-selector/location-selector.component';
import { CartDrawerComponent } from '../../../../features/cart/components/cart-drawer/cart-drawer.component';
import { FavoriteSideDrawerComponent } from '../../../../features/favorites/components/favorite-side-drawer/favorite-side-drawer.component';
import { NotificationSideDrawerComponent } from '../../../../features/notifications/components/notification-side-drawer/notification-side-drawer.component';
import { AccountDropdownComponent } from '../../../../features/home/components/account-dropdown/account-dropdown.component';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LocationSelectorComponent,
    NotificationSideDrawerComponent,
    FavoriteSideDrawerComponent,
    CartDrawerComponent,
    AccountDropdownComponent,
  ],
  selector: 'app-desktop-navbar',
  styleUrl: './desktop-navbar.component.css',
  templateUrl: './desktop-navbar.component.html',
})
export class DesktopNavbarComponent {}
