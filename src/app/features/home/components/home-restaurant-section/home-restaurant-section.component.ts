import { 
  ChangeDetectionStrategy, 
  Component, 
  CUSTOM_ELEMENTS_SCHEMA, 
  ElementRef, 
  input, 
  output, 
  signal, 
  ViewChild, 
  AfterViewInit,
  effect
} from '@angular/core';
import { Restaurant } from '../../../restaurants/models/restaurant';
import { RestaurantItemComponent } from '../../../restaurants/components/restaurant-item/restaurant-item.component';

@Component({
  imports: [RestaurantItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-home-restaurant-section',
  styleUrl: './home-restaurant-section.component.css',
  templateUrl: './home-restaurant-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeRestaurantSectionComponent implements AfterViewInit {

  

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  // Inputs & Signals
  title = input.required<string>();
  restaurants = input.required<Restaurant[]>();
  isLoadingMore = input<boolean>(false);
  hasMoreData = input<boolean>(true);

  // Outputs
  loadMore = output<void>();

  // State Signals
  canScrollLeft = signal<boolean>(false);
  canScrollRight = signal<boolean>(false);

  // Drag Scroll Internal State
  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;

  constructor() {
    // Automatically re-evaluate button state whenever restaurants signal updates
    effect(() => {
      if (this.restaurants()) {
        setTimeout(() => this.updateScrollState(), 50);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollState(), 100);
  }

  updateScrollState(): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const currentScroll = Math.abs(el.scrollLeft);

    const threshold = 15;

    this.canScrollRight.set(currentScroll > threshold);
    this.canScrollLeft.set(currentScroll < maxScroll - threshold || this.hasMoreData());
  }

  scroll(direction: 'left' | 'right'): void {
    if (!this.scrollContainer) return;
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 320; // Scrolls approximately one card + gap width

    const shift = direction === 'left' ? -scrollAmount : scrollAmount;
    container.scrollBy({ left: shift, behavior: 'smooth' });
  }

  onScroll(event: Event): void {
    this.updateScrollState();

    const element = event.target as HTMLElement;
    const maxScroll = element.scrollWidth - element.clientWidth;
    const currentScroll = Math.abs(element.scrollLeft);

    // Trigger API pagination threshold (200px before reaching the end)
    const isNearEnd = currentScroll >= maxScroll - 200;

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
    if (!this.isDragging) return;
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