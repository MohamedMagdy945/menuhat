import { Injectable, signal } from '@angular/core';

export interface NavBadge {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: NavBadge;
  external?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  items: NavItem[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /**
   * Tracks whether the sidebar is collapsed into mini icon rail mode on desktop
   */
  readonly isCollapsed = signal<boolean>(false);

  /**
   * Tracks whether the mobile drawer sidebar is visible
   */
  readonly isMobileOpen = signal<boolean>(false);

  /**
   * Restaurant live operational status (open/closed)
   */
  readonly isRestaurantOpen = signal<boolean>(true);

  /**
   * Toggles desktop sidebar collapsed state
   */
  toggleSidebar(): void {
    this.isCollapsed.update((val) => !val);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }

  /**
   * Toggles mobile drawer visibility
   */
  toggleMobile(): void {
    this.isMobileOpen.update((val) => !val);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }

  /**
   * Toggle restaurant status
   */
  toggleRestaurantStatus(): void {
    this.isRestaurantOpen.update((val) => !val);
  }
}
