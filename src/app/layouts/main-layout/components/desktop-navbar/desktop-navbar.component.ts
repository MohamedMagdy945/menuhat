import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocationSelectorComponent } from '../../../../shared/components/location-selector/location-selector.component';

@Component({
  imports: [RouterLink, RouterLinkActive, LocationSelectorComponent],
  selector: 'app-desktop-navbar',
  styleUrl: './desktop-navbar.component.css',
  templateUrl: './desktop-navbar.component.html',
})
export class DesktopNavbarComponent {

}
