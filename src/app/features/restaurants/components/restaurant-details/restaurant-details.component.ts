import { Component, inject, signal } from '@angular/core';
import { ResuaurantProfileService } from '../../../profile/restaurantProfile/services/resuaurant-profile-service';
import { ActivatedRoute } from '@angular/router';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  badge?: string;
  badgeColor?: string;
}

interface StatItem {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
})

export class RestaurantDetailsComponent {
  private readonly _RestauranProfileService = inject(ResuaurantProfileService);
  private route = inject(ActivatedRoute);
  
  restaurantName = "BkBite's Hub";
  restaurantDescription = 'برجر وساندويتشات فاخرة • وجبات سريعة ومقرمشة';
  restaurantData = signal<any>(null);
  isLoading = signal<boolean>(true);
  selectedCategory = 'جميع الأقسام';
  
  stats: StatItem[] = [
    { icon: 'fa-regular fa-clock', label: 'ساعات العمل', value: '10:00 ص - 12:00 م' },
    { icon: 'fa-solid fa-users', label: 'عدد الزوار', value: 'زيارة +15k' },
    { icon: 'fa-solid fa-location-dot', label: 'الموقع', value: 'المعادي، القاهرة' },
    { icon: 'fa-solid fa-truck-fast', label: 'نطاق التوصيل', value: 'داخل القاهرة' },
    { icon: 'fa-solid fa-bolt', label: 'مدة التوصيل', value: '25-35 دقيقة' },
  ];

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const serial = params.get('serial');
      console.log("serial from Restaurant Profile",serial);
      if (serial) {
        this.fetchDataWithLocation(serial);
      }
    });
  }

  fetchDataWithLocation(serial: string) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          this.loadDetails(serial, lat, long);
        },
        (error) => {
          console.warn('لم يتم الحصول على الموقع، سيتم الإرسال بدون lat و long:', error);
          this.loadDetails(serial, null, null);
        }
      );
    } else {
      this.loadDetails(serial, null, null);
    }
  }

  loadDetails(serial: string, lat: number | null, long: number | null) {
    this.isLoading.set(true);
    
    this._RestauranProfileService.GetRestaurantDetails(serial).subscribe({
      next: (res) => {
        console.log("res",res);
        this.restaurantData.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log("err",err);
        console.error('حدث خطأ:', err);
        this.isLoading.set(false);
      }
    });
  }
  // stats: StatItem[] = null;

  // categories: string[];

  // menuItems: MenuItem[];
categories: string[] = [
    'جميع الأقسام',
    'الكل',
    'برجر',
    'دجاج مقرمش',
    'كريبات',
    'بيتزا',
    'فطير',
    'ستيك',
    'حلويات',
  ];

  menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'بيج ماك برجر',
      price: 150,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
      badge: 'الأكثر مبيعاً',
      badgeColor: 'bg-orange-500',
    },
    {
      id: 2,
      name: 'دجاج مقلي',
      price: 120.0,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80',
      badge: 'وجبة مقرمشة',
      badgeColor: 'bg-amber-500',
    },
    {
      id: 3,
      name: 'دبل بيكون برجر',
      price: 175,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 4,
      name: 'ستريبس كريسبي بوكس',
      price: 135,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80',
    },
  ];
}