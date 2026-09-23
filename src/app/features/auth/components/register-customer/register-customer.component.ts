import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';


@Component({
  selector: 'app-register-customer',
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './register-customer.component.html',
  styleUrl: './register-customer.component.css',
})
export class RegisterCustomerComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],

    username: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*[a-zA-Z0-9._])[a-zA-Z0-9._]{6,20}$/),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*[a-zA-Z0-9._])[a-zA-Z0-9._]{6,20}$/),
      ],
    ],

    confirmPassword: [
      '',
      Validators.required,
    ],

    governmentId: [
      '',
      Validators.required,
    ],

    cityId: [
      '',
      Validators.required,
    ],

    address: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200),
      ],
    ],
  });

  readonly governorates = [
    { value: 'cairo', label: 'القاهرة' },
    { value: 'alex', label: 'الإسكندرية' },
    { value: 'giza', label: 'الجيزة' },
  ];

  readonly cities = [
    { value: 'cairo', label: 'القاهرة' },
    { value: 'alex', label: 'الإسكندرية' },
    { value: 'giza', label: 'الجيزة' },
  ];

  isLoadingGovernorates = false;
  isLoadingCities = false;
  isLoading = false;

  readonly defaultAvatar = 'assets/images/default-avatar.png';

  photoPreviewUrl = this.defaultAvatar;
  fileInput: any;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();

    console.log(request);
  }

  onGovernorateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const governmentId = Number(select.value);

    this.form.patchValue({
      cityId: '',
    });


    if (!governmentId) {
      return;
    }

    this.loadCities(governmentId);
  }

  private loadCities(governmentId: number): void {
    this.isLoadingCities = true;

    // API call هنا بعد ما نربط الـ service
    console.log('Load cities for government:', governmentId);

    this.isLoadingCities = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoPreviewUrl = this.defaultAvatar;
    fileInput.value = '';
  }
}