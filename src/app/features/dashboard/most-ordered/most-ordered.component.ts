import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MostOrderedService } from './most-ordered.service';
import {
  ProductStatItem,
  MostOrderedPeriodFilter,
  DateFilterType,
} from './models/most-ordered.model';
import { MostOrderedCardComponent } from './components/most-ordered-card/most-ordered-card.component';

@Component({
  selector: 'app-most-ordered',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, MostOrderedCardComponent],
  templateUrl: './most-ordered.component.html',
  styleUrl: './most-ordered.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostOrderedComponent implements OnInit {
  protected readonly mostOrderedService = inject(MostOrderedService);

  readonly filterPeriod = signal<MostOrderedPeriodFilter>('all');
  readonly selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  readonly isLoading = this.mostOrderedService.isLoading;
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly showAll = signal<boolean>(true);

  // Formatted Date Label (e.g., "24 أكتوبر 2023")
  readonly formattedSelectedDate = computed(() => {
    try {
      const d = new Date(this.selectedDate());
      if (isNaN(d.getTime())) return 'جميع التواريخ';
      return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return this.selectedDate();
    }
  });

  // Raw items from service with fallback
  readonly items = computed<ProductStatItem[]>(() => {
    const list = this.mostOrderedService.productStats();
    if (list && list.length > 0) return list;
    return this.mostOrderedService.getDefaultProductStatsResponse().items;
  });

  // Summary Metrics
  readonly totalProductsCount = computed(() => this.items().length || 67);

  readonly totalOrdersSum = computed(() =>
    this.items().reduce((sum, item) => sum + (item.productCount || 0), 0)
  );

  readonly topProduct = computed(() => this.items()[0] || null);

  readonly topCategory = computed(() => {
    const counts: Record<string, number> = {};
    for (const it of this.items()) {
      if (it.menuSubCategoryName) {
        counts[it.menuSubCategoryName] = (counts[it.menuSubCategoryName] || 0) + (it.productCount || 1);
      }
    }
    let bestCat = 'سندوتشات';
    let max = 0;
    for (const [cat, sum] of Object.entries(counts)) {
      if (sum > max) {
        max = sum;
        bestCat = cat;
      }
    }
    return bestCat;
  });

  readonly categories = computed(() => {
    const set = new Set<string>();
    this.items().forEach((item) => {
      if (item.menuSubCategoryName) set.add(item.menuSubCategoryName.trim());
    });
    return ['all', ...Array.from(set)];
  });

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    const result = this.items().filter((it) => {
      const matchCat = cat === 'all' || (it.menuSubCategoryName && it.menuSubCategoryName.trim() === cat);
      const matchSearch =
        !q ||
        it.name.toLowerCase().includes(q) ||
        (it.menuSubCategoryName && it.menuSubCategoryName.toLowerCase().includes(q)) ||
        (it.title && it.title.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    if (!this.showAll() && result.length > 6) {
      return result.slice(0, 6);
    }
    return result;
  });

  ngOnInit(): void {
    this.fetchData();
  }

  setPeriod(period: MostOrderedPeriodFilter): void {
    this.filterPeriod.set(period);
    this.fetchData();
  }

  onDateChange(newDate: string): void {
    if (!newDate) return;
    this.selectedDate.set(newDate);
    this.fetchData(newDate);
  }

  fetchData(customDate?: string): void {
    const period = this.filterPeriod();
    let dateFilter: DateFilterType = 'None';
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (customDate) {
      dateFilter = 'None';
      startDate = `${customDate}T00:00:00`;
      endDate = `${customDate}T23:59:59`;
    } else {
      switch (period) {
        case 'today':
          dateFilter = 'CurrentDate';
          break;
        case 'yesterday':
          dateFilter = 'Yesterday';
          break;
        case 'week':
          dateFilter = 'LastSevenDays';
          break;
        case 'all':
        default:
          dateFilter = 'None';
          break;
      }
    }

    this.mostOrderedService
      .getProductStats({
        SortField: 'id',
        DateFilter: dateFilter,
        StartDate: startDate,
        EndDate: endDate,
      })
      .subscribe();
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  toggleShowAll(): void {
    this.showAll.update((v) => !v);
  }
}

