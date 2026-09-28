import { Component, input } from '@angular/core';
import { MenuProduct } from '../../models/menu.product.model';
import { environment } from '../../../../core/environments/environment';

@Component({
  imports: [],
  selector: 'app-home-meal-card',
  styleUrl: './home-meal-card.component.css',
  templateUrl: './home-meal-card.component.html',
})
export class HomeMealCardComponent {
  readonly product = input.required<MenuProduct>();
  readonly apiUrl =environment.filesUrl;
Math: any;
}
