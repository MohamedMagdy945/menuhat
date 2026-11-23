import { CommonModule, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDateService } from '../../../../core/common-data/common-date';
import { DropdownItem } from '../../../../core/models/dropdown-item.model';
import { CartService } from '../../cart.service';
import { MenuOrdersService } from '../../menu-orders.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MenuOrderDTO } from '../../models/menu-order-dto.model';
import { MenuOrderResponse } from '../../models/menu-order-response.model';
import { CheckoutAddress } from '../../models/checkout-address.model';
import { CheckoutContactService } from '../../checkout-contact.service';
import { AddressPickerComponent } from '../address-picker/address-picker.component';
import { AddPhoneDialogComponent } from '../add-phone-dialog/add-phone-dialog.component';

/** دليفري، داخل السياره، تيك أواي، داخل المطعم */
const SUPPORTED_ORDER_TYPE_IDS = [1, 2, 3, 4];

@Component({
  selector: 'app-order-checkout',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, AddressPickerComponent, AddPhoneDialogComponent],
  templateUrl: './order-checkout.component.html',
  styleUrl: './order-checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCheckoutComponent implements OnInit {
  private readonly _commonDataService = inject(CommonDateService);
  private readonly _cartService = inject(CartService);
  private readonly _menuOrdersService = inject(MenuOrdersService);
  private readonly _contactService = inject(CheckoutContactService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly grandTotal = input<number>(0);
  readonly itemCount = input<number>(0);
  /** Set to order only one restaurant's items (POST /MenusOrders/Order/{menuId}); null = whole cart. */
  readonly menuId = input<number | null>(null);
  readonly restaurantName = input<string | null>(null);

  // Outputs
  readonly close = output<void>();
  readonly orderSuccess = output<MenuOrderResponse>();

  // State signals
  readonly orderTypes = signal<DropdownItem[]>([
    { id: 1, name: 'دليفري' },
    { id: 2, name: 'داخل السياره' },
    { id: 3, name: 'تيك أواي' },
    { id: 4, name: 'داخل المطعم' },
  ]);

  readonly selectedOrderTypeId = signal<number>(1);
  readonly selectedAddressId = signal<number | null>(null);
  readonly isAddressPickerOpen = signal(false);
  readonly selectedAddress = computed<CheckoutAddress | null>(
    () => this._contactService.addresses().find((a) => a.id === this.selectedAddressId()) ?? null,
  );

  /** The user's verified phone numbers (selectable chips). */
  readonly phones = this._contactService.phones;
  readonly isLoadingPhones = this._contactService.isLoadingPhones;
  readonly isAddPhoneOpen = signal(false);

  // Form fields
  readonly phone = signal<string>('');
  readonly carType = signal<string>('');
  readonly carColor = signal<string>('');
  readonly carNo = signal<string>('');
  readonly tableNumber = signal<string>('');
  readonly hallNumber = signal<string>('');

  // UI state
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  constructor() {
    // The dialog is reused for the whole cart and for single restaurants: start every opening clean.
    effect(() => {
      if (this.isOpen()) {
        untracked(() => {
          this.errorMessage.set(null);
          this.successMessage.set(null);
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadOrderTypes();
    this.loadAddresses();
    this.loadPhones();
  }

  private loadOrderTypes(): void {
    this._commonDataService.getOrderTypes().subscribe({
      next: (types) => {
        // Only the order types this checkout supports (the API also returns "طلب خاص" = 5).
        const supported = (types ?? []).filter((t) => SUPPORTED_ORDER_TYPE_IDS.includes(t.id));
        if (supported.length > 0) {
          this.orderTypes.set(supported);
        }
      },
      error: () => {
        // Fallback already pre-set
      },
    });
  }

  private loadAddresses(): void {
    this._contactService.loadAddresses().subscribe({
      next: (list) => {
        if (!this.selectedAddressId() && list.length > 0) {
          this.selectedAddressId.set(list[0].id);
        }
      },
      error: (err) => console.error('Failed to load addresses:', err),
    });
  }

  private loadPhones(): void {
    this._contactService.loadPhones().subscribe({
      next: (list) => {
        // Only verified numbers can be used: default to the first one.
        if (!list.includes(this.phone()) && list.length > 0) {
          this.phone.set(list[0]);
        }
      },
      error: (err) => console.error('Failed to load phone numbers:', err),
    });
  }

  openAddPhone(): void {
    if (this.isSubmitting()) return;
    this.isAddPhoneOpen.set(true);
  }

  onPhoneVerified(phone: string): void {
    this.phone.set(phone);
    this.isAddPhoneOpen.set(false);
    this.errorMessage.set(null);
  }

  selectPhone(phone: string): void {
    this.phone.set(phone);
    this.errorMessage.set(null);
  }

  openAddressPicker(): void {
    if (this.isSubmitting()) return;
    this.isAddressPickerOpen.set(true);
  }

  onAddressConfirmed(address: CheckoutAddress): void {
    this.selectedAddressId.set(address.id);
    this.isAddressPickerOpen.set(false);
    this.errorMessage.set(null);
  }

  addressLocation(address: CheckoutAddress): string {
    return [address.govenmentName_Ar, address.cityName_Ar].filter(Boolean).join(' - ');
  }

  selectOrderType(typeId: number): void {
    this.selectedOrderTypeId.set(typeId);
    this.errorMessage.set(null);
  }

  onClose(): void {
    if (this.isSubmitting()) return;
    this.close.emit();
  }

  submitOrder(): void {
    this.errorMessage.set(null);

    const typeId = this.selectedOrderTypeId();
    const phoneVal = this.phone().trim();

    // Validation
    if (typeId === 1) { // دليفري
      if (!phoneVal) {
        this.errorMessage.set('يرجى اختيار رقم الهاتف للتوصيل');
        return;
      }
      if (!this.selectedAddress()) {
        this.errorMessage.set('يرجى اختيار عنوان التوصيل');
        return;
      }
    } else if (typeId === 2) { // داخل السياره
      if (!phoneVal) {
        this.errorMessage.set('يرجى اختيار رقم الهاتف');
        return;
      }
      if (!this.carNo().trim()) {
        this.errorMessage.set('يرجى إدخال رقم لوحة السيارة');
        return;
      }
    } else if (typeId === 3) { // تيك أواي
      if (!phoneVal) {
        this.errorMessage.set('يرجى اختيار رقم الهاتف للاستلام');
        return;
      }
    } else if (typeId === 4) { // داخل المطعم
      if (!this.tableNumber().trim()) {
        this.errorMessage.set('يرجى إدخال رقم الطاولة');
        return;
      }
    }

    const payload: MenuOrderDTO = {
      orderTypeId: typeId,
      phone: phoneVal || null,
      addressId: typeId === 1 ? (this.selectedAddressId() || null) : null,
      carType: typeId === 2 ? (this.carType().trim() || null) : null,
      carColor: typeId === 2 ? (this.carColor().trim() || null) : null,
      carNo: typeId === 2 ? (this.carNo().trim() || null) : null,
      tableNumber: typeId === 4 ? (this.tableNumber().trim() || null) : null,
      hallNumber: typeId === 4 ? (this.hallNumber().trim() || null) : null,
    };

    this.isSubmitting.set(true);

    this._menuOrdersService.createOrder(payload, this.menuId()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);

        if (this._menuOrdersService.hasInvalidMenus(res)) {
          this.errorMessage.set(this._menuOrdersService.getErrorMessage({ error: res }));
          return;
        }

        this.orderSuccess.emit(res);

        // Items from other restaurants are still in the cart: stay on the cart page.
        if (this._cartService.cartItems().length > 0) {
          this._toast.success(res?.message || 'تم إرسال الطلب بنجاح');
          this.close.emit();
          return;
        }

        this.successMessage.set('تم إرسال الطلب بنجاح! جاري تحويلك إلى طلباتي...');
        setTimeout(() => {
          this.successMessage.set(null);
          this.close.emit();
          this._router.navigate(['/my-orders']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(this._menuOrdersService.getErrorMessage(err));
      },
    });
  }

  getOrderTypeIcon(typeId: number): string {
    switch (typeId) {
      case 1:
        return 'moped';
      case 2:
        return 'directions_car';
      case 3:
        return 'shopping_bag';
      case 4:
        return 'restaurant';
      default:
        return 'receipt_long';
    }
  }
}
