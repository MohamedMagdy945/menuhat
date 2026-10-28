import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../cart.service';
import { UserDataService } from '../../../../core/services/userData.service';
import { environment } from '../../../../core/environments/environment';
import { AddCartItem, CartMenuItem } from '../../models/cart-item';
import { SideDrawerComponent } from '../../../../shared/components/side-drawer/side-drawer.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, SideDrawerComponent],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent implements OnInit {
  private readonly _cartService = inject(CartService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);

  readonly apiUrl = environment.apiUrl;
  readonly filesUrl = environment.filesUrl;

  readonly isDrawerOpen = signal<boolean>(false);
  readonly cartItems = this._cartService.cartItems;
  readonly cartCount = this._cartService.cartCount;
  readonly totalPrice = this._cartService.cartTotalPrice;
  readonly isLoading = this._cartService.isLoading;

  ngOnInit(): void {
    if (this.isUserLoggedIn() && !this._cartService.cartData()) {
      this.fetchCartData();
    }
  }

  isUserLoggedIn(): boolean {
    return !!(this._userDataService.isAuthenticated() || this._userDataService.getToken());
  }

  open(): void {
    this.isDrawerOpen.set(true);
    this.fetchCartData();
  }

  close(): void {
    this.closeDrawer();
  }

  toggleDrawer(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const nextState = !this.isDrawerOpen();
    this.isDrawerOpen.set(nextState);

    if (nextState) {
      this.fetchCartData();
    }
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  fetchCartData(): void {
    this._cartService.GetCartsByUserId().subscribe();
  }

  goToCheckout(): void {
    this.isDrawerOpen.set(false);
    this._router.navigate(['/cart']);
  }

  changeQuantity(item: CartMenuItem, delta: number, event?: Event): void {
    if (event) event.stopPropagation();
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(item, event || new Event('click'));
      return;
    }
    const allItems = this.cartItems();
    const isMatch = (it: CartMenuItem): boolean =>
      it === item ||
      (!!it.id && !!item.id && it.id === item.id) ||
      (it.productId === item.productId && it.productPriceId === item.productPriceId);

    const payload: AddCartItem[] = allItems.map((it) => ({
      productId: it.productId,
      productPriceId: it.productPriceId ?? null,
      quantity: isMatch(it) ? newQty : it.quantity,
      serial: it.serial ?? '',
    }));

    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      error: (err) => console.error('Error changing cart quantity:', err),
    });
  }

  removeItem(item: CartMenuItem, event: Event): void {
    event.stopPropagation();
    const allItems = this.cartItems();
    const isMatch = (it: CartMenuItem): boolean =>
      it === item ||
      (!!it.id && !!item.id && it.id === item.id) ||
      (it.productId === item.productId && it.productPriceId === item.productPriceId);

    const payload: AddCartItem[] = allItems
      .filter((it) => !isMatch(it))
      .map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId ?? null,
        quantity: it.quantity,
        serial: it.serial ?? '',
      }));

    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      error: (err) => console.error('Error removing cart item:', err),
    });
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
}
