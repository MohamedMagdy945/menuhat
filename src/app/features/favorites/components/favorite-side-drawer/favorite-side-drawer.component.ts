import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService } from '../../favorites.service';
import { FavoriteProduct } from '../../models';
import { UserDataService } from '../../../../core/services/userData.service';
import { CartService } from '../../../cart/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../core/environments/environment';
import { SideDrawerComponent } from '../../../../shared/components/side-drawer/side-drawer.component';

@Component({
  selector: 'app-favorite-side-drawer',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, SideDrawerComponent],
  templateUrl: './favorite-side-drawer.component.html',
  styleUrl: './favorite-side-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteSideDrawerComponent implements OnInit {
  private readonly _favoritesService = inject(FavoritesService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _cartService = inject(CartService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly filesUrl = environment.filesUrl;

  readonly isDrawerOpen = signal<boolean>(false);
  readonly favorites = this._favoritesService.favorites;
  readonly favoritesCount = computed(() => this.favorites().length);
  readonly isLoading = this._favoritesService.isLoading;

  ngOnInit(): void {
    if (this.isUserLoggedIn() && this.favorites().length === 0) {
      this._favoritesService.loadFavorites();
    }
  }

  isUserLoggedIn(): boolean {
    return !!(this._userDataService.isAuthenticated() || this._userDataService.getToken());
  }

  toggleDrawer(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isUserLoggedIn()) {
      this.isDrawerOpen.set(false);
      this._router.navigate(['/login']);
      return;
    }

    const nextState = !this.isDrawerOpen();
    this.isDrawerOpen.set(nextState);

    if (nextState && this.favorites().length === 0) {
      this._favoritesService.loadFavorites(true);
    }
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  addToCart(item: FavoriteProduct, event: Event): void {
    event.stopPropagation();
    this._cartService.addItem({
      productId: item.id,
      productPriceId: null,
      quantity: 1,
      serial: '',
    }).subscribe({
      next: () => {
        this._toastService.success('تمت إضافة الوجبة إلى السلة');
      },
      error: () => {
        this._toastService.error('تعذر إضافة الوجبة إلى السلة');
      },
    });
  }

  removeFavorite(item: FavoriteProduct, event: Event): void {
    event.stopPropagation();
    this._favoritesService.toggleFavorite(item.id, item);
  }

  getItemPrice(item: FavoriteProduct): number {
    if (item.price !== null && item.price !== undefined) {
      return item.price;
    }
    if (item.details && item.details.length > 0) {
      return item.details[0].price;
    }
    return 0;
  }

  getItemPhoto(photoURL: string | null): string {
    if (!photoURL) {
      return '/images/default-meal.png';
    }
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    const cleanPath = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    return `${this.filesUrl}${cleanPath}`;
  }
}
