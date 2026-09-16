import { Component } from '@angular/core';
import { DesktopHome } from './desktop-home/desktop-home';
import { MobileHome } from './mobile-home/mobile-home';

@Component({
  imports: [DesktopHome, MobileHome],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home { }
