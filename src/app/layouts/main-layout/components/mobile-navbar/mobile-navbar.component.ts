import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDataService } from '../../../../core/services/userData.service';
import { DropdownStateService } from '../../../../core/services/dropdown-state.service';

@Component({
  selector: 'app-mobile-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-navbar.component.html',
  styleUrl: './mobile-navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavbar {
  private readonly _userDataService = inject(UserDataService);
  private readonly _dropdownState = inject(DropdownStateService);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly dropdownId = 'mobile-account';
  readonly isAccountOpen = computed(() => this._dropdownState.activeDropdown() === this.dropdownId);
  readonly isAuthenticated = this._userDataService.isAuthenticated;
  readonly currentUser = this._userDataService.currentUser;

  readonly userName = computed<string>(() => {
    return this._userDataService.getUserFullName() || 'حسابي';
  });

  readonly userInitial = computed<string>(() => {
    const name = this.userName().trim();
    return name ? name.charAt(0) : 'ح';
  });

  readonly currentUrl = signal<string>(this._router.url);

  readonly isProfileActive = computed<boolean>(() => {
    const url = this.currentUrl();
    return url.startsWith('/profile');
  });

  constructor() {
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this._dropdownState.close(this.dropdownId);
        this._cdr.markForCheck();
      });
  }

  toggleAccountDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this._dropdownState.toggle(this.dropdownId);
  }

  closeAccountDropdown(): void {
    this._dropdownState.close(this.dropdownId);
    this._cdr.markForCheck();
  }

  navigateToProfile(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.close(this.dropdownId);
    this._router.navigate(['/profile']);
  }

  navigateToOrders(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.close(this.dropdownId);
    this._router.navigate(['/my-orders']);
  }

  navigateToFavorites(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.close(this.dropdownId);
    this._router.navigate(['/favorites']);
  }

  navigateToLogin(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.close(this.dropdownId);
    this._router.navigate(['/login']);
  }

  logout(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.close(this.dropdownId);
    this._userDataService.clearUserData();
    this._router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isAccountOpen()) return;
    const target = event.target as HTMLElement;
    if (!this._elementRef.nativeElement.contains(target)) {
      this._dropdownState.close(this.dropdownId);
      this._cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isAccountOpen()) {
      this._dropdownState.close(this.dropdownId);
      this._cdr.markForCheck();
    }
  }
}
