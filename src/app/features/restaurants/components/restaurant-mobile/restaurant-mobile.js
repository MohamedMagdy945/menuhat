import { Component, inject, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant';

@Component({
  imports: [],
  selector: 'app-restaurant-list',
  styleUrl: './restaurant-desktop-list.css',
  templateUrl: './restaurant-desktop-list.html',
})
export class RestaurantList implements OnInit {
  private readonly restaurantService = inject(RestaurantService);

  ngOnInit(): void {
    this.restaurantService.loadAllMenus();

    console.log('All Menus:', this.restaurantService.allMenus());
    console.log('All Menus:', this.restaurantService.allMenus());
    console.log('All Menus:', this.restaurantService.allMenus());
  }

}
