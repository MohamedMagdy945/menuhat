import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocationSelectorComponent } from '../../../../shared/components/location-selector/location-selector.component';
import { CartDropdownComponent } from '../../../../features/cart/components/cart-dropdown/cart-dropdown.component';
import { FavoriteDropdownComponent } from '../../../../features/favorites/components/favorite-dropdown/favorite-dropdown.component';
import { NotificationDropdownComponent } from '../../../../features/notifications/components/notification-dropdown/notification-dropdown.component';
import { AccountDropdownComponent } from '../../../../features/home/components/account-dropdown/account-dropdown.component';

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    LocationSelectorComponent,
    NotificationDropdownComponent,
    FavoriteDropdownComponent,
    CartDropdownComponent,
    AccountDropdownComponent,
  ],
  selector: 'app-desktop-navbar',
  styleUrl: './desktop-navbar.component.css',
  templateUrl: './desktop-navbar.component.html',
})
export class DesktopNavbarComponent {}
