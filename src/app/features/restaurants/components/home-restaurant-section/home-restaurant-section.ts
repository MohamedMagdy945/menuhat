import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core';
import { Restaurant } from '../../models/restaurant';
import { RestaurantItem } from '../restaurant-item/restaurant-item';

@Component({
  imports: [RestaurantItem],
  schemas: [],
  selector: 'app-home-restaurant-section',
  styleUrl: './home-restaurant-section.css',
  templateUrl: './home-restaurant-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class HomeRestaurantSection {
  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;
  title = input.required<string>();

  restaurants = input.required<Restaurant[]>();

  loadMore = output<void>();


  onScroll(event: Event): void {

    const element = event.target as HTMLElement;

    const reachedEnd =
      element.scrollLeft <= 10;

    if (reachedEnd) {
      this.loadMore.emit();
    }
  }
  onMouseDown(event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;

    this.isDragging = true;
    this.startX = event.pageX;
    this.startScrollLeft = element.scrollLeft;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    const element = event.currentTarget as HTMLElement;

    const x = event.pageX;
    const walk = x - this.startX;

    element.scrollLeft = this.startScrollLeft - walk;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }
}
