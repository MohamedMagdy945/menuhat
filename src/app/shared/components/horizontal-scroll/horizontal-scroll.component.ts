import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-horizontal-scroll',
  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.css',
})
export class HorizontalScrollComponent
  implements AfterContentChecked, AfterViewInit, OnDestroy
{
  private readonly changeDetector = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly isLoading = input(false);
  readonly hasMore = input(false);

  readonly loadMore = output<void>();

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private rtlScrollType?: 'negative' | 'reverse' | 'default';
  private scrollAnimationFrame?: number;

  private loadMoreTriggered = false;

  ngAfterViewInit(): void {
    const container = this.scrollContainer.nativeElement;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateScrollButtons();
    });

    this.resizeObserver.observe(container);
    this.observeScrollContent(container);

    this.mutationObserver = new MutationObserver(() => {
      this.loadMoreTriggered = false;
      this.observeScrollContent(container);

      requestAnimationFrame(() => {
        this.updateScrollButtons();
      });
    });

    this.mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    this.updateScrollButtons();

    requestAnimationFrame(() => {
      this.updateScrollButtons();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    if (this.scrollAnimationFrame !== undefined) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }
  }

  ngAfterContentChecked(): void {
    this.updateScrollButtons();
  }

  // ==============================
  // SCROLL EVENT
  // ==============================

  onScroll(): void {
    this.updateScrollButtons();

    this.checkLoadMore();
  }

  // ==============================
  // BUTTONS
  // ==============================

  scrollFarLeft(): void {
    this.scrollToVisual('left', this.getFarStep());
  }

  scrollLeft(): void {
    this.scrollToVisual('left', 300);
  }

  scrollRight(): void {
    this.scrollToVisual('right', 300);
  }

  scrollFarRight(): void {
    this.scrollToVisual('right', this.getFarStep());
  }

  // ==============================
  // VISUAL SCROLL
  // ==============================

  private scrollToVisual(
    direction: 'left' | 'right',
    amount: number,
  ): void {
    const container = this.scrollContainer.nativeElement;

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    if (maxScroll <= 0) {
      return;
    }

    const current = this.getVisualPosition();

    let target: number;

    if (direction === 'left') {
      target = current - amount;
    } else {
      target = current + amount;
    }

    target = Math.max(0, Math.min(target, maxScroll));

    this.animateToVisual(target);
  }

  private animateToVisual(target: number): void {
    if (this.scrollAnimationFrame !== undefined) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }

    const start = this.getVisualPosition();
    const distance = target - start;
    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number): void => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      this.setVisualPosition(start + distance * easedProgress);

      if (progress < 1) {
        this.scrollAnimationFrame = requestAnimationFrame(animate);
      } else {
        this.scrollAnimationFrame = undefined;
      }
    };

    this.scrollAnimationFrame = requestAnimationFrame(animate);
  }

  // ==============================
  // VISUAL POSITION
  //
  // 0 = LEFT
  // max = RIGHT
  // ==============================

  private getVisualPosition(): number {
    const container = this.scrollContainer.nativeElement;

    const maxScroll = Math.max(
      container.scrollWidth - container.clientWidth,
      0,
    );

    const direction = getComputedStyle(container).direction;

    if (direction !== 'rtl') {
      return container.scrollLeft;
    }

    switch (this.getRtlScrollType()) {
      case 'negative':
        return maxScroll + container.scrollLeft;
      case 'reverse':
        return maxScroll - container.scrollLeft;
      default:
        return container.scrollLeft;
    }
  }

  // ==============================
  // SET VISUAL POSITION
  // ==============================

  private setVisualPosition(position: number): void {
    const container = this.scrollContainer.nativeElement;

    const maxScroll = Math.max(
      container.scrollWidth - container.clientWidth,
      0,
    );

    const target = Math.max(
      0,
      Math.min(position, maxScroll),
    );

    const direction = getComputedStyle(container).direction;

    if (direction !== 'rtl') {
      container.scrollTo({
        left: target,
        behavior: 'auto',
      });

      return;
    }

    const rtlScrollType = this.getRtlScrollType();
    container.scrollTo({
      left:
        rtlScrollType === 'negative'
          ? target - maxScroll
          : rtlScrollType === 'reverse'
            ? maxScroll - target
            : target,
      behavior: 'auto',
    });
  }

  private getRtlScrollType(): 'negative' | 'reverse' | 'default' {
    if (this.rtlScrollType) {
      return this.rtlScrollType;
    }

    const outer = document.createElement('div');
    const inner = document.createElement('div');
    outer.dir = 'rtl';
    outer.style.cssText =
      'position:absolute;width:4px;height:1px;overflow:scroll;top:-1000px';
    inner.style.width = '8px';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    void outer.offsetWidth;

    if (outer.scrollLeft > 0) {
      this.rtlScrollType = 'default';
    } else {
      outer.scrollLeft = 1;
      this.rtlScrollType = outer.scrollLeft === 0 ? 'negative' : 'reverse';
    }

    outer.remove();
    return this.rtlScrollType;
  }

  private observeScrollContent(container: HTMLElement): void {
    for (const child of Array.from(container.children)) {
      this.resizeObserver?.observe(child);
    }
  }

  // ==============================
  // LOAD MORE
  // ==============================

  private checkLoadMore(): void {
    if (
      this.isLoading() ||
      !this.hasMore() ||
      this.loadMoreTriggered
    ) {
      return;
    }

    const container = this.scrollContainer.nativeElement;

    const maxScroll = Math.max(
      container.scrollWidth - container.clientWidth,
      0,
    );

    const current = this.getVisualPosition();

    if (current <= 100) {
      if (this.scrollAnimationFrame !== undefined) {
        cancelAnimationFrame(this.scrollAnimationFrame);
        this.scrollAnimationFrame = undefined;
      }

      this.loadMoreTriggered = true;

      this.loadMore.emit();
    }
  }

  // ==============================
  // BUTTON STATE
  // ==============================

  private updateScrollButtons(): void {
    const container = this.scrollContainer?.nativeElement;

    if (!container) {
      return;
    }

    const maxScroll = Math.max(
      container.scrollWidth - container.clientWidth,
      0,
    );

    const current = this.getVisualPosition();

    const canScrollLeft = current > 1;
    const canScrollRight = current < maxScroll - 1;

    if (
      this.canScrollLeft() !== canScrollLeft ||
      this.canScrollRight() !== canScrollRight
    ) {
      this.canScrollLeft.set(canScrollLeft);
      this.canScrollRight.set(canScrollRight);
      this.changeDetector.detectChanges();
    }
  }

  // ==============================
  // FAR BUTTON DISTANCE
  // ==============================

  private getFarStep(): number {
    return Math.max(
      400,
      this.scrollContainer.nativeElement.clientWidth * 0.5,
    );
  }
}