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
import { Router, RouterLink } from '@angular/router';

import { DashboardService } from '../../../dashboard/dashboard.service';
import { MenusService } from '../../menus.service';
import { MenuMainCategory } from '../../models/menu-main-category.model';
import { MenuSubCategory } from '../../models/menu-sub-category.model';
import { MenuRestaurantCardData } from '../../models/menu-restaurant-card.model';
import { MenuViewSubSection } from '../../models/menu-view-sub-section.model';


@Component({
  selector: 'app-menu-details-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './menu-details-page.component.html',
  styleUrl: './menu-details-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDetailsPageComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  protected readonly menusService = inject(MenusService);
  private readonly router = inject(Router);

  readonly subSection = signal<MenuViewSubSection>('none');

  // Toggle Switches matching mobile design
  readonly isMenuClosed = signal<boolean>(false);
  readonly isMenuHidden = signal<boolean>(true);

  // Modals state
  readonly showQrModal = signal<boolean>(false);
  readonly showDeletePdfModal = signal<boolean>(false);
  readonly showEditInfoModal = signal<boolean>(false);
  readonly showAddCategoryModal = signal<boolean>(false);
  readonly showAddSubCategoryModal = signal<boolean>(false);

  // Form inputs
  readonly editName = signal<string>('');
  readonly editLocation = signal<string>('');
  readonly newCategoryName = signal<string>('');
  readonly newSubCategoryName = signal<string>('');
  readonly selectedMainCatId = signal<number>(1);

  // Categories signals
  readonly mainCategories = this.menusService.mainCategories;
  readonly subCategories = this.menusService.subCategories;
  readonly isLoadingCategories = this.menusService.isLoading;

  readonly restaurant = computed<MenuRestaurantCardData>(() => {
    const data = this.dashboardService.dashboardData();
    const rest = data?.restaurant;
    return {
      id: rest?.id ?? 0,
      name: rest?.name || 'كومبو سفن فودز',
      location: rest?.location || 'السادس من أكتوبر، القاهرة',
      isOpen: !this.isMenuClosed(),
      isVisible: !this.isMenuHidden(),
      coverUrl: rest?.coverUrl
        ? this.dashboardService.resolveImageUrl(rest.coverUrl)
        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      profileUrl: rest?.profileUrl
        ? this.dashboardService.resolveImageUrl(rest.profileUrl)
        : '',
      pdfUrl: rest?.pdfUrl
        ? this.dashboardService.resolveImageUrl(rest.pdfUrl)
        : '',
      qrCodeUrl: rest?.qrCodeUrl
        ? this.dashboardService.resolveImageUrl(rest.qrCodeUrl)
        : '',
      visitsCount: rest?.visitsCount || 6714,
    };
  });

  ngOnInit(): void {
    if (!this.dashboardService.dashboardData()) {
      this.dashboardService.loadDashboard();
    }
    this.menusService.getAllMainCategories().subscribe();
    this.menusService.getAllSubCategories().subscribe();

    const data = this.dashboardService.dashboardData();
    if (data?.restaurant) {
      this.isMenuClosed.set(data.restaurant.isOpen === false);
      this.isMenuHidden.set(data.restaurant.isVisible === false);
      this.editName.set(data.restaurant.name || '');
      this.editLocation.set(data.restaurant.location || '');
    }
  }

  goBack(): void {
    if (this.subSection() !== 'none') {
      this.subSection.set('none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.router.navigate(['/dashboard/menu']);
  }

  openCategories(): void {
    this.router.navigate(['/dashboard/menu/categories']);
  }

  openSubCategories(): void {
    this.router.navigate(['/dashboard/menu/subcategories']);
  }

  toggleCloseMenu(): void {
    const nextState = !this.isMenuClosed();
    this.isMenuClosed.set(nextState);
    this.dashboardService.toggleRestaurantStatus();
  }

  toggleHideMenu(): void {
    this.isMenuHidden.update((v) => !v);
  }

  openElectronicMenu(): void {
    const id = this.restaurant().id;
    const url = id ? `/restaurants/${id}` : '/restaurants';
    window.open(url, '_blank');
  }

  openPaperMenu(): void {
    const pdf = this.restaurant().pdfUrl;
    if (pdf) {
      window.open(pdf, '_blank');
    } else {
      alert('لم يتم رفع منيو ورقي (PDF) لهذا المطعم بعد.');
    }
  }

  openQrModal(): void {
    this.showQrModal.set(true);
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
  }

  openEditInfo(): void {
    this.editName.set(this.restaurant().name);
    this.editLocation.set(this.restaurant().location);
    this.showEditInfoModal.set(true);
  }

  saveEditInfo(): void {
    const data = this.dashboardService.dashboardData();
    if (data?.restaurant) {
      data.restaurant.name = this.editName().trim() || data.restaurant.name;
      data.restaurant.location =
        this.editLocation().trim() || data.restaurant.location;
      this.dashboardService.dashboardData.set({ ...data });
    }
    this.showEditInfoModal.set(false);
  }

  openDeletePdfModal(): void {
    this.showDeletePdfModal.set(true);
  }

  confirmDeletePdf(): void {
    const data = this.dashboardService.dashboardData();
    if (data?.restaurant) {
      data.restaurant.pdfUrl = '';
      this.dashboardService.dashboardData.set({ ...data });
    }
    this.showDeletePdfModal.set(false);
  }

  createCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.menusService.createMainCategory({ name }).subscribe({
      next: () => {
        this.newCategoryName.set('');
        this.showAddCategoryModal.set(false);
      },
    });
  }

  deleteCategory(cat: MenuMainCategory): void {
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat.menuMainCategoryName || cat.name}"؟`)) return;
    this.menusService.deleteMainCategory(cat.id).subscribe();
  }

  createSubCategory(): void {
    const name = this.newSubCategoryName().trim();
    const catId = this.selectedMainCatId();
    if (!name || !catId) return;
    this.menusService
      .createSubCategory({ name, menuMainCategoryId: catId })
      .subscribe({
        next: () => {
          this.newSubCategoryName.set('');
          this.showAddSubCategoryModal.set(false);
        },
      });
  }

  deleteSubCategory(sub: MenuSubCategory): void {
    if (!confirm(`هل أنت متأكد من حذف القسم الفرعي "${sub.name}"؟`)) return;
    this.menusService.deleteSubCategory(sub.id).subscribe();
  }
}
