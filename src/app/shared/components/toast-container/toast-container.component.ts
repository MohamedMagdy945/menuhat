import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Toast } from '../../../core/models/toast.model';
import { ToastService } from '../../../core/services/toast.service';
import { ToastType } from '../../../core/models/toast-type.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toast-container',
  standalone: true,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}
