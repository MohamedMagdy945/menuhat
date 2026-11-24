import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Shared search field: search icon (spinner while `loading`), clear button, Esc to clear.
 * Two-way bind the text with `[(value)]`; debounce in the parent.
 */
@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchInputComponent {
  readonly value = model('');
  readonly placeholder = input('بحث...');
  readonly ariaLabel = input('بحث');
  /** Shows a spinner in place of the search icon (e.g. while results load). */
  readonly loading = input(false);

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  clear(inputEl: HTMLInputElement): void {
    if (!this.value()) return;
    this.value.set('');
    inputEl.focus();
  }
}
