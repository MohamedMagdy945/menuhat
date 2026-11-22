import {
  Component,
  inject,
  signal,
  computed,
  input,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../cart.service';
import { UserDataService } from '../../../../core/services/userData.service';
import { DropdownStateService } from '../../../../core/services/dropdown-state.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../core/environments/environment';
import { AddCartItem } from '../../models/add-cart-item.model';
import { CartMenuItem } from '../../models/cart-menu-item.model';
import { FILES_ORIGIN } from '../../../../core/constants/files.constants';

@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './cart-dropdown.component.html',
  styleUrl: './cart-dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDropdownComponent implements OnInit {
  private readonly _cartService = inject(CartService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _dropdownState = inject(DropdownStateService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly filesUrl = environment.filesUrl;

  readonly variant = input<'desktop' | 'mobile-header'>('desktop');

  readonly dropdownId = computed(() => `cart-${this.variant()}`);
  readonly isOpen = computed(() => this._dropdownState.activeDropdown() === this.dropdownId());
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
      this._dropdownState.close(this.dropdownId());
      this._router.navigate(['/login']);
      return;
    }

    const nextState = this._dropdownState.toggle(this.dropdownId());

    if (nextState) {
      this.fetchCartData();
    }
  }

  closeDropdown(): void {
    this._dropdownState.close(this.dropdownId());
  }

  fetchCartData(): void {
    this._cartService.GetCartsByUserId().subscribe({
      next: () => {
        this._cdr.markForCheck();
      },
      error: () => {
        this._cdr.markForCheck();
      },
    });
  }

  goToCart(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._dropdownState.close(this.dropdownId());
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
      price: it.price ?? 0,
    }));

    this._cartService.AddItemsAndRefreshCart(payload).subscribe({
      next: () => {
        const action = delta > 0 ? 'زيادة' : 'تقليل';
        this._toastService.success(`تم ${action} كمية "${item.productName}" إلى ${newQty}`);
      },
      error: (err) => {
        console.error('Error changing cart quantity:', err);
        this._toastService.error('تعذر تحديث الكمية، يرجى المحاولة لاحقاً');
      },
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
    const serverHost = FILES_ORIGIN;

    if (cleanPath.startsWith('/DefaultImages') || cleanPath.startsWith('/UploadedFiles')) {
      return `${serverHost}${encodeURI(cleanPath)}`;
    }
    return `${this.filesUrl}${encodeURI(cleanPath)}`;
  }

  handleImageError(event: Event, item: CartMenuItem): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    const photo = item.photoURL;
    if (photo && !img.dataset['retried']) {
      img.dataset['retried'] = 'true';
      const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;
      if (!img.src.includes('/UploadedFiles/')) {
        img.src = `${this.filesUrl}${encodeURI(cleanPath)}`;
        return;
      }
    }

    img.src = '/images/default-meal.png';
  }

  removeItem(item: CartMenuItem, event: Event): void {
    event.stopPropagation();

    this._cartService.removeItem(item.id).subscribe({
      next: () => {
        this._toastService.success(`تم حذف "${item.productName}" من السلة`);
      },
      error: (err) => {
        console.error('Error removing item from cart:', err);
        this._toastService.error('تعذر حذف المنتج من السلة، يرجى المحاولة لاحقاً');
      },
    });
  }

  goToProduct(productId: number | undefined, event: Event): void {
    if (!productId) return;
    event.stopPropagation();
    this._dropdownState.close(this.dropdownId());
    this._router.navigate(['/menu-items', productId]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this._elementRef.nativeElement.contains(target)) {
      this._dropdownState.close(this.dropdownId());
      this._cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this._dropdownState.close(this.dropdownId());
      this._cdr.markForCheck();
    }
  }
}
