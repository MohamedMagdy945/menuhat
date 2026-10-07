import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RestaurantMenuProduct } from '../../../restaurants/models/restaurant-menu-product';
import { environment } from '../../../../core/environments/environment';
import { MenuItem } from '../../models/menu-item';

@Component({
  selector: 'app-menu-item-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item-details.component.html',
  styleUrl: './menu-item-details.component.css',
})
export class MenuItemDetailsComponent implements OnInit {
  readonly apiUrl = environment.filesUrl;
  readonly item = signal<RestaurantMenuProduct | MenuItem | null>(null);
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Get state from navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras.state['item']) {
      this.item.set(navigation.extras.state['item']);
    } else {
      // Fallback: check history state
      const state = history.state;
      if (state && state.item) {
        this.item.set(state.item);
      } else {
        // If no state, we could fetch from API using route param id
        // For now, we will just log or handle missing data
        console.warn('No item data found in navigation state');
      }
    }
  }

  readonly isFavorite = signal(false);
  readonly quantity = signal(1);
  readonly selectedSize = signal('medium'); // 'small', 'medium', 'large'

  // Mock addons state for UI
  readonly addons = signal([
    { id: 1, name: 'بطاطس مقلية مقرمشة', price: 25, selected: false, image: '/images/fries.jpg' },
    { id: 2, name: 'بيبسي بارد 330 مل', price: 15, selected: false, image: '/images/pepsi.jpg' },
    { id: 3, name: 'أصابع موزاريلا (4 قطع)', price: 35, selected: false, image: '/images/mozzarella.jpg' },
    { id: 4, name: 'صوص بيج ماك إضافي', price: 10, selected: false, image: '/images/sauce.jpg' },
  ]);

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  toggleAddon(id: number): void {
    this.addons.update(addons => 
      addons.map(addon => addon.id === id ? { ...addon, selected: !addon.selected } : addon)
    );
  }

  getTotalPrice(): number {
    const currentItem = this.item();
    if (!currentItem) return 0;
    
    let basePrice = currentItem.price;
    // Add size differences (mock)
    if (this.selectedSize() === 'small') basePrice -= 20;
    if (this.selectedSize() === 'large') basePrice += 25;

    // Add selected addons
    const addonsTotal = this.addons().filter(a => a.selected).reduce((sum, addon) => sum + addon.price, 0);

    return (basePrice + addonsTotal) * this.quantity();
  }

  readonly isAddingToCart = signal(false);
  readonly isAddedToCart = signal(false);

  addToCart(): void {
    if (this.isAddingToCart()) {
      return;
    }

    this.isAddingToCart.set(true);
    setTimeout(() => {
      this.isAddingToCart.set(false);
      this.isAddedToCart.set(true);
    }, 800);
  }

  getDiscount(item: any): string | number {
    if (item.discountPercentage) return item.discountPercentage;
    if (item.oldPrice && item.oldPrice > item.price) {
      return ((item.oldPrice - item.price) / item.oldPrice * 100).toFixed(0);
    }
    return 0;
  }

  getSmallPrice(item: any): number {
    return (item?.price || 0) - 20;
  }

  getLargePrice(item: any): number {
    return (item?.price || 0) + 25;
  }
}
