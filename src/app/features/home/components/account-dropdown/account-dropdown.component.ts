import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserDataService } from '../../../../core/services/userData.service';

@Component({
  selector: 'app-account-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-dropdown.component.html',
  styleUrl: './account-dropdown.component.css',
})
export class AccountDropdownComponent {
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _elementRef = inject(ElementRef);

  readonly isOpen = signal<boolean>(false);
  readonly isAuthenticated = this._userDataService.isAuthenticated;
  readonly currentUser = this._userDataService.currentUser;

  get userName(): string {
    return this._userDataService.getUserFullName() || 'حسابي';
  }

  toggleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  navigateToProfile(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(false);
    this._router.navigate(['/profile']);
  }

  navigateToOrders(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(false);
    this._router.navigate(['/my-orders']);
  }

  navigateToFavorites(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(false);
    this._router.navigate(['/favorites']);
  }

  navigateToLogin(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(false);
    this._router.navigate(['/login']);
  }

  logout(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpen.set(false);
    this._userDataService.clearUserData();
    this._router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as HTMLElement;
    if (!this._elementRef.nativeElement.contains(target)) {
      this.isOpen.set(false);
      this._cdr.detectChanges();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this._cdr.detectChanges();
    }
  }
}
