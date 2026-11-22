import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-panel-layout',
  imports: [RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-panel-layout.component.html',
  styleUrl: './admin-panel-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPanelLayoutComponent {
  /** Whether the sidebar drawer is open on small screens. */
  readonly isMobileOpen = signal(false);

  openMobile(): void {
    this.isMobileOpen.set(true);
  }

  closeMobile(): void {
    this.isMobileOpen.set(false);
  }
}
