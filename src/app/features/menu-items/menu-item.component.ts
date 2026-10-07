import { Component, inject, OnInit } from '@angular/core';
import { MenuItemService } from './menu-item.service';
import { MenuItemCard } from './components/menu-item-card/menu-item-card.component';
import { MenuItemSkeletonComponent } from '../../shared/skeleton/menu-item-skeleton/menu-item-skeleton.component';

@Component({
  imports: [MenuItemCard, MenuItemSkeletonComponent],
  selector: 'app-meals',
  styleUrl: './menu-item.component.css',
  templateUrl: './menu-item.component.html',
})
export class MealsComponent implements OnInit {
  protected readonly menuItemService = inject(MenuItemService);
  protected readonly skeletonCards = [1, 2, 3, 4, 5, 6];

  ngOnInit(): void {
    if (this.menuItemService.mostRequested().length === 0) {
      this.menuItemService.loadMostRequested({ globalLoading: false });
    }
  }

  loadMoreMostRequested(): void {
    this.menuItemService.loadMostRequested({ globalLoading: false });
  }
}
