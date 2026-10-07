import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ResuaurantProfileService } from '../../services/resuaurant-profile.service';
import { RestaurantRating } from '../../models/restaurant-rating';
import { RatingSkeletonComponent } from '../../../../shared/skeleton/rating-skeleton/rating-skeleton.component';

@Component({
  selector: 'app-restaurant-ratings',
  standalone: true,
  imports: [CommonModule, DatePipe, RatingSkeletonComponent],
  templateUrl: './restaurant-ratings.component.html',
  styleUrl: './restaurant-ratings.component.css'
})
export class RestaurantRatingsComponent implements OnInit {
  @Input({ required: true }) serial!: string;
  
  readonly ratings = signal<RestaurantRating[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  private readonly restaurantProfileService = inject(ResuaurantProfileService);

  ngOnInit(): void {
    this.loadRatings();
  }

  private loadRatings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.restaurantProfileService.GetTopFiveRates(this.serial).subscribe({
      next: (response) => {
        this.ratings.set(response.items || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load restaurant ratings:', error);
        this.errorMessage.set('تعذر تحميل التقييمات. يرجى المحاولة مرة أخرى.');
        this.isLoading.set(false);
      }
    });
  }
}
