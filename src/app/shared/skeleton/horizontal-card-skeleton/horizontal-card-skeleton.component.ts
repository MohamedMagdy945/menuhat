import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-horizontal-card-skeleton',
  host: { class: 'contents' },

  standalone: true,
  templateUrl: './horizontal-card-skeleton.component.html',
})
export class HorizontalCardSkeletonComponent {

readonly skeletons = [1, 2, 3];
}
