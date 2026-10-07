import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RestaurantMenuCategory } from '../../models/restaurant-details';

@Component({
  selector: 'app-restaurant-categories',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-categories.component.html',
  styleUrl: './restaurant-categories.component.css',
})
export class RestaurantCategoriesComponent {
  @Input({ required: true }) categories: RestaurantMenuCategory[] = [];
  @Input({ required: true }) selectedCategory: number | null = null;
  @Output() categorySelected = new EventEmitter<number | null>();

  onSelectCategory(categoryId: number | null): void {
    this.categorySelected.emit(categoryId);
  }
}
