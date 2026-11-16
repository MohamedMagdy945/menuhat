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
import { Router } from '@angular/router';

import { DashboardService } from '../../../dashboard/dashboard.service';
import { MenusService } from '../../menus.service';
import { MenuMainCategory } from '../../models/menu-main-category.model';

@Component({
  selector: 'app-menu-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-categories-page.component.html',
  styleUrl: './menu-categories-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCategoriesPageComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  protected readonly menusService = inject(MenusService);
  private readonly router = inject(Router);

  // Categories signals from service
  readonly mainCategories = this.menusService.mainCategories;
  readonly isLoading = this.menusService.isLoading;
  readonly isSaving = this.menusService.isSaving;

  // Modals state
  readonly showAddModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  // Active item & form fields
  readonly selectedCategory = signal<MenuMainCategory | null>(null);
  readonly categoryName = signal<string>('');
  readonly categoryNameEn = signal<string>('');

  readonly restaurantName = computed<string>(() => {
    const data = this.dashboardService.dashboardData();
    return data?.restaurant?.name || 'كومبو سفن فودز';
  });

  ngOnInit(): void {
    if (!this.dashboardService.dashboardData()) {
      this.dashboardService.loadDashboard();
    }
    this.menusService.getAllMainCategories().subscribe();
  }

  resolveImageUrl(url: string | null | undefined): string {
    return this.menusService.resolveImageUrl(url);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/menu/details']);
  }

  openAddModal(): void {
    this.categoryName.set('');
    this.categoryNameEn.set('');
    this.selectedCategory.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  createCategory(): void {
    const name = this.categoryName().trim();
    if (!name) return;

    this.menusService
      .createMainCategory({
        menuMainCategoryName: name,
        menuMainCategoryName_En: this.categoryNameEn().trim() || undefined,
        name,
        name_En: this.categoryNameEn().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.categoryName.set('');
          this.categoryNameEn.set('');
          this.showAddModal.set(false);
        },
      });
  }

  openEditModal(cat: MenuMainCategory): void {
    this.selectedCategory.set(cat);
    this.categoryName.set(cat.menuMainCategoryName || cat.name || '');
    this.categoryNameEn.set(cat.menuMainCategoryName_En || cat.name_En || '');
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCategory.set(null);
  }

  saveEditCategory(): void {
    const cat = this.selectedCategory();
    const name = this.categoryName().trim();
    if (!cat || !name) return;

    this.menusService
      .updateMainCategory(cat.id, {
        menuMainCategoryName: name,
        menuMainCategoryName_En: this.categoryNameEn().trim() || undefined,
        name,
        name_En: this.categoryNameEn().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.closeEditModal();
        },
      });
  }

  askDeleteCategory(cat: MenuMainCategory): void {
    this.selectedCategory.set(cat);
    this.showDeleteModal.set(true);
  }

  deleteCategory(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    this.menusService.deleteMainCategory(cat.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.selectedCategory.set(null);
      },
    });
  }
}
