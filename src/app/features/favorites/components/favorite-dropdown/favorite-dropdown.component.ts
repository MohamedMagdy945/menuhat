import {
  Component,
  inject,
  signal,
  computed,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../favorites.service';
import { FavoriteProduct } from '../../models';
import { UserDataService } from '../../../../core/services/userData.service';
import { CartService } from '../../../cart/cart.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../core/environments/environment';
import { SideDrawerComponent } from '../../../../shared/components/side-drawer/side-drawer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorite-dropdown',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, SideDrawerComponent],
  templateUrl: './favorite-dropdown.component.html',
  styleUrl: './favorite-dropdown.component.css',
})
export class FavoriteDropdownComponent implements OnInit {
  private readonly _favoritesService = inject(FavoritesService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _cartService = inject(CartService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly filesUrl = environment.filesUrl;

  readonly isOpen = signal<boolean>(false);
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

  toggleDropdown(event?: Event): void {
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

  goToFavorites(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen.set(false);
    this.isDrawerOpen.set(true);
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

  goToProduct(productId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDrawerOpen.set(false);
    this._router.navigate(['/menu-items', productId]);
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

  getItemImageUrl(photoURL: string | null): string {
    if (!photoURL) {
      return '/images/default-meal.png';
    }
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    const cleanPath = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    return `${this.filesUrl}${cleanPath}`;
  }

  getItemPhoto(photoURL: string | null): string {
    return this.getItemImageUrl(photoURL);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this._elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
      this._cdr.detectChanges();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this._cdr.detectChanges();
    }
  }
}
