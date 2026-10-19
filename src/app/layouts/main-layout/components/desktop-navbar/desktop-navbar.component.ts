import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocationSelectorComponent } from '../../../../shared/components/location-selector/location-selector.component';
import { CartDropdownComponent } from '../../../../features/cart/components/cart-dropdown/cart-dropdown.component';

@Component({
  imports: [RouterLink, RouterLinkActive, LocationSelectorComponent, CartDropdownComponent],
  selector: 'app-desktop-navbar',
  styleUrl: './desktop-navbar.component.css',
  templateUrl: './desktop-navbar.component.html',
})
export class DesktopNavbarComponent {

}
