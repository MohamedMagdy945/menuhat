import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from './services/profile.service';
import { UserDataService } from '../../core/services/userData.service';

type ProfileTab = 'info' | 'addresses' | 'security';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  protected readonly profileService = inject(ProfileService);
  protected readonly userDataService = inject(UserDataService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<ProfileTab>('info');
  readonly isSaving = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Forms
  readonly infoForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: [''],
    mobile: [''],
    defaultLang: ['ar'],
  });

  readonly passwordForm: FormGroup = this.fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
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

  readonly userInitial = computed(() => {
    const name = this.profileService.profile()?.fullName || this.userDataService.getUserFullName() || 'م';
    return name.trim().charAt(0);
  });

  ngOnInit(): void {
    if (!this.userDataService.getToken()) {
      return;
    }

    this.profileService.loadProfile().subscribe((profile) => {
      if (profile) {
        this.infoForm.patchValue({
          fullName: profile.fullName || '',
          email: profile.email || '',
          mobile: profile.mobile || '',
          defaultLang: profile.defaultLang || 'ar',
        });
      }
    });

    this.profileService.loadAddresses().subscribe();
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  saveProfileInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.clearMessages();

    const { fullName, defaultLang } = this.infoForm.value;

    this.profileService.updateProfile({ fullName, defaultLang }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('تم حفظ بيانات الملف الشخصي بنجاح');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'تعذر تحديث البيانات، يرجى المحاولة مرة أخرى');
      },
    });
  }

  savePassword(): void {
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
        this.successMessage.set('تم تغيير كلمة المرور بنجاح');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'فشل تغيير كلمة المرور، يرجى التأكد من كلمة المرور القديمة');
      },
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
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

  deleteAvatar(): void {
    if (!confirm('هل أنت متأكد من حذف الصورة الشخصية؟')) return;

    this.profileService.deletePhoto().subscribe({
      next: () => {
        this.successMessage.set('تمت إزالة الصورة الشخصية');
      },
      error: () => {
        this.errorMessage.set('فشل حذف الصورة');
      },
    });
  }

  deleteAccount(): void {
    if (!confirm('تحذير: هل أنت متأكد تماماً من رغبتك في حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    this.profileService.deleteAccount().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'تعذر حذف الحساب في الوقت الحالي');
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
