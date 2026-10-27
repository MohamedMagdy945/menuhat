import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-side-drawer',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './side-drawer.component.html',
  styleUrl: './side-drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideDrawerComponent {
  /** Controls visibility of the drawer */
  readonly isOpen = model<boolean>(false);

  /** Header configuration */
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly badge = input<string | number | null>(null);

  /** Width styling (50% - 70% of screen width) */
  readonly widthClass = input<string>('w-full sm:w-[70vw] md:w-[65vw] lg:w-[55vw] xl:w-[50vw]');

  /** Position: right (default in RTL) or left */
  readonly position = input<'left' | 'right'>('right');

  /** Emitted when the drawer is closed */
  readonly closed = output<void>();

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  onBackdropClick(): void {
    this.close();
  }
}
