import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserDataService } from '../../../../core/services/userData.service';
import { SupportService } from '../../services/support-service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-technical-support',
  styleUrl: './technical-support.component.css',
  templateUrl: './technical-support.component.html',
})
export class TechnicalSupportComponent implements OnInit {
  private readonly _UserDataService = inject(UserDataService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _SupportService = inject(SupportService);
  private readonly _Router = inject(Router);
  private readonly _SweetAlertService = inject(SweetAlertService);

  supportForm!: FormGroup;
  selectedFileName: string = '';
  selectedFiles: File[] = [];
  currentUser: any = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.currentUser = this._UserDataService.getUserData();

    this.supportForm = this._FormBuilder.group({
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      title: [null],
      discription: [null, [Validators.required]]
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.selectedFileName = files.length === 1
        ? files[0].name
        : `تم اختيار ${files.length} صور`;
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const base64Images: string[] = await Promise.all(
        this.selectedFiles.map(file => this.convertFileToBase64(file))
      );

      const supportDto = {
        id: 0,
        title: this.supportForm.value.title,
        discription: this.supportForm.value.discription,
        phone: this.supportForm.value.phone,
        email: this.supportForm.value.email,
        menuId: this.currentUser?.menuId || 0,
        base64Images: base64Images
      };

      this._SupportService.sendComplaints(supportDto).subscribe({
        next: (res) => {
          this.isLoading = false;
          this._SweetAlertService.showToast(res?.message || 'تم إرسال الطلب بنجاح', 'success');
          this._Router.navigate(['/home']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this._SweetAlertService.showToast(err?.error?.message || 'حدث خطأ أثناء الإرسال', 'error');
        }
      });
    } catch (error) {
      this.isLoading = false;
      this._SweetAlertService.showToast('حدث خطأ أثناء معالجة الصور', 'error');
    }
  }
}