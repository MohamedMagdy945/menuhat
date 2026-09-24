import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loading-button',
  styleUrl: './loading-button.component.css',
  templateUrl: './loading-button.component.html',
})
export class LoadingButtonComponent {
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly text = input('Submit');

  readonly clicked = output<void>();
}
