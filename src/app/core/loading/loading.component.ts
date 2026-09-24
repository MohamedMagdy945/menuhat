import { Component, inject } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  imports: [],
  selector: 'app-loading',
  styleUrl: './loading.component.css',
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  protected readonly loadingService =
    inject(LoadingService);
}
