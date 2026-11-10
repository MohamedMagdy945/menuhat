import { Component, ChangeDetectionStrategy, inject, OnInit, signal, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SupportService } from '../../../../technical-support/services/support-service';
import { UserDataService } from '../../../../../core/services/userData.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-support-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './support-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);
  private readonly userDataService = inject(UserDataService);
  private readonly toast = inject(ToastService);

  readonly complaintSubmitted = output<void>();

  readonly isLoading = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);

  supportForm!: FormGroup;

  ngOnInit(): void {
    const user = this.userDataService.currentUser() as any;

    this.supportForm = this.fb.group({
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || user?.phoneNumber || user?.businessOwner?.phoneNumber || '', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      discription: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      let base64Images: string[] = [];
      const file = this.selectedFile();
      if (file) {
        const base64 = await this.fileToBase64(file);
        base64Images.push(base64);
      }

      const user = this.userDataService.currentUser();
      const payload = {
        id: 0,
        title: this.supportForm.value.title,
        discription: this.supportForm.value.discription,
        phone: this.supportForm.value.phone,
        email: this.supportForm.value.email,
        menuId: (user as any)?.menuId || 0,
        base64Images,
      };

      this.supportService.sendComplaints(payload).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.toast.success(res?.message || 'تم إرسال الشكوى بنجاح وسيتم التواصل معك قريباً');
          this.supportForm.reset();
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.complaintSubmitted.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.toast.error(err?.error?.message || 'حدث خطأ أثناء إرسال الشكوى، يرجى المحاولة لاحقاً');
        },
      });
    } catch {
      this.isLoading.set(false);
      this.toast.error('حدث خطأ أثناء معالجة الصورة المرفقة');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

