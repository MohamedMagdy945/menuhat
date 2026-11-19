import { Component, inject, OnInit } from '@angular/core';
import { MenuItemCard } from './components/menu-item-card/menu-item-card.component';
import { MenuItemSkeletonComponent } from '../../shared/skeleton/menu-item-skeleton/menu-item-skeleton.component';
import { MenuItemService } from './menu-items.service';

@Component({
  imports: [MenuItemCard, MenuItemSkeletonComponent],
  selector: 'app-meals',
  styleUrl: './menu-items.component.css',
  templateUrl: './menu-items.component.html',
})
export class MealsComponent implements OnInit {
  protected readonly menuItemService = inject(MenuItemService);
  protected readonly skeletonCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  ngOnInit(): void {
    if (this.menuItemService.mostRequested().length === 0) {
      this.menuItemService.loadMostRequested({ globalLoading: false });
    }
  }
}
