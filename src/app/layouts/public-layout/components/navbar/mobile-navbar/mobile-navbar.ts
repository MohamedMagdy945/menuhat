import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-mobile-navbar',
  styleUrl: './mobile-navbar.css',
  templateUrl: './mobile-navbar.html',
})
export class MobileNavbar { }
