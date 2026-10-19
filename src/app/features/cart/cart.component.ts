import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from './cart.service';
import { CartMenuItem } from './models/cart-item';
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
  readonly selectedItemIds = signal<Set<number>>(new Set());

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

  // Selected items calculation
  readonly selectedItems = computed<CartMenuItem[]>(() => {
    const selected = this.selectedItemIds();
    return this.cartItems().filter((item) => selected.has(item.id));
  });

  readonly isAllSelected = computed<boolean>(() => {
    const items = this.cartItems();
    if (items.length === 0) return false;
    return items.every((item) => this.selectedItemIds().has(item.id));
  });

  // Invoice calculations
  readonly subtotal = computed<number>(() => {
    return this.selectedItems().reduce((acc, item) => acc + item.total, 0);
  });

  readonly serviceFee = computed<number>(() => {
    return this.selectedItems().length > 0 ? this.serviceFeeAmount : 0;
  });

  readonly vat = computed<number>(() => {
    return this.subtotal() * this.taxRate;
  });

  readonly grandTotal = computed<number>(() => {
    return this.subtotal() + this.serviceFee() + this.vat();
  });

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
        const items = res?.result || [];
        this.cartItems.set(items);
        // Initially select all items
        const allIds = new Set<number>(items.map((i) => i.id));
        this.selectedItemIds.set(allIds);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedItemIds.set(new Set());
    } else {
      const allIds = new Set<number>(this.cartItems().map((i) => i.id));
      this.selectedItemIds.set(allIds);
    }
  }

  toggleSelectItem(itemId: number): void {
    const current = new Set(this.selectedItemIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.selectedItemIds.set(current);
  }

  changeQuantity(item: CartMenuItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      return;
    }

    const updated = this.cartItems().map((it) => {
      if (it.id === item.id) {
        const quantity = newQty;
        const total = quantity * it.price;
        return { ...it, quantity, total };
      }
      return it;
    });

    this.cartItems.set(updated);
  }

  deleteItem(itemId: number): void {
    const updated = this.cartItems().filter((it) => it.id !== itemId);
    this.cartItems.set(updated);

    const selected = new Set(this.selectedItemIds());
    selected.delete(itemId);
    this.selectedItemIds.set(selected);
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

  checkout(): void {
    console.log('Proceed to checkout with selected items:', this.selectedItems());
  }
}
