import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonDateService, DropdownItem } from '../../../../core/common-data/common-date';
import { UserDataService } from '../../../../core/services/userData.service';
import { CartService } from '../../cart.service';
import { MenuOrderDTO } from '../../models/order';

@Component({
  selector: 'app-order-checkout',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './order-checkout.component.html',
  styleUrl: './order-checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCheckoutComponent implements OnInit {
  private readonly _commonDataService = inject(CommonDateService);
  private readonly _cartService = inject(CartService);
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly grandTotal = input<number>(0);
  readonly itemCount = input<number>(0);

  // Outputs
  readonly close = output<void>();
  readonly orderSuccess = output<any>();

  // State signals
  readonly orderTypes = signal<DropdownItem[]>([
    { id: 1, name: 'دليفري' },
    { id: 2, name: 'داخل السياره' },
    { id: 3, name: 'تيك أواي' },
    { id: 4, name: 'داخل المطعم' },
  ]);

  readonly selectedOrderTypeId = signal<number>(1);
  readonly userAddresses = signal<any[]>([]);
  readonly selectedAddressId = signal<number | null>(null);

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

  ngOnInit(): void {
    this.loadOrderTypes();
    this.loadUserAddresses();
    this.initUserPhone();
  }

  private loadOrderTypes(): void {
    this._commonDataService.getOrderTypes().subscribe({
      next: (types) => {
        if (types && types.length > 0) {
          this.orderTypes.set(types);
        }
      },
      error: () => {
        // Fallback already pre-set
      },
    });
  }

  private loadUserAddresses(): void {
    this._cartService.getUserAddresses().subscribe({
      next: (addresses) => {
        const list = addresses || [];
        this.userAddresses.set(list);
        if (list.length > 0) {
          this.selectedAddressId.set(list[0].id);
        }
      },
      error: () => {},
    });
  }

  private initUserPhone(): void {
    const user = this._userDataService.getUserData();
    if (user && (user as any).phone) {
      this.phone.set((user as any).phone);
    }
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
        this.errorMessage.set('يرجى إدخال رقم الهاتف للتوصيل');
        return;
      }
    } else if (typeId === 2) { // داخل السياره
      if (!phoneVal) {
        this.errorMessage.set('يرجى إدخال رقم الهاتف');
        return;
      }
      if (!this.carNo().trim()) {
        this.errorMessage.set('يرجى إدخال رقم لوحة السيارة');
        return;
      }
    } else if (typeId === 3) { // تيك أواي
      if (!phoneVal) {
        this.errorMessage.set('يرجى إدخال رقم الهاتف للاستلام');
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

    this._cartService.createMenuOrder(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('تم إرسال الطلب بنجاح! جاري تحويلك إلى طلباتي...');
        this.orderSuccess.emit(res);

        setTimeout(() => {
          this.onClose();
          this._router.navigate(['/my-orders']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverMsg = err?.error?.message || err?.error?.title || err?.message;
        this.errorMessage.set(serverMsg || 'تعذر إتمام الطلب حالياً، يرجى التحقق من البيانات وإعادة المحاولة.');
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
