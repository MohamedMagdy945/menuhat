import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from './cart.service';
import { AddCartItem, CartMenuItem } from './models/cart-item';
import { environment } from '../../core/environments/environment';
import { UserDataService } from '../../core/services/userData.service';

export interface RestaurantCartGroup {
  clientName: string;
  serial: string;
  items: CartMenuItem[];
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly _cartService = inject(CartService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);

  readonly filesUrl = environment.filesUrl;
  readonly isLoading = signal<boolean>(true);
  readonly cartItems = signal<CartMenuItem[]>([]);

  // Fixed service fee and tax rate (14%)
  readonly serviceFeeAmount = 25;
  readonly taxRate = 0.14;

  // Group items by Restaurant / Branch (clientName)
  readonly groupedItems = computed<RestaurantCartGroup[]>(() => {
    const items = this.cartItems();
    const map = new Map<string, CartMenuItem[]>();

    for (const item of items) {
      const key = item.clientName?.trim() || 'المطعم';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }

    const groups: RestaurantCartGroup[] = [];
    for (const [clientName, groupItems] of map.entries()) {
      groups.push({
        clientName,
        serial: groupItems[0]?.serial || '',
        items: groupItems,
      });
    }

    return groups;
  });

  // Invoice calculations — based on all cart items
  readonly subtotal = computed<number>(() =>
    this.cartItems().reduce((acc, item) => acc + item.total, 0)
  );

  readonly serviceFee = computed<number>(() =>
    this.cartItems().length > 0 ? this.serviceFeeAmount : 0
  );

  readonly vat = computed<number>(() => this.subtotal() * this.taxRate);

  readonly grandTotal = computed<number>(
    () => this.subtotal() + this.serviceFee() + this.vat()
  );

  ngOnInit(): void {
    if (!this.isLoggedIn()) {
      this._router.navigate(['/login']);
      return;
    }
    this.loadCart();
  }

  isLoggedIn(): boolean {
    return !!(this._userDataService.isAuthenticated() || this._userDataService.getToken());
  }

  loadCart(): void {
    this.isLoading.set(true);
    this._cartService.GetCartsByUserId().subscribe({
      next: (res) => {
        this.cartItems.set(res?.result || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // Single unified method — qty 0 = delete, qty > 0 = update
  // Always sends the FULL cart array so the API doesn't wipe other items
  updateCartItem(item: CartMenuItem, newQty: number): void {
    const allItems = this.cartItems();

    const payload: AddCartItem[] = allItems
      .filter((it) => it.id !== item.id || newQty > 0) // exclude if deleting
      .map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId,
        quantity: it.id === item.id ? newQty : it.quantity, // update target qty
        serial: it.serial,
      }));

    this.isLoading.set(true);
    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      next: (res) => {
        this.cartItems.set(res?.result || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  changeQuantity(item: CartMenuItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    this.updateCartItem(item, newQty);
  }

  deleteItem(itemId: number): void {
    const item = this.cartItems().find((it) => it.id === itemId);
    if (!item) return;
    this.updateCartItem(item, 0);
  }

  getItemImageUrl(photoURL: string | null): string {
    if (!photoURL) {
      return '/images/default.png';
    }
    if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
      return photoURL;
    }
    const clean = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    return `${this.filesUrl}${clean}`;
  }

  addToCart(items: AddCartItem[]): void {
    this.isLoading.set(true);
    this._cartService.AddItemsAndRefreshCart(items).subscribe({
      next: (res) => {
        const freshItems = res?.result || [];
        this.cartItems.set(freshItems);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  checkout(): void {
    console.log('Proceed to checkout with selected items:', this.cartItems());
  }
}
