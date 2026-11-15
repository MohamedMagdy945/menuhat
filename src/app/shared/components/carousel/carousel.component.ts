import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  ViewChild,
} from '@angular/core';

export type ResponsiveItems = {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};
export type ResponsiveCols = ResponsiveItems;

function parseItems(value: string | number | ResponsiveItems | null | undefined): ResponsiveItems | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return { base: value };
  }
  if (typeof value === 'object') {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const num = Number(trimmed);
    if (!isNaN(num) && num > 0) {
      return { base: num };
    }
    const result: ResponsiveItems = {};
    const normalized = trimmed
      .replace(/grid-cols-/gi, '')
      .replace(/grid-/gi, '')
      .replace(/cols-/gi, '')
      .replace(/grid\s+/gi, '');

    const tokens = normalized.split(/\s+/);
    for (const token of tokens) {
      if (token.includes(':')) {
        const [bp, countStr] = token.split(':');
        const count = Number(countStr.replace(/\D/g, ''));
        if (!isNaN(count) && count > 0) {
          if (bp === 'sm') result.sm = count;
          else if (bp === 'md') result.md = count;
          else if (bp === 'lg') result.lg = count;
          else if (bp === 'xl') result.xl = count;
        }
      } else {
        const count = Number(token.replace(/\D/g, ''));
        if (!isNaN(count) && count > 0) {
          result.base = count;
        }
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }
  return null;
}

@Component({
  selector: 'app-carousel, app-horizontal-scroll',
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.has-item-width]': 'hasItemWidth()',
  },
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  // Inputs / Outputs
  readonly items = input<string | number | ResponsiveItems | null>(null);
  readonly cols = input<string | number | ResponsiveItems | null>(null);
  readonly grid = input<string | number | ResponsiveItems | null>(null);
  readonly gap = input<string | number | null>(null);
  readonly itemWidth = input<string | number | null>(null);
  readonly isLoading = input(false);
  readonly hasMore = input(false);
  readonly showArrows = input(true);
  readonly loadMore = output<void>();

  // Check if caller explicitly requested a rigid grid columns definition
  readonly hasExplicitItems = computed(() => {
    return (
      (this.grid() !== null && this.grid() !== undefined && this.grid() !== '') ||
      (this.items() !== null && this.items() !== undefined && this.items() !== '') ||
      (this.cols() !== null && this.cols() !== undefined && this.cols() !== '')
    );
  });

  readonly hasItemWidth = computed(() => {
    return this.itemWidth() !== null && this.itemWidth() !== undefined && this.itemWidth() !== '';
  });

  private readonly effectiveItems = computed(() => {
    return this.grid() ?? this.items() ?? this.cols() ?? null;
  });

  readonly parsedItems = computed(() => parseItems(this.effectiveItems()));

  readonly trackStyle = computed(() => {
    const styles: string[] = [];
    const c = this.parsedItems();

    if (c) {
      if (c.base !== undefined) styles.push(`--carousel-items: ${c.base}`);
      if (c.sm !== undefined) styles.push(`--carousel-items-sm: ${c.sm}`);
      if (c.md !== undefined) styles.push(`--carousel-items-md: ${c.md}`);
      if (c.lg !== undefined) styles.push(`--carousel-items-lg: ${c.lg}`);
      if (c.xl !== undefined) styles.push(`--carousel-items-xl: ${c.xl}`);
    }

    if (this.gap() !== null && this.gap() !== undefined && this.gap() !== '') {
      const rawGap = String(this.gap()).trim();
      const g = /^\d+$/.test(rawGap) ? `${rawGap}px` : rawGap;
      styles.push(`--carousel-gap: ${g}`);
    }

    if (this.itemWidth() !== null && this.itemWidth() !== undefined && this.itemWidth() !== '') {
      const rawWidth = String(this.itemWidth()).trim();
      const w = /^\d+$/.test(rawWidth) ? `${rawWidth}px` : rawWidth;
      styles.push(`--carousel-item-width: ${w}`);
    }

    return styles.join('; ');
  });

  // State Signals
  readonly isRtl = signal(true);
  readonly isAtStart = signal(true);
  readonly isAtEnd = signal(false);
  readonly canScroll = signal(false);

  // Additional data pending
  readonly moreComing = computed(() => this.hasMore() || this.isLoading());

  // Boundary disabled states
  readonly leftDisabled = computed(() => {
    if (this.isRtl()) {
      return this.isAtEnd() && !this.moreComing();
    }
    return this.isAtStart();
  });

  readonly rightDisabled = computed(() => {
    if (this.isRtl()) {
      return this.isAtStart();
    }
    return this.isAtEnd() && !this.moreComing();
  });

  private readonly threshold = 60;
  private scrollFrame?: number;
  private loadRequested = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  // Mouse drag state for desktop
  private isMouseDown = false;
  private startX = 0;
  private startScrollLeft = 0;
  private hasDragged = false;

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        return;
      }
      this.loadRequested = false;
      requestAnimationFrame(() => {
        this.updateScrollState();
      });
    });
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;
    this.detectDirection();

    this.resizeObserver = new ResizeObserver(() => {
      this.detectDirection();
      this.updateScrollState();
    });
    this.resizeObserver.observe(container);

    this.mutationObserver = new MutationObserver(() => {
      this.updateScrollState();
    });
    this.mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    requestAnimationFrame(() => {
      this.detectDirection();
      this.updateScrollState();
      this.fillIfNeeded();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (this.scrollFrame !== undefined) {
      cancelAnimationFrame(this.scrollFrame);
    }
  }

  onScroll(): void {
    if (this.scrollFrame !== undefined) {
      return;
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = undefined;
      this.updateScrollState();
      this.checkLoadMore();
    });
  }

  onLeftArrowClick(): void {
    if (this.leftDisabled()) {
      return;
    }
    if (this.isRtl()) {
      this.scrollByStep('next');
    } else {
      this.scrollByStep('prev');
    }
  }

  onRightArrowClick(): void {
    if (this.rightDisabled()) {
      return;
    }
    if (this.isRtl()) {
      this.scrollByStep('prev');
    } else {
      this.scrollByStep('next');
    }
  }

  scrollByStep(direction: 'next' | 'prev'): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const step = this.getScrollStep();
    const isRTL = this.isRtl();

    let delta = 0;
    if (direction === 'next') {
      delta = isRTL ? -step : step;
    } else {
      delta = isRTL ? step : -step;
    }

    container.scrollBy({ left: delta, behavior: 'smooth' });

    requestAnimationFrame(() => {
      this.checkLoadMore();
    });
  }

  private getScrollStep(): number {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return 300;

    const firstItem = container.querySelector('.carousel-track > *') as HTMLElement | null;
    if (firstItem && firstItem.offsetWidth > 0) {
      const itemWidth = firstItem.offsetWidth;
      const gap = this.getGapValue();
      const stride = itemWidth + gap;

      const visibleCount = Math.floor(container.clientWidth / stride);
      const stepCount = Math.max(1, visibleCount > 1 ? visibleCount - 1 : 1);
      return stepCount * stride;
    }

    return Math.round(container.clientWidth * 0.75);
  }

  private getGapValue(): number {
    const raw = this.gap();
    if (raw !== null && raw !== undefined && raw !== '') {
      const num = parseFloat(String(raw));
      if (!isNaN(num) && num > 0) return num;
    }
    return 16;
  }

  // ============================================
  // Mouse Drag to Scroll (Desktop support)
  // ============================================

  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    this.isMouseDown = true;
    this.hasDragged = false;
    this.startX = e.pageX - container.offsetLeft;
    this.startScrollLeft = container.scrollLeft;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown) return;
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const distance = x - this.startX;

    if (Math.abs(distance) > 5) {
      this.hasDragged = true;
    }

    container.scrollLeft = this.startScrollLeft - distance;
  }

  onMouseUp(): void {
    this.isMouseDown = false;
  }

  private updateScrollState(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    if (maxScroll <= 5) {
      this.canScroll.set(false);
      this.isAtStart.set(true);
      this.isAtEnd.set(true);
      return;
    }

    this.canScroll.set(true);
    const scrollLeft = Math.abs(container.scrollLeft);

    this.isAtStart.set(scrollLeft <= 5);
    this.isAtEnd.set(maxScroll - scrollLeft <= 10);
  }

  private detectDirection(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const dir =
      getComputedStyle(container).direction ||
      document.documentElement.dir ||
      document.body.dir ||
      'rtl';

    this.isRtl.set(dir === 'rtl');
  }

  private checkLoadMore(): void {
    if (!this.hasMore()) {
      return;
    }

    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const max = Math.max(container.scrollWidth - container.clientWidth, 0);
    const distanceToEnd = max - Math.abs(container.scrollLeft);

    if (distanceToEnd <= this.threshold) {
      this.requestMore();
    }
  }

  private fillIfNeeded(): void {
    if (!this.hasMore()) {
      return;
    }

    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    if (container.scrollWidth <= container.clientWidth) {
      this.requestMore();
    }
  }

  private requestMore(): void {
    if (!this.hasMore() || this.isLoading() || this.loadRequested) {
      return;
    }

    this.loadRequested = true;
    this.loadMore.emit();
  }
}
