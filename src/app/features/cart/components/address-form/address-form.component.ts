import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonDateService } from '../../../../core/common-data/common-date';
import { DropdownItem } from '../../../../core/models/dropdown-item.model';
import { ToastService } from '../../../../core/services/toast.service';
import { UserDataService } from '../../../../core/services/userData.service';
import { CheckoutContactService } from '../../checkout-contact.service';
import { CheckoutAddress } from '../../models/checkout-address.model';

/**
 * Add or edit a delivery address (government → city → details).
 * Used by the checkout address picker and the profile page.
 */
@Component({
  selector: 'app-address-form',
  imports: [FormsModule],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
  private readonly _contactService = inject(CheckoutContactService);
  private readonly _commonData = inject(CommonDateService);
  private readonly _userData = inject(UserDataService);
  private readonly _toast = inject(ToastService);

  /** Address to edit; null = add a new one. */
  readonly address = input<CheckoutAddress | null>(null);
  /** Show the cancel button. */
  readonly cancellable = input(true);

  /** Emits the saved address (the new one when adding). */
  readonly saved = output<CheckoutAddress | null>();
  readonly cancelled = output<void>();

  readonly governments = signal<DropdownItem[]>([]);
  readonly cities = signal<DropdownItem[]>([]);
  readonly governmentId = signal<number | null>(null);
  readonly cityId = signal<number | null>(null);
  readonly addressText = signal('');
  readonly isSaving = signal(false);

  readonly isEdit = computed(() => !!this.address());
  readonly canSave = computed(
    () =>
      !!this.governmentId() &&
      !!this.cityId() &&
      this.addressText().trim().length >= 3 &&
      !this.isSaving(),
  );

  ngOnInit(): void {
    this._commonData.getGovernments().subscribe({
      next: (list) => this.governments.set(list ?? []),
      error: (err) => console.error('Failed to load governments:', err),
    });

    const current = this.address();
    if (current) {
      this.governmentId.set(current.governmentId || null);
      this.addressText.set(current.address ?? '');
      if (current.governmentId) {
        this.loadCities(current.governmentId, current.cityId || null);
      }
    }
  }

  onGovernmentChange(id: number | null): void {
    this.governmentId.set(id ? Number(id) : null);
    this.cityId.set(null);
    this.cities.set([]);
    if (id) {
      this.loadCities(Number(id), null);
    }
  }

  onCityChange(id: number | null): void {
    this.cityId.set(id ? Number(id) : null);
  }

  save(): void {
    const userId = this._userData.getUserId();
    if (!this.canSave() || !userId) return;

    const request = {
      userId,
      governmentId: this.governmentId()!,
      cityId: this.cityId()!,
      address: this.addressText().trim(),
    };
    const editing = this.address();
    const knownIds = new Set(this._contactService.addresses().map((a) => a.id));

    this.isSaving.set(true);
    const request$ = editing
      ? this._contactService.updateAddress(editing.id, request)
      : this._contactService.addAddress(request);

    request$.subscribe({
      next: (list) => {
        this.isSaving.set(false);
        const result = editing
          ? (list.find((a) => a.id === editing.id) ?? null)
          : (list.find((a) => !knownIds.has(a.id)) ?? null);
        this._toast.success(editing ? 'تم تحديث العنوان' : 'تمت إضافة العنوان');
        this.saved.emit(result);
      },
      error: (err) => {
        console.error('Failed to save address:', err);
        this.isSaving.set(false);
        this._toast.error(
          editing ? 'تعذر تحديث العنوان، حاول مرة أخرى' : 'تعذر إضافة العنوان، حاول مرة أخرى',
        );
      },
    });
  }

  cancel(): void {
    if (this.isSaving()) return;
    this.cancelled.emit();
  }

  private loadCities(governmentId: number, selectCityId: number | null): void {
    this._commonData.getCitiesByGovernmentId(governmentId).subscribe({
      next: (list) => {
        this.cities.set(list ?? []);
        if (selectCityId) {
          this.cityId.set(selectCityId);
        }
      },
      error: (err) => console.error('Failed to load cities:', err),
    });
  }
}
