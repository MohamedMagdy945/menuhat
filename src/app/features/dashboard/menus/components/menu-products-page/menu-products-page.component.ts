import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuProductsService } from './menu-products.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { MenuProduct } from '../../models/menu-product.model';

@Component({
  selector: 'app-menu-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './menu-products-page.component.html',
  styleUrl: './menu-products-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuProductsPageComponent implements OnInit {
  protected readonly productsService = inject(MenuProductsService);
  protected readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Core Signals
  readonly products = this.productsService.products;
  readonly itemsCount = this.productsService.itemsCount;
  readonly isLoading = this.productsService.isLoading;
  readonly errorMessage = this.productsService.errorMessage;

  // Route / Context state
  readonly menuCategoryId = signal<number>(1);
  readonly menuSubCategoryId = signal<number>(1);
  readonly subCategoryTitle = signal<string>('الأقسام الفرعية');
  readonly categoryTitle = signal<string>('جميع الأقسام');

  // Filter & Search
  readonly searchQuery = signal<string>('');
  readonly activeStatusFilter = signal<'all' | 'offers' | 'active' | 'hidden'>('all');

  readonly restaurantName = computed<string>(() => {
    const data = this.dashboardService.dashboardData();
    return data?.restaurant?.name || 'كومبو سفن فودز';
  });

  // Filtered Products Computed
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeStatusFilter();
    let list = this.products();

    // Text search filter
    if (query) {
      list = list.filter(
        (p) =>
          (p.productName && p.productName.toLowerCase().includes(query)) ||
          (p.productName_En && p.productName_En.toLowerCase().includes(query)) ||
          (p.serial && p.serial.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filter === 'offers') {
      list = list.filter((p) => p.isOffer || (p.details && p.details.some((d) => d.isOffer)));
    } else if (filter === 'active') {
      list = list.filter((p) => !p.isHidden && !p.productIsHidden);
    } else if (filter === 'hidden') {
      list = list.filter((p) => p.isHidden || p.productIsHidden);
    }

    return list;
  });

  ngOnInit(): void {
    if (!this.dashboardService.dashboardData()) {
      this.dashboardService.loadDashboard();
    }

    // Read route params and queryParams
    this.route.queryParamMap.subscribe((qParams) => {
      const catId = Number(qParams.get('menuCategoryId') || qParams.get('MenuCategoryId') || 1);
      const subCatId = Number(
        qParams.get('menuSubCategoryId') ||
          qParams.get('MenuSubCategoryId') ||
          this.route.snapshot.paramMap.get('id') ||
          1
      );
      const subName = qParams.get('subCategoryName') || qParams.get('name');
      const catName = qParams.get('categoryName');

      this.menuCategoryId.set(catId);
      this.menuSubCategoryId.set(subCatId);

      if (subName) {
        this.subCategoryTitle.set(subName);
      }
      if (catName) {
        this.categoryTitle.set(catName);
      }

      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productsService
      .getProducts(this.menuCategoryId(), this.menuSubCategoryId())
      .subscribe({
        next: (items) => {
          if (items.length > 0) {
            const first = items[0];
            if (first.menuSubCategoryName) {
              this.subCategoryTitle.set(first.menuSubCategoryName);
            }
            if (first.menuCategoryName) {
              this.categoryTitle.set(first.menuCategoryName);
            }
          }
        },
      });
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.productsService.resolveImageUrl(url);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/menu/subcategories'], {
      queryParams: {
        menuCategoryId: this.menuCategoryId(),
      },
    });
  }

  formatPrice(price: number): string {
    return Number(price).toFixed(2).replace(/\.00$/, '');
  }
}
