import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { UserDataService } from '../../core/services/userData.service';
import { UserAddress } from './models/profile.model';
import { environment } from '../../core/environments/environment';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

export interface FaqItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  protected readonly profileService = inject(ProfileService);
  protected readonly userDataService = inject(UserDataService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Status & feedback
  readonly isSaving = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Modal / interactive state signals
  readonly isEditingName = signal<boolean>(false);
  readonly isChangePasswordOpen = signal<boolean>(false);
  readonly isAddressModalOpen = signal<boolean>(false);
  readonly editingAddress = signal<UserAddress | null>(null);
  readonly isFaqOpen = signal<boolean>(false);
  readonly isComplaintOpen = signal<boolean>(false);
  readonly complaintSubmitted = signal<boolean>(false);

  // Image load error fallback
  readonly avatarLoadError = signal<boolean>(false);

  // Fallback demo addresses
  private readonly defaultAddresses: UserAddress[] = [
    {
      id: 1,
      title: 'المنزل',
      type: 'home',
      address: 'شارع 9، مبنى 45، شقة 12، الطابق الرابع، المعادي، القاهرة - بجوار محطة المترو',
    },
    {
      id: 2,
      title: 'العمل',
      type: 'work',
      address: 'القرية الذكية، مبنى B12، الدور الثاني، مكتب التقنية طريق القاهرة الإسكندرية الصحراوي، الجيزة',
    },
  ];

  // Profile shared form-input controls
  readonly fullNameControl = new FormControl<string>(
    { value: '', disabled: true },
    {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    },
  );

  readonly usernameControl = new FormControl<string>(
    { value: '', disabled: true },
    { nonNullable: true },
  );

  readonly emailControl = new FormControl<string>(
    { value: '', disabled: true },
    { nonNullable: true },
  );

  readonly mobileControl = new FormControl<string>(
    { value: '', disabled: true },
    { nonNullable: true },
  );

  readonly passwordForm: FormGroup = this.fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required]],
    },
    {
      validators: (group: FormGroup) => {
        const pass = group.get('newPassword')?.value;
        const confirm = group.get('confirmPass')?.value;
        return pass === confirm ? null : { mismatch: true };
      },
    },
  );

  readonly addressForm: FormGroup = this.fb.group({
    title: ['المنزل', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly complaintForm: FormGroup = this.fb.group({
    subject: ['خدمة التوصيل', [Validators.required]],
    details: ['', [Validators.required, Validators.minLength(10)]],
  });

  // FAQ items
  readonly faqs = signal<FaqItem[]>([
    {
      question: 'ما هي مواعيد توصيل الطلبات؟',
      answer: 'نعمل على مدار الساعة طوال أيام الأسبوع لخدمتكم وتوصيل وجباتكم بأقصى سرعة ممكنة.',
      isOpen: true,
    },
    {
      question: 'كيف يمكنني متابعة حالة طلبي بعد التأكيد؟',
      answer: 'يمكنك متابعة حالة الطلب خطوة بخطوة من شاشة "طلباتي"، حيث يظهر لك تحديث فوري لمرحلة التحضير وخروج المندوب.',
      isOpen: false,
    },
    {
      question: 'ما هي وسائل الدفع المعتمدة؟',
      answer: 'نوفر الدفع نقداً عند الاستلام، وكذلك الدفع الإلكتروني الآمن بواسطة بطاقات فيزا، ماستركارد، ومحافظ الهاتف الذكي.',
      isOpen: false,
    },
    {
      question: 'هل يمكنني تعديل العنوان أو إلغاء الطلب؟',
      answer: 'يمكنك تعديل العنوان أو طلب الإلغاء قبل بدء المطعم في تحضير الوجبة من خلال التواصل السريع مع فريق الدعم الفني.',
      isOpen: false,
    },
  ]);

  // Support numbers
  readonly supportPhones = ['122223333222', '122223333222', '122223333222'];

  // Computed data
  readonly avatarUrl = computed(() => {
    if (this.avatarLoadError()) return '';
    const prof = this.profileService.profile();
    if (prof?.photo?.base64String) {
      return prof.photo.base64String;
    }
    if (prof?.photoURL) {
      if (prof.photoURL.startsWith('http://') || prof.photoURL.startsWith('https://')) {
        return prof.photoURL;
      }
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      const cleanPath = prof.photoURL.startsWith('/') ? prof.photoURL : `/${prof.photoURL}`;
      return `${baseUrl}${cleanPath}`;
    }
    return '';
  });

  readonly userFullName = computed(() => {
    return this.profileService.profile()?.fullName || this.userDataService.getUserFullName() || 'عبد الرحمن';
  });

  readonly username = computed(() => {
    const u = this.profileService.profile()?.username;
    if (u) return u;
    const email = this.profileService.profile()?.email;
    if (email) return email.split('@')[0];
    return 'abdo';
  });

  readonly userEmail = computed(() => {
    return this.profileService.profile()?.email || 'mr.kamer2000@gmail.com';
  });

  readonly userMobile = computed(() => {
    return this.profileService.profile()?.mobile || '+20 120 843 4909';
  });

  readonly userInitial = computed(() => {
    const name = this.userFullName();
    return name.trim().charAt(0) || 'ع';
  });

  readonly addresses = computed<UserAddress[]>(() => {
    const list = this.profileService.addresses();
    if (list && list.length > 0) {
      return list;
    }
    return this.defaultAddresses;
  });

  constructor() {
    // Keep form controls in sync with reactive profile signals
    effect(() => {
      const name = this.userFullName();
      if (!this.isEditingName()) {
        this.fullNameControl.setValue(name);
      }
      const uname = this.username();
      this.usernameControl.setValue(uname ? `@${uname}` : '@abdo');
      this.emailControl.setValue(this.userEmail());
      this.mobileControl.setValue(this.userMobile());
    });
  }

  ngOnInit(): void {
    if (!this.userDataService.getToken()) {
      return;
    }

    this.profileService.loadProfile().subscribe();
    this.profileService.loadAddresses().subscribe();
  }

  // Edit name actions
  startEditingName(): void {
    this.fullNameControl.setValue(this.userFullName());
    this.fullNameControl.enable();
    this.isEditingName.set(true);
    this.clearMessages();
  }

  cancelEditingName(): void {
    this.fullNameControl.setValue(this.userFullName());
    this.fullNameControl.disable();
    this.isEditingName.set(false);
  }

  saveFullName(): void {
    if (this.fullNameControl.invalid) return;

    const newName = this.fullNameControl.value.trim();
    if (!newName) return;

    this.isSaving.set(true);
    this.clearMessages();

    this.profileService.updateProfile({ fullName: newName }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.fullNameControl.disable();
        this.isEditingName.set(false);
        this.successMessage.set('تم تعديل الاسم بالكامل بنجاح');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'تعذر تعديل الاسم، يرجى المحاولة مرة أخرى');
      },
    });
  }

  // Change Password actions
  openChangePassword(): void {
    this.passwordForm.reset();
    this.isChangePasswordOpen.set(true);
    this.clearMessages();
  }

  closeChangePassword(): void {
    this.isChangePasswordOpen.set(false);
  }

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.clearMessages();

    const { oldPassword, newPassword, confirmPass } = this.passwordForm.value;

    this.profileService.changePassword({ oldPassword, newPassword, confirmPass }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isChangePasswordOpen.set(false);
        this.successMessage.set('تم تغيير كلمة المرور بنجاح');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'فشل تغيير كلمة المرور، يرجى التأكد من كلمة المرور الحالية');
      },
    });
  }

  // Address actions
  openAddAddress(): void {
    this.editingAddress.set(null);
    this.addressForm.reset({ title: 'المنزل', address: '' });
    this.isAddressModalOpen.set(true);
  }

  openEditAddress(addr: UserAddress): void {
    this.editingAddress.set(addr);
    this.addressForm.patchValue({
      title: addr.title || 'المنزل',
      address: addr.address || '',
    });
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal(): void {
    this.isAddressModalOpen.set(false);
    this.editingAddress.set(null);
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const { title, address } = this.addressForm.value;
    const current = this.editingAddress();

    if (current) {
      this.profileService.updateAddress({
        ...current,
        title,
        address,
      });
      this.successMessage.set('تم تحديث العنوان بنجاح');
    } else {
      this.profileService.addAddress({
        id: Date.now(),
        title,
        type: title === 'العمل' ? 'work' : 'home',
        address,
      });
      this.successMessage.set('تمت إضافة العنوان الجديد بنجاح');
    }

    this.closeAddressModal();
  }

  deleteAddress(id?: number): void {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

    this.profileService.deleteAddress(id);
    this.successMessage.set('تم حذف العنوان بنجاح');
  }

  // FAQ Modal actions
  openFaqModal(): void {
    this.isFaqOpen.set(true);
  }

  closeFaqModal(): void {
    this.isFaqOpen.set(false);
  }

  toggleFaq(index: number): void {
    this.faqs.update((items) =>
      items.map((item, i) => (i === index ? { ...item, isOpen: !item.isOpen } : item)),
    );
  }

  // Complaint Modal actions
  openComplaintModal(): void {
    this.complaintForm.reset({ subject: 'خدمة التوصيل', details: '' });
    this.complaintSubmitted.set(false);
    this.isComplaintOpen.set(true);
  }

  closeComplaintModal(): void {
    this.isComplaintOpen.set(false);
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    this.complaintSubmitted.set(true);
    setTimeout(() => {
      this.closeComplaintModal();
      this.successMessage.set('شكراً لك، تم استلام شكواك وسيتواصل معك فريق الدعم قريباً.');
    }, 1200);
  }

  // Avatar upload & delete
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      this.avatarLoadError.set(false);
      this.profileService.updatePhoto(base64String).subscribe({
        next: () => {
          this.successMessage.set('تم تحديث الصورة الشخصية بنجاح');
        },
        error: () => {
          this.errorMessage.set('فشل رفع الصورة الشخصية');
        },
      });
    };

    reader.readAsDataURL(file);
  }

  onImageError(): void {
    this.avatarLoadError.set(true);
  }

  deleteAvatar(): void {
    if (!confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) return;

    this.profileService.deletePhoto().subscribe({
      next: () => {
        this.avatarLoadError.set(false);
        this.successMessage.set('تمت إزالة الصورة الشخصية');
      },
      error: () => {
        this.errorMessage.set('فشل حذف الصورة');
      },
    });
  }

  logout(): void {
    this.userDataService.clearUserData();
    this.router.navigate(['/login']);
  }

  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
