import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuCategoriesService } from '../../../core/services/menu-categories.service';

export interface DashboardMenuItem {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  ordersCount: number;
}

@Component({
  selector: 'app-dashboard-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menus.component.html',
  styleUrl: './menus.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusComponent implements OnInit {
  protected readonly menuCategoriesService = inject(MenuCategoriesService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategoryId = signal<string>('all');

  readonly defaultCategories = [
    { id: 'all', name: 'الكل' },
    { id: 'mandi', name: 'وجبات مندي' },
    { id: 'grills', name: 'مشويات وكباب' },
    { id: 'appetizers', name: 'مقبلات وسلطات' },
    { id: 'drinks', name: 'مشروبات' },
    { id: 'desserts', name: 'حلويات' },
  ];

  readonly categories = computed(() => {
    const apiCats = this.menuCategoriesService.mainCategories();
    if (apiCats && apiCats.length > 0) {
      return [
        { id: 'all', name: 'الكل' },
        ...apiCats.map((c) => ({ id: String(c.id), name: c.name })),
      ];
    }
    return this.defaultCategories;
  });

  readonly menuItems = signal<DashboardMenuItem[]>([
    {
      id: '1',
      name: 'نصف تيس مندي فاخر',
      nameEn: 'Half Mandi Goat',
      category: 'وجبات مندي',
      categoryId: 'mandi',
      price: 650,
      description: 'لحم بلدي طازج مطهو على الحطب مع أرز بسمتي بالزعفران والمكسرات والخلطة السرية',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      ordersCount: 320,
    },
    {
      id: '2',
      name: 'وجبة نصف دجاجة مندي',
      nameEn: 'Half Chicken Mandi',
      category: 'وجبات مندي',
      categoryId: 'mandi',
      price: 130,
      description: 'نصف دجاجة مندي طازجة مع أرز مندي مبهر، دقوس حار، وطحينة',
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      ordersCount: 480,
    },
    {
      id: '3',
      name: 'كيلو كباب ضأن مشوي',
      nameEn: 'Lamb Kebab 1KG',
      category: 'مشويات وكباب',
      categoryId: 'grills',
      price: 490,
      description: 'كباب لحم ضأن طازج مفروم مع التوابل الشرقية مشوي على الفحم',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      ordersCount: 215,
    },
    {
      id: '4',
      name: 'متبل باذنجان مدخن',
      nameEn: 'Smoked Mutabbal',
      category: 'مقبلات وسلطات',
      categoryId: 'appetizers',
      price: 45,
      description: 'باذنجان مشوي على الفحم مع الطحينة، الليمون، وزيت الزيتون البكر',
      image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      ordersCount: 160,
    },
    {
      id: '5',
      name: 'كنافة نابلسية بالجبنة',
      nameEn: 'Cheese Kunafa',
      category: 'حلويات',
      categoryId: 'desserts',
      price: 70,
      description: 'كنافة ساخنة بالجبنة العكاوية مع الشيرة والفستق الحلبي',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80',
      isAvailable: false,
      ordersCount: 95,
    },
    {
      id: '6',
      name: 'عصير برتقال طازج',
      nameEn: 'Fresh Orange Juice',
      category: 'مشروبات',
      categoryId: 'drinks',
      price: 35,
      description: 'عصير برتقال طبيعي معصور طازجاً بدون إضافة سكر',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
      isAvailable: true,
      ordersCount: 140,
    },
  ]);

  ngOnInit(): void {
    // Fetch categories from Swagger API: /MenuMainCategories/GetAll
    this.menuCategoriesService.getAllMainCategories().subscribe();
  }

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategoryId();

    return this.menuItems().filter((item) => {
      const matchesCategory = cat === 'all' || item.categoryId === cat;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  });

  selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
  }

  toggleAvailability(item: DashboardMenuItem): void {
    this.menuItems.update((items) =>
      items.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  }
}
