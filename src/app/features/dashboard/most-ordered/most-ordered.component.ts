import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OwnerReportsService, ProductStatItem } from '../../../core/services/owner-reports.service';

@Component({
  selector: 'app-most-ordered',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DecimalPipe],
  templateUrl: './most-ordered.component.html',
  styleUrl: './most-ordered.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostOrderedComponent implements OnInit {
  protected readonly reportsService = inject(OwnerReportsService);

  readonly items = this.reportsService.productStats;
  readonly isLoading = this.reportsService.isLoading;
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');

  // Summary Metrics
  readonly totalProductsCount = computed(() => this.items().length || 50);

  readonly totalOrdersSum = computed(() =>
    this.items().reduce((sum, item) => sum + item.ordersCount, 0) || 1218
  );

  readonly totalRevenueSum = computed(() =>
    this.items().reduce((sum, item) => sum + item.totalRevenue, 0) || 129345
  );

  readonly topProduct = computed(() => this.items()[0] || null);

  readonly categories = computed(() => {
    const set = new Set<string>();
    this.items().forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  });

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    return this.items().filter((it) => {
      const matchCat = cat === 'all' || it.category === cat;
      const matchSearch = !q || it.name.toLowerCase().includes(q) || (it.category && it.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  });

  ngOnInit(): void {
    // static String ownerProductStats = '$baseUrl/Reports/product-stats';
    this.reportsService.getProductStats().subscribe();
  }
}

