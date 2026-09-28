import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

import { Restaurant } from '../../../restaurants/models/restaurant';
import { RestaurantItemComponent } from '../../../restaurants/components/restaurant-item/restaurant-item.component';

@Component({
  imports: [RestaurantItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home-restaurant-section',
  styleUrl: './home-restaurant-section.component.css',
  templateUrl: './home-restaurant-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeRestaurantSectionComponent implements AfterViewInit {
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  title = input.required<string>();
  restaurants = input.required<Restaurant[]>();

  isLoadingMore = input<boolean>(false);
  hasMoreData = input<boolean>(true);

  loadMore = output<void>();

  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;

  constructor() {
    effect(() => {
      this.restaurants();

      setTimeout(() => {
        this.updateScrollState();
      }, 50);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateScrollState();
    }, 100);
  }

  updateScrollState(): void {
    if (!this.scrollContainer) {
      return;
    }

    const element = this.scrollContainer.nativeElement;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const currentScroll = Math.abs(element.scrollLeft);

    const threshold = 15;

    this.canScrollRight.set(currentScroll > threshold);
    this.canScrollLeft.set(currentScroll < maxScroll - threshold);
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer) {
      return;
    }

    const container = this.scrollContainer.nativeElement;

    const scrollAmount = 320;

    const shift = direction === 'left' ? -scrollAmount : scrollAmount;

    container.scrollBy({
      left: shift,
      behavior: 'smooth',
    });
  }

  onScroll(event: Event): void {
    this.updateScrollState();

    const element = event.target as HTMLElement;

    const maxScroll = element.scrollWidth - element.clientWidth;
    const currentScroll = Math.abs(element.scrollLeft);

    const threshold = 200;

    const isNearEnd = currentScroll >= maxScroll - threshold;

    if (isNearEnd && this.hasMoreData() && !this.isLoadingMore()) {
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

    event.preventDefault();

    const element = event.currentTarget as HTMLElement;

    const x = event.pageX;
    const walk = (x - this.startX) * 1.2;

    element.scrollLeft = this.startScrollLeft - walk;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }
}
