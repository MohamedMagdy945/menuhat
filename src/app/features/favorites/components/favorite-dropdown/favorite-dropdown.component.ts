import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { DropdownStateService } from '../../../../core/services/dropdown-state.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserDataService } from '../../../../core/services/userData.service';
import { resolveImageUrl } from '../../../../shared/utils/resolve-image-url';
import { CartService } from '../../../cart/cart.service';
import { FavoritesService } from '../../favorites.service';
import { FavoriteProduct } from '../../models/favorite-product.model';
import { favoritePrice } from '../../utils/favorite-pricing';

@Component({
  selector: 'app-favorite-dropdown',
  imports: [DecimalPipe],
  templateUrl: './favorite-dropdown.component.html',
  styleUrl: './favorite-dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteDropdownComponent {
  private readonly _favorites = inject(FavoritesService);
  private readonly _userData = inject(UserDataService);
  private readonly _dropdownState = inject(DropdownStateService);
  private readonly _cart = inject(CartService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  readonly variant = input<'desktop' | 'mobile-header'>('desktop');

  readonly dropdownId = computed(() => `favorite-${this.variant()}`);
  readonly isOpen = computed(() => this._dropdownState.activeDropdown() === this.dropdownId());
  readonly favorites = this._favorites.favorites;
  readonly favoritesCount = computed(() => this.favorites().length);
  readonly isLoading = this._favorites.isLoading;

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();

    if (!this._userData.getToken()) {
      this.closeDropdown();
      this._router.navigate(['/login']);
      return;
    }

    const opened = this._dropdownState.toggle(this.dropdownId());
    // Retry when opening after a failed or empty load.
    if (opened && this.favorites().length === 0) {
      this._favorites.loadFavorites();
    }
  }

  closeDropdown(): void {
    this._dropdownState.close(this.dropdownId());
  }

  goToFavorites(event?: Event): void {
    event?.stopPropagation();
    this.closeDropdown();
    this._router.navigate(['/favorites']);
  }

  goToProduct(productId: number, event?: Event): void {
    event?.stopPropagation();
    this.closeDropdown();
    this._router.navigate(['/menu-items', productId]);
  }

  addToCart(item: FavoriteProduct, event: Event): void {
    event.stopPropagation();
    this._cart
      .addItem({ productId: item.id, productPriceId: null, quantity: 1, serial: item.serial ?? '' })
      .subscribe({
        next: () => this._toast.success('تمت إضافة الوجبة إلى السلة'),
        error: () => this._toast.error('تعذر إضافة الوجبة إلى السلة'),
      });
  }

  removeFavorite(item: FavoriteProduct, event: Event): void {
    event.stopPropagation();
    this._favorites.toggleFavorite(item.id, item);
  }

  isPending(item: FavoriteProduct): boolean {
    return this._favorites.isPending(item.id);
  }

  getItemPrice(item: FavoriteProduct): number {
    return favoritePrice(item);
  }

  getItemImageUrl(photoURL: string | null): string {
    return resolveImageUrl(photoURL, '/images/default-meal.png');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this._elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.closeDropdown();
  }
}
