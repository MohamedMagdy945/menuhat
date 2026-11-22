import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileNavbar } from './components/mobile-navbar/mobile-navbar.component';
import { DesktopNavbarComponent } from './components/desktop-navbar/desktop-navbar.component';
import { Footer } from './components/footer/footer.component';
import { LocationService } from '../../core/services/location.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MobileNavbar, DesktopNavbarComponent, Footer],
  selector: 'app-main-layout',
  styleUrl: './main-layout.component.css',
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  // Inject the LocationService
  protected locationService = inject(LocationService);
  private readonly _toast = inject(ToastService);

  // Signal to handle UI loading state during location fetch
  isLoading = signal<boolean>(false);

  // Address displayed in the Navbar
  currentAddress = this.locationService.displayAddress;

  private readonly responsiveService = inject(ResponsiveService);

  readonly isMobile = this.responsiveService.isMobile;
  /**
   * Triggers smart location detection from the Navbar button
   */
  async onFetchLocation(): Promise<void> {
    this.isLoading.set(true);

    try {
      await this.locationService.getSmartLocation();
    } catch (error) {
      console.error('Failed to fetch location:', error);
      this._toast.error('حدث خطأ أثناء جلب الموقع. يرجى المحاولة لاحقاً.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
