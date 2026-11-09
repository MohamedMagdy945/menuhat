import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface MenuItemSize {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number | null;
}

@Component({
  selector: 'app-add-menu-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-menu-item.component.html',
  styleUrl: './add-menu-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenuItemComponent {
  private readonly router = inject(Router);

  // Form Fields - Basic Info
  readonly nameAr = signal<string>('');
  readonly nameEn = signal<string>('');
  readonly descriptionAr = signal<string>('');
  readonly descriptionEn = signal<string>('');

  // Image Upload
  readonly imagePreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  // Pricing Mode: 'single' | 'multiple'
  readonly pricingMode = signal<'single' | 'multiple'>('multiple');

  // Single Price
  readonly singlePrice = signal<number | null>(null);

  // Multiple Sizes (Matching screenshot default with 2 sizes)
  readonly sizes = signal<MenuItemSize[]>([
    {
      id: '1',
      nameAr: 'صغير',
      nameEn: 'Small',
      price: 45,
    },
    {
      id: '2',
      nameAr: 'وسط',
      nameEn: 'Medium',
      price: 65,
    },
  ]);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.selectedFile.set(null);
  }

  setPricingMode(mode: 'single' | 'multiple'): void {
    this.pricingMode.set(mode);
  }

  addSize(): void {
    const current = this.sizes();
    const nextIdx = current.length + 1;
    this.sizes.update((list) => [
      ...list,
      {
        id: Date.now().toString(),
        nameAr: nextIdx === 3 ? 'كبير' : `حجم #${nextIdx}`,
        nameEn: nextIdx === 3 ? 'Large' : `Size #${nextIdx}`,
        price: null,
      },
    ]);
  }

  removeSize(id: string): void {
    if (this.sizes().length <= 1) {
      alert('يجب الإبقاء على حجم واحد على الأقل أو التحويل لخيار "سعر واحد"');
      return;
    }
    this.sizes.update((list) => list.filter((s) => s.id !== id));
  }

  updateSizeField(id: string, field: 'nameAr' | 'nameEn' | 'price', value: any): void {
    this.sizes.update((list) =>
      list.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  getSizeOrdinalArabic(index: number): string {
    const ordinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
    return ordinals[index] || `#${index + 1}`;
  }

  save(): void {
    if (!this.nameAr().trim()) {
      alert('يرجى إدخال اسم الصنف (بالعربية)');
      return;
    }

    if (this.pricingMode() === 'single') {
      if (!this.singlePrice() || this.singlePrice()! <= 0) {
        alert('يرجى تحديد السعر');
        return;
      }
    } else {
      const invalid = this.sizes().some((s) => !s.nameAr.trim() || !s.price || s.price <= 0);
      if (invalid) {
        alert('يرجى ملء جميع أسماء وأسعار الأحجام بشكل صحيح');
        return;
      }
    }

    this.isSubmitting.set(true);

    // Simulate saving and navigate back to menu
    setTimeout(() => {
      this.isSubmitting.set(false);
      alert('تم حفظ الصنف بنجاح!');
      this.router.navigate(['/dashboard/menu']);
    }, 600);
  }

  cancel(): void {
    this.router.navigate(['/dashboard/menu']);
  }
}

