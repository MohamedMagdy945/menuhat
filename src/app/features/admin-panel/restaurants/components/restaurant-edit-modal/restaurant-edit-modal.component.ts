import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonDateService } from '../../../../../core/common-data/common-date';
import { ToastService } from '../../../../../core/services/toast.service';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../../shared/components/form-select/form-select.component';
import { FormSelectOption } from '../../../../../shared/models/form-select-option.model';
import { AdminRestaurantsService } from '../../admin-restaurants.service';
import { AdminMenu } from '../../models/admin-menu.model';
import { AdminMenuDetails } from '../../models/admin-menu-details.model';

/** Edit a restaurant menu (PUT /Admin/PutMenu/{id}). Created by the page only while open. */
@Component({
  selector: 'app-admin-restaurant-edit-modal',
  imports: [ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './restaurant-edit-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRestaurantEditModalComponent implements OnInit {
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _commonData = inject(CommonDateService);
  private readonly _toast = inject(ToastService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);

  readonly menu = input.required<AdminMenu>();

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly governmentOptions = signal<FormSelectOption[]>([]);
  readonly cityOptions = signal<FormSelectOption[]>([]);
  readonly orderConditionOptions = signal<FormSelectOption[]>([]);

  readonly form = this._fb.nonNullable.group({
    clientName: ['', [Validators.required, Validators.minLength(2)]],
    clientName_En: [''],
    governmentId: [null as number | null, Validators.required],
    cityId: [null as number | null, Validators.required],
    address: [''],
    address_En: [''],
    orderConditionId: [null as number | null, Validators.required],
    notes: [''],
    fromTime: ['', Validators.required],
    toTime: ['', Validators.required],
  });

  /** Full record from GetMenu, so fields the form does not show (location, field…) are kept. */
  private _details: AdminMenuDetails = {};

  ngOnInit(): void {
    const menu = this.menu();

    // Prefill from the list item right away; GetMenu fills the rest.
    this.patchForm({
      id: menu.menuId,
      clientName: menu.clientName,
      clientName_En: menu.clientName_En,
      governmentId: menu.governmentId,
      cityId: menu.cityId,
      address: menu.address,
      address_En: menu.address_En,
      notes: menu.notes,
      fromTime: menu.fromTime ?? undefined,
      toTime: menu.toTime ?? undefined,
    });

    this._commonData.getGovernments().subscribe({
      next: (list) => this.governmentOptions.set(this.toOptions(list)),
      error: (err) => console.error('Failed to load governments:', err),
    });
    this._commonData.getOrderConditions().subscribe({
      next: (list) => this.orderConditionOptions.set(this.toOptions(list)),
      error: (err) => console.error('Failed to load order conditions:', err),
    });
    this.loadCities(menu.governmentId);

    this.form.controls.governmentId.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((id) => {
        this.form.controls.cityId.setValue(null);
        this.loadCities(id);
      });

    this._restaurantsService.getMenu(menu.menuId).subscribe({
      next: (details) => {
        this._details = details ?? {};
        this.patchForm(this._details);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load menu details:', err);
        this.isLoading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const menu = this.menu();
    const d = this._details;
    this.isSaving.set(true);

    this._restaurantsService
      .updateMenu({
        id: menu.menuId,
        clientName: value.clientName.trim(),
        clientName_En: value.clientName_En.trim() || null,
        governmentId: Number(value.governmentId),
        cityId: Number(value.cityId),
        address: value.address.trim() || null,
        address_En: value.address_En.trim() || null,
        fieldId: d.fieldId ?? menu.fieldId,
        orderConditionId: Number(value.orderConditionId),
        notes: value.notes.trim() || null,
        hasNoImage: d.hasNoImage ?? menu.hasNoImage,
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        fromTime: this.toTimeSpan(value.fromTime),
        toTime: this.toTimeSpan(value.toTime),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this._toast.success('تم تحديث بيانات المطعم');
          this.saved.emit();
        },
        error: (err) => {
          console.error('Failed to update menu:', err);
          this.isSaving.set(false);
          this._toast.error(err?.error?.message || 'تعذر تحديث بيانات المطعم');
        },
      });
  }

  close(): void {
    if (this.isSaving()) return;
    this.closed.emit();
  }

  private patchForm(source: AdminMenuDetails): void {
    const patch: Record<string, unknown> = {};
    const set = (key: string, value: unknown) => {
      if (value !== undefined && value !== null) patch[key] = value;
    };
    set('clientName', source.clientName);
    set('clientName_En', source.clientName_En);
    set('address', source.address);
    set('address_En', source.address_En);
    set('notes', source.notes);
    set('orderConditionId', source.orderConditionId);
    set('fromTime', source.fromTime ? source.fromTime.slice(0, 5) : undefined);
    set('toTime', source.toTime ? source.toTime.slice(0, 5) : undefined);

    // Set government without triggering the "reset city" listener.
    if (source.governmentId) {
      this.form.controls.governmentId.setValue(source.governmentId, { emitEvent: false });
    }
    if (source.cityId) {
      this.form.controls.cityId.setValue(source.cityId, { emitEvent: false });
    }
    this.form.patchValue(patch, { emitEvent: false });
  }

  private loadCities(governmentId: number | null): void {
    this.cityOptions.set([]);
    if (!governmentId) return;
    this._commonData.getCitiesByGovernmentId(Number(governmentId)).subscribe({
      next: (list) => this.cityOptions.set(this.toOptions(list)),
      error: (err) => console.error('Failed to load cities:', err),
    });
  }

  private toOptions(list: { id: number; name: string }[] | null): FormSelectOption[] {
    return (list ?? []).map((item) => ({ value: item.id, label: item.name }));
  }

  /** "10:00" → "10:00:00" (TimeSpan). */
  private toTimeSpan(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }
}
