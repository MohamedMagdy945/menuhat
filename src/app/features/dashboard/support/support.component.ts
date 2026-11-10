import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportFormComponent } from './components/support-form/support-form.component';
import { SupportTrackingComponent } from './components/support-tracking/support-tracking.component';

@Component({
  selector: 'app-dashboard-support',
  standalone: true,
  imports: [CommonModule, SupportFormComponent, SupportTrackingComponent],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
  readonly activeTab = signal<'new' | 'tracking'>('new');

  toggleView(): void {
    this.activeTab.update((current) => (current === 'new' ? 'tracking' : 'new'));
  }

  setTab(tab: 'new' | 'tracking'): void {
    this.activeTab.set(tab);
  }

  onComplaintSubmitted(): void {
    this.activeTab.set('tracking');
  }
}
