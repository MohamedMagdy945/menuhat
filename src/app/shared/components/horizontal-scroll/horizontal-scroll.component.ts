import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronsLeft,
  LucideChevronsRight,
} from '@lucide/angular';

import {
  AfterViewInit,
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

@Component({
  selector: 'app-horizontal-scroll',
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronsLeft,
    LucideChevronsRight,
  ],
  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.css',
})
export class HorizontalScrollComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  // Inputs / Outputs
  readonly isLoading = input(false);
  readonly hasMore = input(false);
  readonly loadMore = output<void>();

  // حالة أزرار التنقل
  private readonly canScrollLeft = signal(false);
  private readonly canScrollRight = signal(false);

  // هل يوجد بيانات إضافية قادمة؟
  private readonly moreComing = computed(
    () => this.hasMore() || this.isLoading(),
  );

  readonly leftDisabled = computed(() => !this.canScrollLeft());
  readonly rightDisabled = computed(() => !this.canScrollRight());

  // نسبة الحركة في كل ضغطة
  private readonly scrollPercentage = 0.7;

  // مدة الحركة بالـ milliseconds
  private readonly animationDuration = 400;

  // المسافة التي عندها نطلب بيانات جديدة
  private readonly threshold = 50;

  private animationFrame?: number;
  private frame?: number;
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
        this.update();
      });
    });
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(() => {
      this.update();
    });
    this.resizeObserver.observe(container);

    this.mutationObserver = new MutationObserver(() => {
      this.update();
    });
    this.mutationObserver.observe(container, {
      childList: true,
    });

    requestAnimationFrame(() => {
      this.update();
      this.fillIfNeeded();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  onScroll(): void {
    if (this.frame !== undefined) {
      return;
    }

    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;

      this.update();
      this.checkLoadMore();
    });
  }

  /**
   * تحريك المحتوى ناحية اليسار (للأمام في RTL).
   */
  scrollLeft(): void {
    this.scroll(-1);
  }

  /**
   * تحريك المحتوى ناحية اليمين (للخلف نحو البداية في RTL).
   */
  scrollRight(): void {
    this.scroll(1);
  }

  /**
   * الانتقال المباشر لأول القائمة (اليمين في RTL).
   */
  scrollToStart(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    container.scrollTo({
      left: 0,
      behavior: 'smooth',
    });
  }

  /**
   * الانتقال المباشر لآخر القائمة (اليسار في RTL).
   */
  scrollToEnd(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    const max = Math.max(container.scrollWidth - container.clientWidth, 0);
    container.scrollTo({
      left: -max,
      behavior: 'smooth',
    });
  }

  private scroll(direction: number): void {
    if (this.animationFrame !== undefined) {
      return;
    }

    const container = this.scrollContainer.nativeElement;
    const amount =
      container.clientWidth * this.scrollPercentage * direction;

    const start = container.scrollLeft;
    const target = start + amount;
    const startTime = performance.now();

    const animate = (currentTime: number): void => {
      const progress = Math.min(
        (currentTime - startTime) / this.animationDuration,
        1,
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      container.scrollLeft = start + (target - start) * eased;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
        return;
      }

      this.animationFrame = undefined;
      this.update();
      this.checkLoadMore();
    };

    this.animationFrame = requestAnimationFrame(animate);
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
    if (!container) {
      return;
    }

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

  /**
   * تحديث حالة أزرار التنقل مباشرة مع RTL (<body dir="rtl">).
   */
  private update(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const max = Math.max(container.scrollWidth - container.clientWidth, 0);
    const scrolled = Math.abs(container.scrollLeft);

    // هل يمكن التحرك نحو اليمين (للعودة للبداية)؟
    this.canScrollRight.set(scrolled > 5);

    // هل يمكن التحرك نحو اليسار (للتقدم نحو النهاية)؟
    this.canScrollLeft.set(max - scrolled > 5 || this.moreComing());
  }
}