import { Component, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { MenuItem } from '../../models/menu-item';
import { LucideHeart } from '@lucide/angular';

@Component({
  imports: [LucideHeart],
  selector: 'app-meal-item',
  styleUrl: './meal-items.component.css',
  templateUrl: './meal-items.component.html',
})
export class MealItemsComponent {
  readonly menuItem = input.required<MenuItem>();
  readonly apiUrl = environment.filesUrl;
  readonly isFavorite = signal(false);
  Math: any;

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
