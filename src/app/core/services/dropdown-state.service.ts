import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DropdownStateService {
  private readonly _router = inject(Router, { optional: true });

  /**
   * Holds the ID of the currently active/open dropdown.
   * null means all dropdowns are closed.
   */
  readonly activeDropdown = signal<string | null>(null);

  constructor() {
    this._router?.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeAll();
      }
    });
  }

  /**
   * Returns true if the given dropdown ID is currently open.
   */
  isOpen(id: string): boolean {
    return this.activeDropdown() === id;
  }

  /**
   * Opens the specified dropdown, automatically closing any previously opened dropdown.
   */
  open(id: string): void {
    this.activeDropdown.set(id);
  }

  /**
   * Closes the dropdown if it is currently open, or closes any open dropdown if no id is provided.
   */
  close(id?: string): void {
    if (!id || this.activeDropdown() === id) {
      this.activeDropdown.set(null);
    }
  }

  /**
   * Toggles the dropdown: if currently open, closes it; if closed, opens it (and closes any other).
   * Returns true if opened, false if closed.
   */
  toggle(id: string): boolean {
    if (this.activeDropdown() === id) {
      this.activeDropdown.set(null);
      return false;
    } else {
      this.activeDropdown.set(id);
      return true;
    }
  }

  /**
   * Closes all dropdowns.
   */
  closeAll(): void {
    this.activeDropdown.set(null);
  }
}
