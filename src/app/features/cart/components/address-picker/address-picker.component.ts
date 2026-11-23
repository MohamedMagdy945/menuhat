import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ToastService } from '../../../../core/services/toast.service';
import { CheckoutContactService } from '../../checkout-contact.service';
import { CheckoutAddress } from '../../models/checkout-address.model';
import { AddressFormComponent } from '../address-form/address-form.component';

@Component({
  selector: 'app-address-picker',
  imports: [AddressFormComponent],
  templateUrl: './address-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressPickerComponent {
  private readonly _contactService = inject(CheckoutContactService);
  private readonly _toast = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly selectedId = input<number | null>(null);

  readonly confirmed = output<CheckoutAddress>();
  readonly closed = output<void>();

  readonly addresses = this._contactService.addresses;
  readonly isLoading = this._contactService.isLoadingAddresses;

  /** Highlighted card; only applied to the checkout on "تأكيد العنوان". */
  readonly pendingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);

  readonly isAdding = signal(false);

  constructor() {
    // Every opening starts from the checkout's current choice.
    effect(() => {
      if (this.isOpen()) {
        const selected = this.selectedId();
        untracked(() => {
          this.pendingId.set(selected ?? this.addresses()[0]?.id ?? null);
          if (this.addresses().length === 0 && !this.isLoading()) {
            this.openAddForm();
          } else {
            this.isAdding.set(false);
          }
        });
      }
    });
  }

  select(id: number): void {
    this.pendingId.set(id);
  }

  confirm(): void {
    const address = this.addresses().find((a) => a.id === this.pendingId());
    if (address) {
      this.confirmed.emit(address);
    }
  }

  close(): void {
    this.isAdding.set(false);
    this.closed.emit();
  }

  deleteAddress(address: CheckoutAddress, event: Event): void {
    event.stopPropagation();
    if (this.deletingId() !== null) return;
    if (!confirm('هل تريد حذف هذا العنوان؟')) return;

    this.deletingId.set(address.id);
    this._contactService.deleteAddress(address.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        if (this.pendingId() === address.id) {
          this.pendingId.set(this.addresses()[0]?.id ?? null);
        }
        this._toast.success('تم حذف العنوان');
      },
      error: (err) => {
        console.error('Failed to delete address:', err);
        this.deletingId.set(null);
        this._toast.error('تعذر حذف العنوان، حاول مرة أخرى');
      },
    });
  }

  // ---------- Add address ----------
  openAddForm(): void {
    this.isAdding.set(true);
  }

  onAddressSaved(address: CheckoutAddress | null): void {
    if (address) {
      this.pendingId.set(address.id);
    }
    this.isAdding.set(false);
  }

  locationLine(address: CheckoutAddress): string {
    return [address.govenmentName_Ar, address.cityName_Ar].filter(Boolean).join(' - ');
  }
}
