import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItemService } from '../../../menu-items/menu-item.service';
import { MenuItem } from '../../../menu-items/models/menu-item';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { HomeMenuItemCardComponent } from '../home-menu-item-card/home-menu-item-card.component';

@Component({
  selector: 'app-home-menu-items',
  imports: [
    RouterLink,
    HomeMenuItemCardComponent,
    CarouselComponent,
  ],
  templateUrl: './home-menu-items.component.html',
  styleUrl: './home-menu-items.component.css',
})
export class HomeMenuItemsComponent {
  protected readonly menuItemService = inject(MenuItemService);

  readonly title = input<string>('الأكثر طلبًا في منطقتك');
  readonly menuItems = input<MenuItem[] | null>(null);

  readonly items = computed(() => {
    const customItems = this.menuItems();
    return customItems !== null ? customItems : this.menuItemService.items();
  });
}
