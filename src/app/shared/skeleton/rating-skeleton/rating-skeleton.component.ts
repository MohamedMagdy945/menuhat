import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-rating-skeleton',
  styleUrl: './rating-skeleton.component.css',
  templateUrl: './rating-skeleton.component.html',
})
export class RatingSkeletonComponent {}
