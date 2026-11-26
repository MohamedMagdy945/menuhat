import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { resolveAdminFileUrl } from '../utils/admin-file-url';
import { AdminCategoriesService } from '../categories/admin-categories.service';
import { AdminRestaurantsService } from '../restaurants/admin-restaurants.service';
import { ConfirmModalComponent } from '../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminProductsService } from './admin-products.service';
import { AdminProductTableComponent } from './components/product-table/product-table.component';
import { AdminProduct } from './models/admin-product.model';
import { AdminProductRow } from './models/admin-product-row.model';
import { AdminProductScope } from './models/admin-product-scope.model';
import { AdminProductScopeContext } from './models/admin-product-scope-context.model';
import { formatAdminProductPrice } from './utils/admin-product-price';

const PAGE_SIZE = 24;

/**
 * Admin products list — GET /Admin/GetAllProducts (search, paging).
 * Scoped by `?menuId=` (restaurant), `?categoryId=` (main category) or `?subCategoryId=`; the most
 * specific one wins. The breadcrumb names come from GetMenu / GetMainCategory / GetSubCategory.
 */
@Component({
  selector: 'app-admin-products',
  imports: [
    SearchInputComponent,
    DecimalPipe,
    RouterLink,
    AdminProductTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './admin-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  private readonly _productsService = inject(AdminProductsService);
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _toast = inject(ToastService);

  readonly products = signal<AdminProduct[]>([]);
  readonly itemsCount = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly page = signal(1);
  readonly search = signal('');

  readonly scope = signal<AdminProductScope>({
    menuId: null,
    categoryId: null,
    subCategoryId: null,
  });
  readonly context = signal<AdminProductScopeContext | null>(null);
  readonly isScoped = computed(() => {
    const s = this.scope();
    return !!(s.menuId || s.categoryId || s.subCategoryId);
  });
  /** Query params that keep the current scope (add / edit links and the way back). */
  readonly scopeQueryParams = computed(() => scopeToQueryParams(this.scope()));

  readonly deletingId = signal<number | null>(null);
  readonly pendingDelete = signal<AdminProduct | null>(null);
  readonly deleteMessage = computed(
    () =>
      `هل أنت متأكد من حذف المنتج "${this.pendingDelete()?.productName ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`,
  );

  readonly hasFilters = computed(() => !!this.search().trim() || this.isScoped());

  readonly rows = computed<AdminProductRow[]>(() =>
    this.products().map((p) => ({
      id: p.id,
      name: p.productName,
      nameEn: p.productName_En,
      photoUrl: resolveAdminFileUrl(p.photoURL),
      priceLabel: formatAdminProductPrice(p.haveMoreInfo, p.price, p.details),
      categoryName: p.menuCategoryName,
      subCategoryName: p.menuSubCategoryName,
      restaurantName: p.clientName,
      isHidden: !!p.isHidden,
      editLink: ['/admin/products', p.id, 'edit'],
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
  private _contextRequest?: Subscription;

  constructor() {
    this._searchChanges
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe(() => this.goToPage(1));

    // Scope links (breadcrumb, clear) navigate to this same route, so follow the query params.
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed())
      .subscribe((params) => this.applyScope(readScope(params)));

    inject(DestroyRef).onDestroy(() => {
      this._request?.unsubscribe();
      this._contextRequest?.unsubscribe();
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this._searchChanges.next();
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), Math.max(this.totalPages(), 1)));
    this.load();
  }

  load(): void {
    this._request?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);

    const scope = this.scope();
    this._request = this._productsService
      .getProducts({
        pageNumber: this.page(),
        pageSize: PAGE_SIZE,
        searchValue: this.search(),
        menuId: scope.subCategoryId || scope.categoryId ? null : scope.menuId,
        menuCategoryId: scope.subCategoryId ? null : scope.categoryId,
        menuSubCategoryId: scope.subCategoryId,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.itemsCount.set(res.itemsCount);
          this.totalPages.set(Math.max(res.totalPages, 1));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load products:', err);
          this.isLoading.set(false);
          this.error.set('تعذر تحميل المنتجات');
        },
      });
  }

  askDelete(id: number): void {
    if (this.deletingId() !== null) return;
    this.pendingDelete.set(this.products().find((p) => p.id === id) ?? null);
  }

  confirmDelete(): void {
    const product = this.pendingDelete();
    if (!product || this.deletingId() !== null) return;

    this.deletingId.set(product.id);
    this._productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.success('تم حذف المنتج');
        const lastOnPage = this.products().length === 1 && this.page() > 1;
        this.goToPage(lastOnPage ? this.page() - 1 : this.page());
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.error(err?.error?.message?.value || err?.error?.message || 'تعذر حذف المنتج');
      },
    });
  }

  private applyScope(scope: AdminProductScope): void {
    this.scope.set(scope);
    this.page.set(1);
    this.loadContext(scope);
    this.load();
  }

  /** Breadcrumb names for the scope (kept even when the list is empty). */
  private loadContext(scope: AdminProductScope): void {
    this._contextRequest?.unsubscribe();
    this.context.set(null);

    if (scope.subCategoryId) {
      this._contextRequest = this._categoriesService.getSubCategory(scope.subCategoryId).subscribe({
        next: (sub) =>
          this.context.set({
            menuId: sub.menuId,
            restaurantName: sub.clientName,
            categoryId: sub.menuCategoryId,
            categoryName: sub.menuCategoryName,
            subCategoryId: sub.id,
            subCategoryName: sub.menuSubCategoryName,
          }),
        error: (err) => console.error('Failed to load sub category:', err),
      });
    } else if (scope.categoryId) {
      this._contextRequest = this._categoriesService.getCategory(scope.categoryId).subscribe({
        next: (main) =>
          this.context.set({
            menuId: main.menuId,
            restaurantName: main.clientName,
            categoryId: main.id,
            categoryName: main.menuMainCategoryName,
            subCategoryId: null,
            subCategoryName: null,
          }),
        error: (err) => console.error('Failed to load category:', err),
      });
    } else if (scope.menuId) {
      const menuId = scope.menuId;
      this._contextRequest = this._restaurantsService.getMenu(menuId).subscribe({
        next: (menu) =>
          this.context.set({
            menuId,
            restaurantName: menu.clientName ?? null,
            categoryId: null,
            categoryName: null,
            subCategoryId: null,
            subCategoryName: null,
          }),
        error: (err) => console.error('Failed to load restaurant:', err),
      });
    }
  }
}

function readScope(params: ParamMap): AdminProductScope {
  return {
    menuId: Number(params.get('menuId')) || null,
    categoryId: Number(params.get('categoryId')) || null,
    subCategoryId: Number(params.get('subCategoryId')) || null,
  };
}

function scopeToQueryParams(scope: AdminProductScope): Record<string, number> {
  if (scope.subCategoryId) return { subCategoryId: scope.subCategoryId };
  if (scope.categoryId) return { categoryId: scope.categoryId };
  if (scope.menuId) return { menuId: scope.menuId };
  return {};
}
