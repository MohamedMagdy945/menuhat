import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../core/environments/environment';
import { CartService } from '../../../cart/cart.service';
import { MenuItemService } from '../../menu-items.service';
import { FavoritesService } from '../../../favorites/favorites.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MenuProductDetails } from '../../models/menu-product-details';
import { ProductDetailItem } from '../../models/product-detail-item';

@Component({
  selector: 'app-menu-item-details',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './menu-item-details.component.html',
  styleUrl: './menu-item-details.component.css',
})
export class MenuItemDetailsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly _cartService = inject(CartService);
  private readonly menuItemService = inject(MenuItemService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly _toast = inject(ToastService);

  readonly filesUrl = environment.filesUrl;
  readonly item = signal<MenuProductDetails | null>(null);
  readonly selectedDetail = signal<ProductDetailItem | null>(null);
  readonly quantity = signal<number>(1);
  readonly isLoadingDetails = signal<boolean>(false);
  readonly isAddingToCart = signal<boolean>(false);
  readonly _addedManually = signal<boolean>(false);
  readonly specialNotes = signal<string>('');
  readonly copiedShare = signal<boolean>(false);

  // Computed pricing based on active selected size/detail or base product
  readonly currentPrice = computed<number>(() => {
    const detail = this.selectedDetail();
    if (detail && detail.price !== null && detail.price !== undefined) {
      return detail.price;
    }
    const current = this.item();
    return current?.price ?? 0;
  });

  readonly currentOldPrice = computed<number | null>(() => {
    const detail = this.selectedDetail();
    if (detail) {
      return detail.oldPrice ?? null;
    }
    return this.item()?.oldPrice ?? null;
  });

  readonly currentDiscount = computed<number>(() => {
    const detail = this.selectedDetail();
    if (detail?.discountPercentage) {
      return detail.discountPercentage;
    }
    return this.item()?.discountPercentage ?? 0;
  });

  readonly totalPrice = computed<number>(() => {
    return this.currentPrice() * this.quantity();
  });

  readonly savings = computed<number>(() => {
    const oldP = this.currentOldPrice();
    const curP = this.currentPrice();
    return oldP && oldP > curP ? oldP - curP : 0;
  });

  readonly isFavorite = computed<boolean>(() => {
    const id = this.getProductId();
    return id ? this.favoritesService.isFavorite(id) : false;
  });

  readonly isAddedToCart = computed<boolean>(() => {
    const prodId = this.getProductId();
    if (!prodId) return false;
    const detailId = this.selectedDetail()?.id ?? null;
    return (
      this._addedManually() ||
      this._cartService.cartItems().some(
        (it) => it.productId === prodId && ((!it.productPriceId && !detailId) || it.productPriceId === detailId)
      )
    );
  });

  ngOnInit(): void {
    if (!this._cartService.cartData()) {
      this._cartService.GetCartsByUserId().subscribe({ error: () => {} });
    }

    // 1. Initial seed from router state if available for instant rendering
    const state = history.state;
    if (state?.item) {
      this._applyProductData(state.item);
    }

    // 2. Fetch fresh dynamic product details & sizes from API
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProductDetails(id);
      }
    });
  }

  loadProductDetails(id: number): void {
    this.isLoadingDetails.set(true);
    this.menuItemService.getProductById(id).subscribe({
      next: (res: any) => {
        this.isLoadingDetails.set(false);
        const product = Array.isArray(res?.result)
          ? res.result[0]
          : Array.isArray(res)
          ? res[0]
          : res?.result ?? res;

        if (product) {
          this._applyProductData(product);
        }
      },
      error: (err) => {
        this.isLoadingDetails.set(false);
        console.error('Failed to load menu product details:', err);
      },
    });
  }

  private _applyProductData(data: any): void {
    const prev = this.item();
    const normalized: MenuProductDetails = {
      ...data,
      id: data.id ?? data.productId ?? data.mostrequestesId ?? 0,
      name: data.name || data.productName || prev?.name || '',
      productName: data.productName || data.name || prev?.productName || '',
      clientName: data.clientName || prev?.clientName || '',
      serial: data.serial || prev?.serial || '',
      menuCategoryName: data.menuCategoryName || prev?.menuCategoryName || '',
      details: Array.isArray(data.details) ? data.details : (prev?.details || []),
    };

    this.item.set(normalized);

    // Auto-select first size option if available
    if (normalized.details && normalized.details.length > 0) {
      const currentSelected = this.selectedDetail();
      const existingMatch = currentSelected ? normalized.details.find((d) => d.id === currentSelected.id) : null;
      this.selectedDetail.set(existingMatch || normalized.details[0]);
    } else {
      this.selectedDetail.set(null);
    }
  }

  selectDetail(detail: ProductDetailItem): void {
    this.selectedDetail.set(detail);
  }

  getProductId(): number | null {
    const current = this.item();
    if (!current) return null;
    return current.id || (current as any).productId || (current as any).mostrequestesId || null;
  }

  getProductSerial(): string {
    const current = this.item();
    return current?.serial || (current as any)?.serial || '';
  }

  getProductTitle(): string {
    const current = this.item();
    return current?.productName || current?.name || 'تفاصيل الصنف';
  }

  incrementQuantity(): void {
    this.quantity.update((q) => q + 1);
    if (this.isAddedToCart()) {
      this.addToCart();
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
      if (this.isAddedToCart()) {
        this.addToCart();
      }
    }
  }

  toggleFavorite(): void {
    const id = this.getProductId();
    if (id) {
      this.favoritesService.toggleFavorite(id, this.item() as any);
    }
  }

  async shareItem(): Promise<void> {
    const title = this.getProductTitle();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `اطلب الآن: ${title}`,
          url: window.location.href,
        });
        return;
      } catch {
        // User dismissed
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      this.copiedShare.set(true);
      setTimeout(() => this.copiedShare.set(false), 2000);
    }
  }

  addToCart(): void {
    const currentItem = this.item();
    const productId = this.getProductId();
    if (this.isAddingToCart() || !currentItem || !productId) return;

    this.isAddingToCart.set(true);

    const serial = this.getProductSerial();
    const detail = this.selectedDetail();
    // Price null is safely sent as 0
    const price = this.currentPrice() ?? 0;

    this._cartService
      .addItem({
        productId,
        productPriceId: detail ? detail.id : null,
        quantity: this.quantity(),
        serial,
        price,
      })
      .subscribe({
        next: () => {
          this.isAddingToCart.set(false);
          const wasAlreadyAdded = this._addedManually();
          this._addedManually.set(true);
          const productName = this.getProductTitle();
          const sizeTitle = detail?.title ? ` (${detail.title})` : '';
          if (wasAlreadyAdded) {
            this._toast.success(`تم تحديث كمية "${productName}${sizeTitle}" إلى ${this.quantity()}`);
          } else {
            this._toast.success(`تمت إضافة "${productName}${sizeTitle}" إلى السلة بنجاح`);
          }
        },
        error: (err) => {
          console.error('Error adding item to cart:', err);
          this.isAddingToCart.set(false);
          this._toast.error('تعذر إضافة الوجبة إلى السلة، يرجى المحاولة لاحقاً');
        },
      });
  }

  getItemImageUrl(photoURL: string | null | undefined): string {
    if (!photoURL) {
      return '/images/default-meal.png';
    }
    if (photoURL.startsWith('http')) {
      return photoURL;
    }
    const cleanPath = photoURL.startsWith('/') ? photoURL : `/${photoURL}`;
    const serverHost = environment.apiUrl.replace(/\/api\/?$/, '');

    if (cleanPath.startsWith('/DefaultImages') || cleanPath.startsWith('/UploadedFiles')) {
      return `${serverHost}${encodeURI(cleanPath)}`;
    }
    return `${environment.filesUrl}${encodeURI(cleanPath)}`;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
