import { LucideChevronLeft,LucideChevronRight } from '@lucide/angular';

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
    imports: [LucideChevronLeft, LucideChevronRight],

  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.css',
})
export class HorizontalScrollComponent
  implements AfterViewInit, OnDestroy
{
  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  // Inputs / Outputs
  readonly isLoading = input(false);
  readonly hasMore = input(false);
  readonly loadMore = output<void>();

  // حالة أزرار التنقل
  private readonly canScrollLeft = signal(false);
  private readonly canScrollRight = signal(false);

  // نحتاج RTL لمعرفة اتجاه نهاية المحتوى
  private readonly isRtl = signal(false);

  // هل يوجد بيانات إضافية قادمة؟
  private readonly moreComing = computed(
    () => this.hasMore() || this.isLoading(),
  );

  // زرار اليسار يفضل شغال لو لسه فيه محتوى ناحية اليسار
  // أو لو RTL ولسه فيه بيانات إضافية
  readonly leftDisabled = computed(
    () =>
      !this.canScrollLeft() &&
      !(this.isRtl() && this.moreComing()),
  );

  // زرار اليمين يفضل شغال لو لسه فيه محتوى ناحية اليمين
  // أو لو LTR ولسه فيه بيانات إضافية
  readonly rightDisabled = computed(
    () =>
      !this.canScrollRight() &&
      !(!this.isRtl() && this.moreComing()),
  );

  // نسبة الحركة في كل ضغطة
  // 0.7 = يتحرك 70% من عرض الـ container
  private readonly scrollPercentage = 0.7;

  // مدة الحركة بالـ milliseconds
  private readonly animationDuration = 400;

  // المسافة التي عندها نطلب بيانات جديدة
  private readonly threshold = 50;

  // Animation الحالية للحركة
  private animationFrame?: number;

  // يمنع تشغيل أكثر من update في نفس الـ frame
  private frame?: number;

  // يمنع إرسال أكثر من request في نفس الوقت
  private loadRequested = false;

  // مراقبة تغيير حجم الـ container
  private resizeObserver?: ResizeObserver;

  // مراقبة إضافة أو إزالة المنتجات
  private mutationObserver?: MutationObserver;

  constructor() {
    // لما التحميل يخلص، نعيد فحص حالة الـ container
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

    // لو حجم الـ container اتغير
    // نعيد حساب حالة أزرار التنقل
    this.resizeObserver = new ResizeObserver(() => {
      this.update();
    });

    this.resizeObserver.observe(container);

    // لو المنتجات اتضافت أو اتمسحت
    // نعيد حساب حالة الـ navigation
    this.mutationObserver = new MutationObserver(() => {
      this.update();
    });

    this.mutationObserver.observe(container, {
      childList: true,
    });

    // أول تحديث بعد ظهور الـ view
    requestAnimationFrame(() => {
      this.update();
      this.fillIfNeeded();
    });
  }

  ngOnDestroy(): void {
    // تنظيف الـ observers
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    // إلغاء أي animation شغالة
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
    }

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  /**
   * يتم استدعاؤها مع حدث scroll.
   *
   * نستخدم requestAnimationFrame
   * حتى لا ننفذ update مع كل حركة صغيرة.
   */
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
   * تحريك المحتوى ناحية اليسار.
   */
  scrollLeft(): void {
    this.scroll(-1);
  }

  /**
   * تحريك المحتوى ناحية اليمين.
   */
  scrollRight(): void {
    this.scroll(1);
  }

  /**
   * تنفيذ الحركة.
   *
   * direction:
   * -1 = يسار
   * +1 = يمين
   *
   * مقدار الحركة = 70% من عرض الـ container.
   */
  private scroll(direction: number): void {
    // لو فيه حركة شغالة، نتجاهل الضغطة
    // عشان الـ animations متتراكمش
    if (this.animationFrame !== undefined) {
      return;
    }

    const container = this.scrollContainer.nativeElement;

    // نحسب المسافة حسب حجم الـ container الحالي
    const amount =
      container.clientWidth *
      this.scrollPercentage *
      direction;

    const start = container.scrollLeft;
    const target = start + amount;

    const startTime = performance.now();

    /**
     * Animation بسيطة باستخدام requestAnimationFrame
     * بدل behavior: smooth
     *
     * عشان نتحكم في الحركة ومايحصلش تراكم
     * لو المستخدم ضغط بسرعة.
     */
    const animate = (currentTime: number): void => {
      // نسبة تقدم الحركة من 0 إلى 1
      const progress = Math.min(
        (currentTime - startTime) /
          this.animationDuration,
        1,
      );

      // Ease-out:
      // تبدأ الحركة بشكل طبيعي
      // وتنتهي بهدوء
      const eased =
        1 - Math.pow(1 - progress, 3);

      // تحديث مكان الـ scroll
      container.scrollLeft =
        start + (target - start) * eased;

      // لو الحركة لسه مخلصتش
      if (progress < 1) {
        this.animationFrame =
          requestAnimationFrame(animate);

        return;
      }

      // الحركة انتهت
      this.animationFrame = undefined;

      // نحدث حالة الأزرار
      this.update();

      // نشوف هل وصلنا قرب نهاية البيانات
      this.checkLoadMore();
    };

    // بدء الـ animation
    this.animationFrame =
      requestAnimationFrame(animate);
  }

  /**
   * لو وصلنا قريب من نهاية المحتوى
   * نطلب بيانات إضافية.
   */
  private checkLoadMore(): void {
    const container =
      this.scrollContainer.nativeElement;

    // أقصى مسافة ممكنة للـ scroll
    const max = Math.max(
      container.scrollWidth -
        container.clientWidth,
      0,
    );

    // المسافة المتبقية حتى النهاية
    const distanceToEnd =
      max - Math.abs(container.scrollLeft);

    // لو قربنا من النهاية نطلب المزيد
    if (distanceToEnd <= this.threshold) {
      this.requestMore();
    }
  }

  /**
   * لو المنتجات الحالية لا تملأ العرض
   * نطلب بيانات إضافية تلقائيًا.
   */
  private fillIfNeeded(): void {
    const container =
      this.scrollContainer?.nativeElement;

    if (!container) {
      return;
    }

    // مفيش scroll أصلاً
    // إذن ممكن نحتاج منتجات إضافية
    if (
      container.scrollWidth <=
      container.clientWidth
    ) {
      this.requestMore();
    }
  }

  /**
   * إرسال طلب تحميل المزيد.
   *
   * loadRequested يمنع تكرار الطلب
   * أثناء نفس عملية التحميل.
   */
  private requestMore(): void {
    if (
      !this.hasMore() ||
      this.isLoading() ||
      this.loadRequested
    ) {
      return;
    }

    this.loadRequested = true;

    this.loadMore.emit();
  }

  /**
   * تحديث حالة أزرار التنقل.
   *
   * نحسب:
   * - هل يوجد محتوى ناحية اليسار؟
   * - هل يوجد محتوى ناحية اليمين؟
   * - هل الـ container RTL؟
   */
  private update(): void {
    const container =
      this.scrollContainer?.nativeElement;

    if (!container) {
      return;
    }

    // أقصى scroll ممكن
    const max = Math.max(
      container.scrollWidth -
        container.clientWidth,
      0,
    );

    // معرفة اتجاه الـ container
    const rtl =
      getComputedStyle(container).direction ===
      'rtl';

    /*
     * في LTR:
     * scrollLeft من 0 إلى max
     *
     * في RTL:
     * scrollLeft من -max إلى 0
     */
    const min = rtl ? -max : 0;
    const end = rtl ? 0 : max;

    this.isRtl.set(rtl);

    // هل يوجد محتوى ناحية اليسار؟
    this.canScrollLeft.set(
      container.scrollLeft > min + 1,
    );

    // هل يوجد محتوى ناحية اليمين؟
    this.canScrollRight.set(
      container.scrollLeft < end - 1,
    );
  }
}