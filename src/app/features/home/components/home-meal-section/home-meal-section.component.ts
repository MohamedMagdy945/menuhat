import {
  Component,
  input,
  output,
} from '@angular/core';

import { MenuProduct } from '../../models/menu.product.model';
import { HomeMealCardComponent } from '../home-meal-card/home-meal-card.component';
import { HorizontalScrollComponent } from '../../../../shared/components/horizontal-scroll/horizontal-scroll.component';

@Component({
  selector: 'app-home-meal-section',
  imports: [
    HomeMealCardComponent,
    HorizontalScrollComponent,
  ],
  templateUrl: './home-meal-section.component.html',
  styleUrl: './home-meal-section.component.css',
})
export class HomeMealSectionComponent {
  readonly title = input.required<string>();
  readonly products = input.required<MenuProduct[]>();

  readonly isLoadingMore = input(false);
  readonly hasMoreData = input(true);

  readonly loadMore = output<void>();

  onLoadMore(): void {

    if (!this.hasMoreData() || this.isLoadingMore()) {
      return;
    }

    this.loadMore.emit();
  }
}