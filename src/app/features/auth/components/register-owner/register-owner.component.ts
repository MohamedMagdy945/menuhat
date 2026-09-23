import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';


@Component({
  selector: 'app-register-owner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './register-owner.component.html',
  styleUrls: ['./register-owner.component.css']
})
export class RegisterOwnerComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    // Account Info
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
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
      ],
    ],

    confirmPassword: [
      '',
      [
        Validators.required,
      ],
    ],

    // Restaurant Info
    restaurantName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],

    restaurantType: [
      '',
      [
        Validators.required,
      ],
    ],

    phone: [
      '',
      [
        Validators.required,
      ],
    ],

    city: [
      '',
      [
        Validators.required,
      ],
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();

    console.log(request);
  }
  readonly cities = [
    { value: 'cairo', label: 'القاهرة' },
    { value: 'alex', label: 'الإسكندرية' },
    { value: 'giza', label: 'الجيزة' },
  ];
}