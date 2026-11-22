import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-loading',
  styleUrl: './loading.component.css',
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  protected readonly loadingService =
    inject(LoadingService);
}
