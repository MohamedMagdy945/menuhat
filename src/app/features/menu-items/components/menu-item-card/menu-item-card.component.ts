import { Component, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { MenuItem } from '../../models/menu-item';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-menu-item-card',
  styleUrl: './menu-item-card.component.css',
  templateUrl: './menu-item-card.component.html',
})
export class MenuItemCard {
  readonly menuItem = input.required<MenuItem>();
  readonly apiUrl = environment.filesUrl;
  readonly isFavorite = signal(false);
  Math: any;

  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
