import { Component, input, signal } from '@angular/core';
import { environment } from '../../../../core/environments/environment';
import { MenuItem } from '../../../menu-items/models/menu-item';
import { LucideHeart } from '@lucide/angular';
import { RouterLink } from '@angular/router';

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



  toggleFavorite(): void {
    this.isFavorite.update((v) => !v);
  }
}
