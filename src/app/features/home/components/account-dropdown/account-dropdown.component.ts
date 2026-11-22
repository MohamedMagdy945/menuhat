import { Component, inject, signal, computed, ElementRef, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserDataService } from '../../../../core/services/userData.service';
import { DropdownStateService } from '../../../../core/services/dropdown-state.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-account-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-dropdown.component.html',
  styleUrl: './account-dropdown.component.css',
})
export class AccountDropdownComponent {
  private readonly _userDataService = inject(UserDataService);
  private readonly _dropdownState = inject(DropdownStateService);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly dropdownId = 'account';
  readonly isOpen = computed(() => this._dropdownState.activeDropdown() === this.dropdownId);
  readonly isAuthenticated = this._userDataService.isAuthenticated;
  readonly currentUser = this._userDataService.currentUser;

  get userName(): string {
    return this._userDataService.getUserFullName() || 'حسابي';
  }

  toggleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this._dropdownState.toggle(this.dropdownId);
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
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this._elementRef.nativeElement.contains(target)) {
      this._dropdownState.close(this.dropdownId);
      this._cdr.detectChanges();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this._dropdownState.close(this.dropdownId);
      this._cdr.detectChanges();
    }
  }
}
