import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/** Preview + pick/remove buttons for one restaurant file (logo or menu PDF/image). */
@Component({
  selector: 'app-admin-restaurant-media-field',
  templateUrl: './restaurant-media-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class AdminRestaurantMediaFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly icon = input('image');
  readonly accept = input('image/*');
  /** Resolved file URL or a local data URL; empty when there is no file. */
  readonly url = input('');
  /** True while an upload/delete for this file is running. */
  readonly busy = input(false);
  readonly disabled = input(false);

  readonly fileSelected = output<File>();
  readonly remove = output<void>();

  readonly isPdf = computed(() => {
    const url = this.url().toLowerCase();
    return url.startsWith('data:application/pdf') || url.split('?')[0].endsWith('.pdf');
  });

  /** Opening a data: URL in a new tab is blocked by browsers, so only link real files. */
  readonly canOpen = computed(() => !!this.url() && !this.url().startsWith('data:'));

  onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (file) this.fileSelected.emit(file);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/images/default.png')) img.src = '/images/default.png';
  }
}
