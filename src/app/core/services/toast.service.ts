import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /**
   * Shows a toast notification.
   */
  show(message: string, type: ToastType = 'success', duration = 3500, title?: string): string {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, duration, title };

    this._toasts.update(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  success(message: string, title?: string, duration = 3500): string {
    return this.show(message, 'success', duration, title);
  }

  error(message: string, title?: string, duration = 4000): string {
    return this.show(message, 'error', duration, title);
  }

  warning(message: string, title?: string, duration = 3500): string {
    return this.show(message, 'warning', duration, title);
  }

  info(message: string, title?: string, duration = 3500): string {
    return this.show(message, 'info', duration, title);
  }

  /**
   * Compatibility methods matching the old SweetAlert signature
   */
  showToast(title: string, icon: ToastType = 'success'): void {
    this.show(title, icon);
  }

  showAlert(title: string = '', icon: ToastType = 'info'): void {
    this.show(title, icon, 4500);
  }

  remove(id: string): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
