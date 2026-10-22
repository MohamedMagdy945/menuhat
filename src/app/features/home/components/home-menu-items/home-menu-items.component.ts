import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItemService } from '../../../menu-items/menu-item.service';
import { MenuItem } from '../../../menu-items/models/menu-item';
import { HomeMenuItemCardComponent } from '../home-menu-item-card/home-menu-item-card.component';
import { HorizontalScrollComponent } from '../../../../shared/components/horizontal-scroll/horizontal-scroll.component';

@Component({
  selector: 'app-home-menu-items',
  imports: [
    RouterLink,
    HomeMenuItemCardComponent,
    HorizontalScrollComponent,
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
