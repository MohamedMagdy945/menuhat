import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CategoryItem } from '../../models/category-item.model';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-restaurant-categories',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-categories.component.html',
  styleUrl: './restaurant-categories.component.css',
})
export class RestaurantCategoriesComponent {
  readonly categories = input.required<CategoryItem[]>();
  readonly selectedCategory = input.required<number | null>();
  readonly categorySelected = output<number | null>();

  onSelectCategory(categoryId: number | null): void {
    this.categorySelected.emit(categoryId);
  }
}
