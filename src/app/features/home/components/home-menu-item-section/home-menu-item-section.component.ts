import {
  Component,
  input,
  output,
} from '@angular/core';


import { HorizontalScrollComponent } from '../../../../shared/components/horizontal-scroll/horizontal-scroll.component';

import { HorizontalCardSkeletonComponent } from '../../../../shared/skeleton/horizontal-card-skeleton/horizontal-card-skeleton.component';
import { MenuItem } from '../../../menu-items/models/menu-item.model';
import { HomeMenuItemCardComponent } from '../home-menu-item-card/home-menu-item-card.component';


@Component({
  selector: 'app-home-menu-item-section',
  imports: [
    HomeMenuItemCardComponent,
    HorizontalScrollComponent,
    HorizontalCardSkeletonComponent,
  ],
  templateUrl: './home-menu-item-section.component.html',
  styleUrl: './home-menu-item-section.component.css',
})
export class HomeMenuItemSectionComponent {

  // Section title
  readonly title = input.required<string>();

  // Products displayed inside the section
  readonly menuItems = input.required<MenuItem[]>();

  // Pagination state
  readonly hasMoreData = input(true);
  readonly isLoadingMore = input(false);

  // Emit when more products should be loaded
  readonly loadMore = output<void>();

  onLoadMore(): void {
    // Don't request more data if:
    // - There is no more data
    // - A request is already running
    if (!this.hasMoreData() || this.isLoadingMore()) {
      return;
    }

    this.loadMore.emit();
  }
}