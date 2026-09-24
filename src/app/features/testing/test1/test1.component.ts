import { Component, inject, signal } from '@angular/core';
import { USE_GLOBAL_LOADING } from '../../../core/loading/loading-context';
import { HttpClient, HttpContext } from '@angular/common/http';
import { LoadingButtonComponent } from '../../../shared/components/loading-button/loading-button.component';

@Component({
  imports: [LoadingButtonComponent],
  selector: 'app-test1',
  styleUrl: './test1.component.css',
  templateUrl: './test1.component.html',
})
export class Test1Component {
  readonly loading = signal(false);

  testButton(): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
    }, 3000);
  }
}
