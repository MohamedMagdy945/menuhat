import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { resolveAdminFileUrl } from '../utils/admin-file-url';
import { ConfirmModalComponent } from '../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryTableComponent } from './components/category-table/category-table.component';
import { AdminCategory } from './models/admin-category.model';
import { AdminCategoryTile } from './models/admin-category-tile.model';

const PAGE_SIZE = 24;

/** Admin main categories list — GET /Admin/GetAllMainCategory (search, ?menuId= filter, paging). */
@Component({
  selector: 'app-admin-categories',
  imports: [
    SearchInputComponent,
    DecimalPipe,
    FormsModule,
    RouterLink,
    AdminCategoryTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './admin-categories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategoriesComponent implements OnInit {
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  readonly categories = signal<AdminCategory[]>([]);
  readonly itemsCount = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly page = signal(1);
  readonly search = signal('');
  /** Restaurant filter from `?menuId=` (e.g. opened from a restaurant page). */
  readonly menuId = signal<number | null>(
    Number(this._route.snapshot.queryParamMap.get('menuId')) || null,
  );
  readonly menuName = computed(() =>
    this.menuId() ? (this.categories()[0]?.clientName ?? `#${this.menuId()}`) : '',
  );

  readonly deletingId = signal<number | null>(null);
  readonly pendingDelete = signal<AdminCategory | null>(null);
  readonly deleteMessage = computed(
    () =>
      `هل أنت متأكد من حذف قسم "${this.pendingDelete()?.menuMainCategoryName ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`,
  );

  readonly hasFilters = computed(() => !!this.search().trim() || !!this.menuId());

  readonly tiles = computed<AdminCategoryTile[]>(() =>
    this.categories().map((c) => ({
      id: c.id,
      name: c.menuMainCategoryName,
      nameEn: c.menuMainCategoryName_En,
      photoUrl: resolveAdminFileUrl(c.photoURL),
      order: c.catOrder ?? c.no,
      subtitle: c.clientName,
      subtitleIcon: 'storefront',
      editLink: ['/admin/categories', c.id, 'edit'],
      openLink: ['/admin/categories', c.id, 'subcategories'],
      openLabel: 'الأقسام الفرعية',
    })),
  );

  /** Page numbers to show; 0 marks a gap ("…"). */
  readonly pageItems = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const result: number[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) result.push(0);
      result.push(p);
    });
    return result;
  });

  readonly rangeLabel = computed(() => {
    const count = this.itemsCount();
    if (count === 0) return '';
    const from = (this.page() - 1) * PAGE_SIZE + 1;
    const to = Math.min(this.page() * PAGE_SIZE, count);
    return `${from}–${to} من ${count}`;
  });

  private readonly _searchChanges = new Subject<void>();
  private _request?: Subscription;

  constructor() {
    this._searchChanges
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe(() => this.goToPage(1));
    inject(DestroyRef).onDestroy(() => this._request?.unsubscribe());
  }

  ngOnInit(): void {
    this.load();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this._searchChanges.next();
  }

  clearMenuFilter(): void {
    this.menuId.set(null);
    this._router.navigate([], { queryParams: { menuId: null }, queryParamsHandling: 'merge' });
    this.goToPage(1);
  }

  clearFilters(): void {
    this.search.set('');
    if (this.menuId()) {
      this.clearMenuFilter();
      return;
    }
    this.goToPage(1);
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(page, 1), Math.max(this.totalPages(), 1));
    this.page.set(target);
    this.load();
  }

  load(): void {
    this._request?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);

    this._request = this._categoriesService
      .getCategories({
        pageNumber: this.page(),
        pageSize: PAGE_SIZE,
        searchValue: this.search(),
        menuId: this.menuId(),
      })
      .subscribe({
        next: (res) => {
          this.categories.set(res.items);
          this.itemsCount.set(res.itemsCount);
          this.totalPages.set(Math.max(res.totalPages, 1));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.isLoading.set(false);
          this.error.set('تعذر تحميل الأقسام');
        },
      });
  }

  askDelete(id: number): void {
    if (this.deletingId() !== null) return;
    this.pendingDelete.set(this.categories().find((c) => c.id === id) ?? null);
  }

  confirmDelete(): void {
    const category = this.pendingDelete();
    if (!category || this.deletingId() !== null) return;

    this.deletingId.set(category.id);
    this._categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.success('تم حذف القسم');
        const lastOnPage = this.categories().length === 1 && this.page() > 1;
        this.goToPage(lastOnPage ? this.page() - 1 : this.page());
      },
      error: (err) => {
        console.error('Failed to delete category:', err);
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.error(err?.error?.message?.value || 'تعذر حذف القسم');
      },
    });
  }
}
