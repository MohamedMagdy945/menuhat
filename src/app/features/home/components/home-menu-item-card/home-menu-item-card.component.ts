import { Component, computed, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../../../menu-items/models';

@Component({
  imports: [RouterLink],
  selector: 'app-home-menu-item-card',
  styleUrl: './home-menu-item-card.component.css',
  templateUrl: './home-menu-item-card.component.html',
})
export class HomeMenuItemCardComponent {
  readonly menuItem = input.required<MenuItem>();
  readonly apiUrl = environment.filesUrl;
  readonly isFavorite = signal(false);
  readonly Math = Math;

  readonly itemId = computed(() => {
    const item = this.menuItem() as any;
    return item.mostrequestesId ?? item.id ?? item.productId ?? item.menuId;
  });

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
