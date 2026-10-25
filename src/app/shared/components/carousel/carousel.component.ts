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

function parseItems(value: string | number | ResponsiveItems | null | undefined): ResponsiveItems {
  if (value === undefined || value === null || value === '') {
    return { base: 2, sm: 3, md: 4, lg: 5, xl: 6 };
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
    // Normalize any "grid-cols-", "grid-", "cols-" prefixes
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
    return result;
  }
  return { base: 2, sm: 3, md: 4, lg: 5, xl: 6 };
}

@Component({
  selector: 'app-carousel, app-horizontal-scroll',
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  // Inputs / Outputs
  readonly items = input<string | number | ResponsiveItems | null>(null);
  readonly cols = input<string | number | ResponsiveItems | null>(null);
  readonly grid = input<string | number | ResponsiveItems | null>(null);
  readonly gap = input<string | number | null>(null);
  readonly isLoading = input(false);
  readonly hasMore = input(false);
  readonly showArrows = input(true);
  readonly showDots = input(true);
  readonly loadMore = output<void>();

  private readonly effectiveItems = computed(
    () => this.grid() ?? this.items() ?? this.cols() ?? '2 sm:3 md:4 lg:5 xl:6',
  );

  readonly parsedItems = computed(() => parseItems(this.effectiveItems()));

  readonly trackStyle = computed(() => {
    const c = this.parsedItems();
    const styles: string[] = [];
    if (c.base !== undefined) styles.push(`--carousel-items: ${c.base}`);
    if (c.sm !== undefined) styles.push(`--carousel-items-sm: ${c.sm}`);
    if (c.md !== undefined) styles.push(`--carousel-items-md: ${c.md}`);
    if (c.lg !== undefined) styles.push(`--carousel-items-lg: ${c.lg}`);
    if (c.xl !== undefined) styles.push(`--carousel-items-xl: ${c.xl}`);
    if (this.gap() !== null && this.gap() !== undefined) {
      const g = typeof this.gap() === 'number' ? `${this.gap()}px` : this.gap();
      styles.push(`--carousel-gap: ${g}`);
    }
    return styles.join('; ');
  });

  // State Signals
  readonly isRtl = signal(true);
  readonly totalPages = signal(1);
  readonly currentPage = signal(0);
  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i),
  );

  // Additional data pending
  readonly moreComing = computed(
    () => this.hasMore() || this.isLoading(),
  );

  // Boundary disabled states
  readonly leftDisabled = computed(() => {
    if (this.isRtl()) {
      return this.currentPage() >= this.totalPages() - 1 && !this.moreComing();
    }
    return this.currentPage() <= 0;
  });

  readonly rightDisabled = computed(() => {
    if (this.isRtl()) {
      return this.currentPage() <= 0;
    }
    return this.currentPage() >= this.totalPages() - 1 && !this.moreComing();
  });

  // Animation & Observer references
  private readonly animationDuration = 400;
  private readonly threshold = 50;

  private animationFrame?: number;
  private scrollFrame?: number;
  private loadRequested = false;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor() {
    effect(() => {
      if (this.isLoading()) {
        return;
      }

      this.loadRequested = false;

      requestAnimationFrame(() => {
        this.updateLayout();
      });
    });
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;
    this.detectDirection();

    this.resizeObserver = new ResizeObserver(() => {
      this.detectDirection();
      this.updateLayout();
    });
    this.resizeObserver.observe(container);

    this.mutationObserver = new MutationObserver(() => {
      this.updateLayout();
    });
    this.mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    requestAnimationFrame(() => {
      this.detectDirection();
      this.updateLayout();
      this.fillIfNeeded();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (this.scrollFrame !== undefined) {
      cancelAnimationFrame(this.scrollFrame);
    }

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  onScroll(): void {
    if (this.scrollFrame !== undefined) {
      return;
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = undefined;
      this.updateCurrentPageFromScroll();
      this.checkLoadMore();
    });
  }

  onLeftArrowClick(): void {
    if (this.leftDisabled()) {
      return;
    }

    if (this.isRtl()) {
      this.nextPage();
    } else {
      this.prevPage();
    }
  }

  onRightArrowClick(): void {
    if (this.rightDisabled()) {
      return;
    }

    if (this.isRtl()) {
      this.prevPage();
    } else {
      this.nextPage();
    }
  }

  nextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();

    if (current < total - 1) {
      this.goToPage(current + 1);
    } else if (this.moreComing()) {
      this.requestMore();
    }
  }

  prevPage(): void {
    const current = this.currentPage();
    if (current > 0) {
      this.goToPage(current - 1);
    }
  }

  goToPage(pageIndex: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const clientWidth = container.clientWidth;
    const maxScroll = Math.max(0, container.scrollWidth - clientWidth);
    const targetPage = Math.max(0, Math.min(pageIndex, this.totalPages() - 1));

    const targetOffset = Math.min(targetPage * clientWidth, maxScroll);
    const targetScrollLeft = this.isRtl() ? -targetOffset : targetOffset;

    this.animateScrollTo(targetScrollLeft, targetPage);
  }

  private animateScrollTo(targetScrollLeft: number, targetPage: number): void {
    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }

    const container = this.scrollContainer.nativeElement;
    const start = container.scrollLeft;
    const target = targetScrollLeft;
    const startTime = performance.now();

    const animate = (currentTime: number): void => {
      const progress = Math.min(
        (currentTime - startTime) / this.animationDuration,
        1,
      );

      // Smooth cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      container.scrollLeft = start + (target - start) * eased;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
        return;
      }

      this.animationFrame = undefined;
      this.currentPage.set(targetPage);
      this.checkLoadMore();
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private updateLayout(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const clientWidth = container.clientWidth;
    const scrollWidth = container.scrollWidth;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    if (maxScroll <= 5 || clientWidth <= 0) {
      this.totalPages.set(1);
      this.currentPage.set(0);
      return;
    }

    // Number of full-page steps
    const pagesCount = Math.ceil(maxScroll / clientWidth) + 1;
    this.totalPages.set(Math.max(1, pagesCount));

    this.updateCurrentPageFromScroll();
  }

  private updateCurrentPageFromScroll(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const clientWidth = container.clientWidth;
    const maxScroll = Math.max(0, container.scrollWidth - clientWidth);
    const total = this.totalPages();

    if (maxScroll <= 5 || clientWidth <= 0 || total <= 1) {
      this.currentPage.set(0);
      return;
    }

    const scrolled = Math.abs(container.scrollLeft);

    if (scrolled <= 5) {
      this.currentPage.set(0);
    } else if (maxScroll - scrolled <= 15) {
      this.currentPage.set(total - 1);
    } else {
      const calculatedPage = Math.min(
        total - 1,
        Math.max(0, Math.round(scrolled / clientWidth)),
      );
      this.currentPage.set(calculatedPage);
    }
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

    const container = this.scrollContainer.nativeElement;
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
