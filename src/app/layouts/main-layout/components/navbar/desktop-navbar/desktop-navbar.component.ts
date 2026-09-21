import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-desktop-navbar',
  styleUrl: './desktop-navbar.component.css',
  templateUrl: './desktop-navbar.component.html',
})
export class DesktopNavbar {
}
