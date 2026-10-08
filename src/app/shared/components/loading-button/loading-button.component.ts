import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './loading-button.component.css',
  templateUrl: './loading-button.component.html',
})
export class LoadingButtonComponent {
  readonly text = input<string>('تسجيل الدخول');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'submit' | 'button' | 'reset'>('submit');
  readonly fullWidth = input<boolean>(true);
  readonly loadingText = input<string>('جاري التحميل...');
  readonly showArrow = input<boolean>(true);

  readonly clicked = output<void>();

  onClick(): void {
    if (!this.loading() && !this.disabled()) {
      this.clicked.emit();
    }
  }
}
