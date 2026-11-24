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
import { Subject, Subscription, debounceTime } from 'rxjs';
import { CommonDateService } from '../../../core/common-data/common-date';
import { DropdownItem } from '../../../core/models/dropdown-item.model';
import { AdminRestaurantsService } from './admin-restaurants.service';
import { AdminMenu } from './models/admin-menu.model';
import { AdminRestaurantRow } from './models/admin-restaurant-row.model';
import { resolveAdminFileUrl } from '../utils/admin-file-url';
import { formatWorkingHours } from '../utils/admin-time';
import { ToastService } from '../../../core/services/toast.service';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { FormSelectComponent } from '../../../shared/components/form-select/form-select.component';
import { FormSelectOption } from '../../../shared/models/form-select-option.model';
import { Router, RouterLink } from '@angular/router';
import { AdminRestaurantCardComponent } from './components/restaurant-card/restaurant-card.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-admin-restaurants',
  imports: [
    SearchInputComponent,
    DecimalPipe,
    FormsModule,
    FormSelectComponent,
    RouterLink,
    AdminRestaurantCardComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './admin-restaurants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRestaurantsComponent implements OnInit {
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _commonData = inject(CommonDateService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);

  // Data
  readonly menus = signal<AdminMenu[]>([]);
  readonly itemsCount = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Filters
  readonly page = signal(1);
  readonly search = signal('');
  readonly governmentId = signal<number | null>(null);
  readonly cityId = signal<number | null>(null);
  readonly governments = signal<DropdownItem[]>([]);
  readonly cities = signal<DropdownItem[]>([]);

  // Delete
  readonly deletingId = signal<number | null>(null);
  /** Restaurant waiting for confirmation in the confirm modal. */
  readonly pendingDelete = signal<AdminMenu | null>(null);
  readonly deleteMessage = computed(
    () => `هل أنت متأكد من حذف "${this.pendingDelete()?.clientName ?? ''}"؟ يمكن استعادته لاحقًا.`,
  );

  /** Options for the shared app-form-select; value 0 = "all". */
  readonly governmentOptions = computed<FormSelectOption[]>(() => [
    { value: 0, label: 'كل المحافظات' },
    ...this.governments().map((g) => ({ value: g.id, label: g.name })),
  ]);
  readonly cityOptions = computed<FormSelectOption[]>(() => [
    { value: 0, label: 'كل المدن' },
    ...this.cities().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly hasFilters = computed(
    () => !!this.search().trim() || !!this.governmentId() || !!this.cityId(),
  );

  private readonly _governmentNames = computed(
    () => new Map(this.governments().map((g) => [g.id, g.name])),
  );
  private readonly _cityNames = computed(() => new Map(this.cities().map((c) => [c.id, c.name])));

  readonly rows = computed<AdminRestaurantRow[]>(() =>
    this.menus().map((menu) => ({
      menu,
      logoUrl: resolveAdminFileUrl(menu.logoURL),
      pdfUrl: resolveAdminFileUrl(menu.pdfURL),
      qrUrl: resolveAdminFileUrl(menu.qrCodePath),
      hours: formatWorkingHours(menu.fromTime, menu.toTime),
      location: [this._governmentNames().get(menu.governmentId), this._cityNames().get(menu.cityId)]
        .filter(Boolean)
        .join(' - '),
      createdLabel: this.formatDate(menu.createdDate),
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
    this._commonData.getGovernments().subscribe({
      next: (list) => this.governments.set(list ?? []),
      error: (err) => console.error('Failed to load governments:', err),
    });
    this.load();
  }

  // ---------- Filters ----------
  onSearch(value: string): void {
    this.search.set(value);
    this._searchChanges.next();
  }

  onGovernmentChange(id: number | null): void {
    this.governmentId.set(id ? Number(id) : null);
    this.cityId.set(null);
    this.cities.set([]);
    if (id) {
      this._commonData.getCitiesByGovernmentId(Number(id)).subscribe({
        next: (list) => this.cities.set(list ?? []),
        error: (err) => console.error('Failed to load cities:', err),
      });
    }
    this.goToPage(1);
  }

  onCityChange(id: number | null): void {
    this.cityId.set(id ? Number(id) : null);
    this.goToPage(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.governmentId.set(null);
    this.cityId.set(null);
    this.cities.set([]);
    this.goToPage(1);
  }

  // ---------- Paging ----------
  goToPage(page: number): void {
    const target = Math.min(Math.max(page, 1), Math.max(this.totalPages(), 1));
    this.page.set(target);
    this.load();
  }

  load(): void {
    this._request?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);

    this._request = this._restaurantsService
      .getMenus({
        pageNumber: this.page(),
        pageSize: PAGE_SIZE,
        searchValue: this.search(),
        governmentId: this.governmentId(),
        cityId: this.cityId(),
      })
      .subscribe({
        next: (res) => {
          this.menus.set(res.items);
          this.itemsCount.set(res.itemsCount);
          this.totalPages.set(Math.max(res.totalPages, 1));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load restaurants:', err);
          this.isLoading.set(false);
          this.error.set('تعذر تحميل المطاعم');
        },
      });
  }

  // ---------- Edit / delete ----------
  /** GetMenus / GetMenu do not return the address, so pass it to the edit page. */
  openEdit(menu: AdminMenu): void {
    this._router.navigate(['/admin/restaurants', menu.serial, 'edit'], {
      state: { address: menu.address ?? '' },
    });
  }

  /** Opens the confirm modal; the delete runs from `confirmDelete()`. */
  deleteMenu(menu: AdminMenu): void {
    if (this.deletingId() !== null) return;
    this.pendingDelete.set(menu);
  }

  confirmDelete(): void {
    const menu = this.pendingDelete();
    if (!menu || this.deletingId() !== null) return;

    this.deletingId.set(menu.menuId);
    this._restaurantsService.softDeleteMenu(menu.menuId).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.success('تم حذف المطعم');
        // Stay on a valid page if this was the last card of the last page.
        const lastOnPage = this.menus().length === 1 && this.page() > 1;
        this.goToPage(lastOnPage ? this.page() - 1 : this.page());
      },
      error: (err) => {
        console.error('Failed to delete menu:', err);
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.error(err?.error?.message || 'تعذر حذف المطعم');
      },
    });
  }

  private formatDate(raw: string): string {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }
}
