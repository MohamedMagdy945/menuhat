import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantDetails, RestaurantMenuProduct } from '../../models/restaurant-details';
import { ResuaurantProfileService } from '../../../profile/restaurantProfile/services/resuaurant-profile-service';
import { environment } from '../../../../core/environments/environment';

interface StatItem {
  icon: string;
  label: string;
  value: string;
}

interface DisplayMenuItem {
  product: RestaurantMenuProduct;
  categoryName: string;
  subCategoryName: string;
}

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
})
export class RestaurantDetailsComponent {
  readonly apiUrl = environment.filesUrl;
  readonly selectedCategory = signal<number | null>(null);
  readonly restaurantData = signal<RestaurantDetails | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  private readonly restaurantProfileService = inject(ResuaurantProfileService);
  private readonly route = inject(ActivatedRoute);

  readonly stats = computed<StatItem[]>(() => {
    const main = this.restaurantData()?.main;
    if (!main) {
      return [];
    }

    return [
      {
        icon: 'fa-regular fa-clock',
        label: 'ساعات العمل',
        value: `${main.fromTime} - ${main.toTime}`,
      },
      {
        icon: 'fa-solid fa-users',
        label: 'عدد الزيارات',
        value: `${main.visitsCount}`,
      },
      {
        icon: 'fa-solid fa-location-dot',
        label: 'الموقع',
        value: `${main.city_Ar}، ${main.government_Ar}`,
      },
      {
        icon: 'fa-solid fa-utensils',
        label: 'التصنيف',
        value: main.field_Ar,
      },
      {
        icon: 'fa-solid fa-truck-fast',
        label: 'شروط الطلب',
        value: main.orderConditions_Ar,
      },
    ];
  });

  readonly menuItems = computed<DisplayMenuItem[]>(() => {
    const selectedCategory = this.selectedCategory();
    return (this.restaurantData()?.details ?? [])
      .filter((category) => selectedCategory === null || category.id === selectedCategory)
      .flatMap((category) =>
        category.subCategories.flatMap((subCategory) =>
          subCategory.menuProducts
            .filter((product) => !product.isHidden)
            .map((product) => ({
              product,
              categoryName: category.name,
              subCategoryName: subCategory.name,
            })),
        ),
      );
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const serial = params.get('serial');
      if (!serial) {
        this.errorMessage.set('تعذر تحديد المطعم.');
        this.isLoading.set(false);
        return;
      }

      this.fetchDataWithLocation(serial);
    });
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
  }

  fetchDataWithLocation(serial: string): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.loadDetails(serial, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('لم يتم الحصول على الموقع، سيتم الإرسال بدون lat و long:', error);
          this.loadDetails(serial, null, null);
        },
      );
      return;
    }

    this.loadDetails(serial, null, null);
  }

  private loadDetails(serial: string, lat: number | null, long: number | null): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.restaurantProfileService.GetRestaurantDetails(serial, lat, long).subscribe({
      next: (response) => {
        this.restaurantData.set(response);
        this.selectedCategory.set(null);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('حدث خطأ أثناء تحميل تفاصيل المطعم:', error);
        this.errorMessage.set('تعذر تحميل بيانات المطعم. يرجى المحاولة مرة أخرى.');
        this.isLoading.set(false);
      },
    });
  }
}
