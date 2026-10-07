import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-add-rating-modal',
  standalone: true,
  imports: [],
  styleUrl: './add-rating-modal.component.css',
  templateUrl: './add-rating-modal.component.html',
})
export class AddRatingModalComponent {
  restaurantName = input<string>('');
  maxCharacters = input<number>(300);

  close = output<void>();
  submitReview = output<{ rating: number; comment: string }>();

  rating = signal(5);
  comment = signal('');

  readonly ratingLabels: Record<number, string> = {
    1: 'سيئ - نجمة واحدة',
    2: 'مقبول - نجمتان',
    3: 'جيد - 3 نجوم',
    4: 'جيد جدًا - 4 نجوم',
    5: 'ممتاز - 5 نجوم',
  };

  setRating(rating: number): void {
    this.rating.set(rating);
  }

  onCommentChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.comment.set(textarea.value);
  }

  getRatingLabel(): string {
    return this.ratingLabels[this.rating()];
  }

  submit(): void {
    const comment = this.comment().trim();

    if (!comment) {
      return;
    }

    this.submitReview.emit({
      rating: this.rating(),
      comment,
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
