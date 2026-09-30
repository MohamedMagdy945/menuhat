import {
  Component,
  input,
  output,
} from '@angular/core';

import { MenuProduct } from '../../../meals/models/menu.product.model';
import { HorizontalScrollComponent } from '../../../../shared/components/horizontal-scroll/horizontal-scroll.component';
import { HorizontalCardSkeletonComponent } from '../../../../shared/skeleton/horizontal-card-skeleton/horizontal-card-skeleton.component';
import { HomeMealCardComponent } from '../home-meal-card/home-meal-card.component';

@Component({
  selector: 'app-home-meal-section',
  imports: [
    HorizontalScrollComponent,
    HorizontalCardSkeletonComponent,
    HomeMealCardComponent
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