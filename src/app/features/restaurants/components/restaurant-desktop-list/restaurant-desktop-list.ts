import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant';
import { Restaurant } from '../../models/restaurant';
import { RestaurantItem } from '../restaurant-item/restaurant-item';

@Component({
  imports: [RestaurantItem],
  selector: 'app-restaurant-list',
  styleUrl: './restaurant-desktop-list.css',
  templateUrl: './restaurant-desktop-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class RestaurantList implements OnInit {
  restaurants = input.required<Restaurant[]>();

  ngOnInit(): void {

  }

}
