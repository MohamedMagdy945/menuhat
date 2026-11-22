import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LocationService } from '../../../core/services/location.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-location-selector',
  styleUrl: './location-selector.component.css',
  templateUrl: './location-selector.component.html',
})
export class LocationSelectorComponent {
  private readonly locationService =
    inject(LocationService);
  private readonly _toast = inject(ToastService);

  readonly isLoading =signal(false);

  /**
   * Complete selected location.
   *
   * You can access:
   *
   * location()?.country
   * location()?.governorate
   * location()?.city
   * location()?.area
   * location()?.street
   * location()?.lat
   * location()?.lng
   * location()?.address
   * location()?.notes
   */
  readonly location =
    this.locationService.currentLocation;

  /**
   * Short address for display.
   *
   * Example:
   * السادات، المنوفية
   */
  readonly displayAddress = this.locationService.displayShortAddress;


  async onSelectLocation(): Promise<void> {

    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {

      await this.locationService.getSmartLocation();

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : 'تعذر تحديد الموقع الفعلي، يرجى تفعيل الـ GPS.';

      this._toast.error(message);

    } finally {

      this.isLoading.set(false);
    }
  }
}
