import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
  OnInit,
  DestroyRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemImageSuggestion } from '../../models/system-image-suggestion.model';
import { AddMenuItemService } from '../../components/add-menu-item/add-menu-item.service';

@Component({
  selector: 'app-system-images-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-images-modal.component.html',
  styleUrl: './system-images-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemImagesModalComponent implements OnInit {
  private readonly addMenuItemService = inject(AddMenuItemService);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly selectedImageUrl = input<string | null>(null);
  readonly selectedImageId = input<number | null>(null);

  // Outputs
  readonly close = output<void>();
  readonly imageSelected = output<SystemImageSuggestion>();

  // State Signals
  readonly searchKeyword = signal<string>('');
  readonly suggestedImages = this.addMenuItemService.suggestedImages;
  readonly isLoading = this.addMenuItemService.isLoadingSuggestions;

  private readonly searchSubject = new Subject<string>();

  constructor() {
    // Automatically trigger initial load when modal opens
    effect(() => {
      if (this.isOpen()) {
        const term = this.searchKeyword();
        this.addMenuItemService.suggestSystemImages(term).subscribe();
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => this.addMenuItemService.suggestSystemImages(term)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onSearchKeywordChange(value: string): void {
    this.searchKeyword.set(value);
    this.searchSubject.next(value);
  }

  searchSystemImages(): void {
    this.addMenuItemService.suggestSystemImages(this.searchKeyword()).subscribe();
  }

  selectImage(item: SystemImageSuggestion): void {
    this.imageSelected.emit(item);
  }

  onClose(): void {
    this.close.emit();
  }

  /**
   * Resolves the image URL pointing directly to environment.filesUrl
   */
  resolveImageUrl(imageUrl: string | null | undefined): string {
    return this.addMenuItemService.resolveImageUrl(imageUrl);
  }
}
