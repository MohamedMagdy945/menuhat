import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReportDailyItem } from '../../models';

@Component({
  selector: 'app-report-item-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './report-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportItemCardComponent {
  readonly item = input.required<ReportDailyItem>();
}

