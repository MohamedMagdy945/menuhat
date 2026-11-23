import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminStatCard } from './models/admin-stat-card.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe, NgTemplateOutlet],
  templateUrl: './admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly _dashboardService = inject(AdminDashboardService);

  readonly stats = this._dashboardService.stats;
  readonly isLoading = this._dashboardService.isLoading;
  readonly error = this._dashboardService.error;

  readonly menuCards: AdminStatCard[] = [
    {
      key: 'subscribedMenusCount',
      label: 'منيوهات مشتركة',
      icon: 'verified',
      iconClasses: 'bg-emerald-50 text-emerald-600',
    },
    {
      key: 'freeTrialMenusCount',
      label: 'فترة تجريبية',
      icon: 'hourglass_top',
      iconClasses: 'bg-sky-50 text-sky-600',
    },
    {
      key: 'expiredMenusCount',
      label: 'اشتراكات منتهية',
      icon: 'event_busy',
      iconClasses: 'bg-amber-50 text-amber-600',
    },
    {
      key: 'deletedMenusCount',
      label: 'منيوهات محذوفة',
      icon: 'delete',
      iconClasses: 'bg-rose-50 text-rose-500',
    },
  ];

  readonly peopleCards: AdminStatCard[] = [
    {
      key: 'usersCount',
      label: 'المستخدمين',
      icon: 'group',
      iconClasses: 'bg-orange-50 text-orange-500',
    },
    {
      key: 'deliveryMenCount',
      label: 'مندوبي التوصيل',
      icon: 'moped',
      iconClasses: 'bg-violet-50 text-violet-600',
    },
  ];

  readonly complaintCards: AdminStatCard[] = [
    {
      key: 'newComplaintsCount',
      label: 'شكاوى جديدة',
      icon: 'mark_email_unread',
      iconClasses: 'bg-rose-50 text-rose-500',
    },
    {
      key: 'inProgressComplaintsCount',
      label: 'شكاوى قيد المعالجة',
      icon: 'pending_actions',
      iconClasses: 'bg-amber-50 text-amber-600',
    },
  ];

  valueOf(card: AdminStatCard): number {
    return this.stats()?.[card.key] ?? 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this._dashboardService.loadStats().subscribe({ error: () => {} });
  }
}
