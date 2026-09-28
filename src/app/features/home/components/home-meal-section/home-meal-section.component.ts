import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';

import { MenuProduct } from '../../models/menu.product.model';
import { HomeMealCardComponent } from '../home-meal-card/home-meal-card.component';

@Component({
  selector: 'app-home-meal-section',
  imports: [HomeMealCardComponent],
  templateUrl: './home-meal-section.component.html',
  styleUrl: './home-meal-section.component.css',
})
export class HomeMealComponent implements AfterViewInit {
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly title = input.required<string>();
  readonly products = input.required<MenuProduct[]>();

  readonly isLoadingMore = input(false);
  readonly hasMoreData = input(true);

  readonly loadMore = output<void>();

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;

  constructor() {
    effect(() => {
      this.products();

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

  private updateScrollState(): void {
    if (!this.scrollContainer) {
      return;
    }

    const element = this.scrollContainer.nativeElement;

    const maxScroll =
      element.scrollWidth - element.clientWidth;

    const currentScroll = Math.abs(element.scrollLeft);

    const threshold = 15;

    this.canScrollRight.set(
      currentScroll > threshold,
    );

    this.canScrollLeft.set(
      currentScroll < maxScroll - threshold,
    );
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer) {
      return;
    }

    const container =
      this.scrollContainer.nativeElement;

    const scrollAmount = 320;

    const shift =
      direction === 'left'
        ? -scrollAmount
        : scrollAmount;

    container.scrollBy({
      left: shift,
      behavior: 'smooth',
    });
  }

  onScroll(event: Event): void {
    this.updateScrollState();

    const element = event.target as HTMLElement;

    const maxScroll =
      element.scrollWidth - element.clientWidth;

    const currentScroll =
      Math.abs(element.scrollLeft);

    const threshold = 200;

    const isNearEnd =
      maxScroll <= 0 ||
      currentScroll >= maxScroll - threshold;

    if (
      isNearEnd &&
      this.hasMoreData() &&
      !this.isLoadingMore()
    ) {
      this.loadMore.emit();
    }
  }

  onMouseDown(event: MouseEvent): void {
    const element =
      event.currentTarget as HTMLElement;

    this.isDragging = true;
    this.startX = event.pageX;
    this.startScrollLeft =
      element.scrollLeft;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    event.preventDefault();

    const element =
      event.currentTarget as HTMLElement;

    const x = event.pageX;
    const walk =
      (x - this.startX) * 1.2;

    element.scrollLeft =
      this.startScrollLeft - walk;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }
}
