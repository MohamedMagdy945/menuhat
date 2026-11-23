import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { UserDataService } from '../../core/services/userData.service';
import { ToastService } from '../../core/services/toast.service';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { FaqItem } from './models/faq-item.model';
import { FILES_ORIGIN } from '../../core/constants/files.constants';
import { CheckoutContactService } from '../cart/checkout-contact.service';
import { CheckoutAddress } from '../cart/models/checkout-address.model';
import { AddressFormComponent } from '../cart/components/address-form/address-form.component';
import { AddPhoneDialogComponent } from '../cart/components/add-phone-dialog/add-phone-dialog.component';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    FormInputComponent,
    AddressFormComponent,
    AddPhoneDialogComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  protected readonly profileService = inject(ProfileService);
  protected readonly userDataService = inject(UserDataService);
  private readonly _contactService = inject(CheckoutContactService);
  private readonly _toast = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  readonly isSaving = signal(false);

  // Name editing
  readonly isEditingName = signal(false);
  readonly nameDraft = signal('');

  // Modals
  readonly isChangePasswordOpen = signal(false);
  readonly isAddressModalOpen = signal(false);
  readonly editingAddress = signal<CheckoutAddress | null>(null);
  readonly isAddPhoneOpen = signal(false);
  readonly isFaqOpen = signal(false);
  readonly isComplaintOpen = signal(false);
  readonly complaintSubmitted = signal(false);

  readonly deletingAddressId = signal<number | null>(null);
  readonly avatarLoadError = signal(false);

  readonly passwordForm: FormGroup = this._fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPass: ['', [Validators.required]],
    },
    {
      validators: (group: FormGroup) =>
        group.get('newPassword')?.value === group.get('confirmPass')?.value
          ? null
          : { mismatch: true },
    },
  );

  readonly complaintForm: FormGroup = this._fb.group({
    subject: ['خدمة التوصيل', [Validators.required]],
    details: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly faqs = signal<FaqItem[]>([
    {
      question: 'ما هي مواعيد توصيل الطلبات؟',
      answer: 'نعمل على مدار الساعة طوال أيام الأسبوع لخدمتكم وتوصيل وجباتكم بأقصى سرعة ممكنة.',
      isOpen: true,
    },
    {
      question: 'كيف يمكنني متابعة حالة طلبي بعد التأكيد؟',
      answer: 'يمكنك متابعة حالة الطلب من صفحة "طلباتي"، حيث يظهر لك تحديث لحالة الطلب أولاً بأول.',
      isOpen: false,
    },
    {
      question: 'ما هي وسائل الدفع المعتمدة؟',
      answer: 'الدفع نقداً عند الاستلام، وتكلفة التوصيل يحددها المطعم.',
      isOpen: false,
    },
    {
      question: 'هل يمكنني إلغاء الطلب؟',
      answer: 'يمكنك إلغاء الطلب من صفحة "طلباتي" طالما أنه ما زال في انتظار قبول المطعم.',
      isOpen: false,
    },
  ]);

  // Support numbers (placeholder until the real numbers are provided)
  readonly supportPhones = ['122223333222'];

  // ---------- Profile data ----------
  readonly profile = this.profileService.profile;
  readonly addresses = this._contactService.addresses;
  readonly isLoadingAddresses = this._contactService.isLoadingAddresses;
  readonly phones = this._contactService.phones;
  readonly isLoadingPhones = this._contactService.isLoadingPhones;

  readonly userFullName = computed(
    () => this.profile()?.fullName || this.userDataService.getUserFullName() || '',
  );
  readonly username = computed(() => this.profile()?.username || '');
  readonly userEmail = computed(() => this.profile()?.email || '');
  readonly userInitial = computed(() => this.userFullName().trim().charAt(0) || '؟');
  /** Only when a photo actually loads (a broken photo falls back to the initial). */
  readonly hasPhoto = computed(() => !!this.avatarUrl());

  readonly avatarUrl = computed(() => {
    if (this.avatarLoadError()) return '';
    const prof = this.profile();
    if (prof?.photo?.base64String) return prof.photo.base64String;
    const url = prof?.photoURL;
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${FILES_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
  });

  ngOnInit(): void {
    if (!this.userDataService.getToken()) return;

    this.profileService.loadProfile().subscribe();
    this._contactService.loadAddresses().subscribe({
      error: (err) => console.error('Failed to load addresses:', err),
    });
    this._contactService.loadPhones().subscribe({
      error: (err) => console.error('Failed to load phone numbers:', err),
    });
  }

  // ---------- Name ----------
  startEditingName(): void {
    this.nameDraft.set(this.userFullName());
    this.isEditingName.set(true);
  }

  cancelEditingName(): void {
    this.isEditingName.set(false);
  }

  saveFullName(): void {
    const newName = this.nameDraft().trim();
    if (newName.length < 3 || this.isSaving()) return;

    this.isSaving.set(true);
    this.profileService.updateProfile({ fullName: newName }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditingName.set(false);
        this._toast.success('تم تعديل الاسم بنجاح');
      },
      error: (err) => {
        this.isSaving.set(false);
        this._toast.error(err?.error?.message || 'تعذر تعديل الاسم، يرجى المحاولة مرة أخرى');
      },
    });
  }

  // ---------- Password ----------
  openChangePassword(): void {
    this.passwordForm.reset();
    this.isChangePasswordOpen.set(true);
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
    const { oldPassword, newPassword, confirmPass } = this.passwordForm.value;

    this.profileService.changePassword({ oldPassword, newPassword, confirmPass }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isChangePasswordOpen.set(false);
        this.passwordForm.reset();
        this._toast.success('تم تغيير كلمة المرور بنجاح');
      },
      error: (err) => {
        this.isSaving.set(false);
        this._toast.error(
          err?.error?.message || 'فشل تغيير كلمة المرور، يرجى التأكد من كلمة المرور الحالية',
        );
      },
    });
  }

  // ---------- Addresses ----------
  openAddAddress(): void {
    this.editingAddress.set(null);
    this.isAddressModalOpen.set(true);
  }

  openEditAddress(address: CheckoutAddress): void {
    this.editingAddress.set(address);
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal(): void {
    this.isAddressModalOpen.set(false);
    this.editingAddress.set(null);
  }

  deleteAddress(address: CheckoutAddress): void {
    if (this.deletingAddressId() !== null) return;
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

    this.deletingAddressId.set(address.id);
    this._contactService.deleteAddress(address.id).subscribe({
      next: () => {
        this.deletingAddressId.set(null);
        this._toast.success('تم حذف العنوان');
      },
      error: (err) => {
        console.error('Failed to delete address:', err);
        this.deletingAddressId.set(null);
        this._toast.error('تعذر حذف العنوان، حاول مرة أخرى');
      },
    });
  }

  addressLocation(address: CheckoutAddress): string {
    return [address.govenmentName_Ar, address.cityName_Ar].filter(Boolean).join(' - ');
  }

  // ---------- FAQ ----------
  toggleFaq(index: number): void {
    this.faqs.update((items) =>
      items.map((item, i) => (i === index ? { ...item, isOpen: !item.isOpen } : item)),
    );
  }

  // ---------- Complaint ----------
  openComplaintModal(): void {
    this.complaintForm.reset({ subject: 'خدمة التوصيل', details: '' });
    this.complaintSubmitted.set(false);
    this.isComplaintOpen.set(true);
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    this.complaintSubmitted.set(true);
    setTimeout(() => {
      this.isComplaintOpen.set(false);
      this._toast.success('شكراً لك، تم استلام شكواك وسيتواصل معك فريق الدعم قريباً.');
    }, 1200);
  }

  // ---------- Avatar ----------
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarLoadError.set(false);
      this.profileService.updatePhoto(reader.result as string).subscribe({
        next: () => this._toast.success('تم تحديث الصورة الشخصية'),
        error: () => this._toast.error('فشل رفع الصورة الشخصية'),
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onImageError(): void {
    this.avatarLoadError.set(true);
  }

  deleteAvatar(): void {
    if (!confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) return;

    this.profileService.deletePhoto().subscribe({
      next: () => {
        this.avatarLoadError.set(false);
        this._toast.success('تمت إزالة الصورة الشخصية');
      },
      error: () => this._toast.error('فشل حذف الصورة'),
    });
  }

  logout(): void {
    this.userDataService.clearUserData();
    this._router.navigate(['/login']);
  }
}
