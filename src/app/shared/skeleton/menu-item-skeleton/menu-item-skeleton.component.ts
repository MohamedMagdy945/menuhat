import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-menu-item-skeleton',
  styleUrl: './menu-item-skeleton.component.css',
  templateUrl: './menu-item-skeleton.component.html',
})
export class MenuItemSkeletonComponent {}
