import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-mobile-navbar',
  styleUrl: './mobile-navbar.component.css',
  templateUrl: './mobile-navbar.component.html',
})
export class MobileNavbar { }
