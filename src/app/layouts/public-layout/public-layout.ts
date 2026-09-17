import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileNavbar } from './components/navbar/mobile-navbar/mobile-navbar';
import { DesktopNavbar } from './components/navbar/desktop-navbar/desktop-navbar';
import { Footer } from './components/footer/footer';

@Component({
  imports: [RouterOutlet, MobileNavbar, DesktopNavbar, Footer],
  selector: 'app-public-layout',
  styleUrl: './public-layout.css',
  templateUrl: './public-layout.html',
})
export class PublicLayout { }
