import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DailyMenuOrderItem } from '../../models';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './report-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportItemCardComponent {
  readonly item = input.required<DailyMenuOrderItem>();

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  formatPeakHour(hour: number | null | undefined): string {
    if (hour === undefined || hour === null) return '—';
    const h = hour.toString().padStart(2, '0');
    return `${h}:00`;
  }
}

