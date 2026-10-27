import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../cart.service';
import { UserDataService } from '../../../../core/services/userData.service';
import { environment } from '../../../../core/environments/environment';
import { AddCartItem, CartMenuItem } from '../../models/cart-item';

@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './cart-dropdown.component.html',
  styleUrl: './cart-dropdown.component.css'
})
export class CartDropdownComponent implements OnInit {
  private readonly _cartService = inject(CartService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly apiUrl = environment.apiUrl;
  readonly filesUrl = environment.filesUrl;

  readonly isOpen = signal<boolean>(false);
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

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isUserLoggedIn()) {
      this.isOpen.set(false);
      this._router.navigate(['/login']);
      return;
    }

    const nextState = !this.isOpen();
    this.isOpen.set(nextState);

    if (nextState && !this._cartService.cartData()) {
      this.fetchCartData();
    }
  }

  fetchCartData(): void {
    this._cartService.GetCartsByUserId().subscribe({
      next: () => {
        this._cdr.detectChanges();
      },
      error: () => {
        this._cdr.detectChanges();
      }
    });
  }

  goToCart(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen.set(false);
    this._router.navigate(['/cart']);
  }

  getItemImageUrl(photoURL: string | null): string {
    if (!photoURL) {
      return '/images/default-meal.png';
    }
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    return `${this.filesUrl}${photoURL}`;
  }

  removeItem(item: CartMenuItem, event: Event): void {
    event.stopPropagation();
    const allItems = this.cartItems();
    const isMatch = (it: CartMenuItem): boolean =>
      it === item ||
      (!!it.id && !!item.id && it.id === item.id) ||
      (it.productId === item.productId && it.productPriceId === item.productPriceId);

    let payload: AddCartItem[] = allItems
      .filter((it) => !isMatch(it))
      .map((it) => ({
        productId: it.productId,
        productPriceId: it.productPriceId ?? null,
        quantity: it.quantity,
        serial: it.serial ?? '',
      }));

    if (payload.length === 0) {
      payload = [{
        productId: item.productId,
        productPriceId: item.productPriceId ?? null,
        quantity: 0,
        serial: item.serial ?? '',
      }];
    }

    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      error: (err) => console.error('Error removing item from cart:', err),
    });
  }

  goToProduct(productId: number | undefined, event: Event): void {
    if (!productId) return;
    event.stopPropagation();
    this.isOpen.set(false);
    this._router.navigate(['/menu-items', productId]);
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
