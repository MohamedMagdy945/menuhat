import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Subscription, debounceTime, finalize } from 'rxjs';
import { DropdownStateService } from '../../../../core/services/dropdown-state.service';
import { ClientsMenuService } from '../../../restaurants/services/clients-menu.service';
import { MenuItemService } from '../../../menu-items/menu-items.service';
import { SearchType } from '../../models/search-type.model';
import { SearchResultItem } from '../../models/search-result-item.model';
import { SearchRestaurantCardComponent } from '../search-restaurant-card/search-restaurant-card.component';
import { SearchMenuItemCardComponent } from '../search-menu-item-card/search-menu-item-card.component';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;
/** Distance (px) from the bottom of the results list that triggers loading the next page. */
const LOAD_MORE_THRESHOLD_PX = 48;

@Component({
  selector: 'app-search-bar',
  imports: [SearchRestaurantCardComponent, SearchMenuItemCardComponent],
  templateUrl: './search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SearchBarComponent {
  private readonly _clientsMenuService = inject(ClientsMenuService);
  private readonly _menuItemService = inject(MenuItemService);
  private readonly _dropdownState = inject(DropdownStateService);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** `mobile`: results panel pushes the page content down; `desktop`: results float over it. */
  readonly variant = input<'mobile' | 'desktop'>('mobile');

  private readonly _input = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly query = signal('');
  readonly type = signal<SearchType>('restaurants');
  readonly results = signal<SearchResultItem[]>([]);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly hasNext = signal(false);

  readonly isMobile = computed(() => this.variant() === 'mobile');
  readonly typeMenuId = computed(() => `search-type-${this.variant()}`);
  readonly resultsId = computed(() => `search-results-${this.variant()}`);
  readonly isTypeMenuOpen = computed(
    () => this._dropdownState.activeDropdown() === this.typeMenuId(),
  );
  readonly isResultsOpen = computed(
    () =>
      this._dropdownState.activeDropdown() === this.resultsId() && this.query().trim().length > 0,
  );

  private readonly _queryChanges = new Subject<void>();
  private _request?: Subscription;
  private _page = 1;
  /** `type|query` of the latest page-1 request, used to skip duplicate searches. */
  private _lastSearchKey = '';

  constructor() {
    this._queryChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.search());

    inject(DestroyRef).onDestroy(() => this._request?.unsubscribe());
  }

  onInput(value: string): void {
    this.query.set(value);

    if (!value.trim()) {
      this.resetResults();
      this._dropdownState.close(this.resultsId());
      return;
    }

    // Show the spinner during the debounce window instead of a stale "no results" state.
    if (this.searchKey() !== this._lastSearchKey) {
      this.isLoading.set(true);
    }
    this._dropdownState.open(this.resultsId());
    this._queryChanges.next();
  }

  onEnter(event: Event): void {
    event.preventDefault();
    if (!this.query().trim()) return;
    this._dropdownState.open(this.resultsId());
    this.search();
  }

  onFocus(): void {
    if (this.query().trim()) {
      this._dropdownState.open(this.resultsId());
    }
  }

  clear(): void {
    this.query.set('');
    this.resetResults();
    this._dropdownState.close(this.resultsId());
    this._input()?.nativeElement.focus();
  }

  toggleTypeMenu(event: Event): void {
    event.stopPropagation();
    this._dropdownState.toggle(this.typeMenuId());
  }

  selectType(type: SearchType): void {
    if (type !== this.type()) {
      this.type.set(type);
      this.resetResults();
    }

    if (this.query().trim()) {
      this._dropdownState.open(this.resultsId());
      this.search();
    } else {
      this._dropdownState.close(this.typeMenuId());
    }
  }

  onResultsScroll(event: Event): void {
    const list = event.target as HTMLElement;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - LOAD_MORE_THRESHOLD_PX) {
      this.loadMore();
    }
  }

  loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasNext()) return;
    this.fetchPage(this._page + 1);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this._elementRef.nativeElement.contains(event.target as Node)) return;
    this._dropdownState.close(this.typeMenuId());
    this._dropdownState.close(this.resultsId());
  }

  private search(): void {
    const query = this.query().trim();
    if (!query) return;

    const key = this.searchKey();
    if (key === this._lastSearchKey) {
      // Same search as before: just drop the debounce spinner unless that request is still running.
      if (!this._request || this._request.closed) {
        this.isLoading.set(false);
      }
      return;
    }
    this._lastSearchKey = key;

    this.fetchPage(1);
  }

  private searchKey(): string {
    return `${this.type()}|${this.query().trim()}`;
  }

  private fetchPage(page: number): void {
    const query = this.query().trim();
    // Cancel the previous request first: its finalize() resets the loading flags.
    this._request?.unsubscribe();

    const request$ =
      this.type() === 'restaurants'
        ? this._clientsMenuService.searchRestaurants(query, page, PAGE_SIZE)
        : this._menuItemService.searchProducts(query, page, PAGE_SIZE);

    if (page === 1) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    this._request = request$
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
        }),
      )
      .subscribe({
        next: (res) => {
          this._page = page;
          if (page === 1) {
            this.results.set(res.result);
          } else {
            this.results.update((current) => [...current, ...res.result]);
          }
          this.hasNext.set(page < res.totalPages && res.result.length > 0);
        },
        error: (err) => {
          console.error('Search failed:', err);
          if (page === 1) {
            this.results.set([]);
            // Allow retrying the same query.
            this._lastSearchKey = '';
          }
          this.hasNext.set(false);
        },
      });
  }

  private resetResults(): void {
    this._request?.unsubscribe();
    this._lastSearchKey = '';
    this._page = 1;
    this.results.set([]);
    this.hasNext.set(false);
    this.isLoading.set(false);
    this.isLoadingMore.set(false);
  }
}
