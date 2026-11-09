import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ProductStatItem } from '../../models/most-ordered.model';

@Component({
  selector: 'app-most-ordered-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './most-ordered-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MostOrderedCardComponent {
  readonly product = input.required<ProductStatItem>();
  readonly maxCount = input<number>(146);

  readonly percentage = computed<number>(() => {
    const item = this.product();
    if (typeof item.percentage === 'number' && !isNaN(item.percentage)) {
      return item.percentage;
    }
    const max = this.maxCount() || 146;
    const count = item.productCount || 0;
    if (max <= 0) return 50;
    return Math.max(8, Math.round((count / max) * 100));
  });
}

