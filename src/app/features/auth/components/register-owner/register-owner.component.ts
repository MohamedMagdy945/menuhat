import { register } from 'swiper/element/bundle';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';
import { CommonDateService } from '../../../../core/common-data/common-date';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SweetAlertService } from '../../../../core/services/sweet-alert.service';


@Component({
  selector: 'app-register-owner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './register-owner.component.html',
  styleUrls: ['./register-owner.component.css']
})
export class RegisterOwnerComponent {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _CommonDateService = inject(CommonDateService);
  private readonly _cdr = inject(ChangeDetectorRef);
  readonly defaultAvatar = 'assets/images/default-avatar.png';
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _Register = inject(RegisterService);
  private readonly swal = inject(SweetAlertService);

  governorates: { value: string; label: string }[] = [];
  cities: { value: string; label: string }[] = [];
  isLoadingGovernorates = false;
  isLoadingCities = false;
  isLoading = false;
  photoPreviewUrl = this.defaultAvatar;
  emailFromQuery: string = '';

  readonly form = this._FormBuilder.group({
    fullName: [null, [Validators.required]],
    username: ['', [Validators.required, Validators.pattern(/^(?=.{6,20}$)(?![0-9]+$)(?!.*@)[a-zA-Z0-9._]+$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: [null, [Validators.required, Validators.minLength(8)]],
    governmentId: [null, [Validators.required]],
    cityId: [null, [Validators.required]],
    address: [null, [Validators.required]]
  }, { validators: this.ConfirmPass });

  ConfirmPass(g: AbstractControl) {
    const pass = g.get('password')?.value;
    const confirmPassControl = g.get('confirmPassword');
    const confirmPass = confirmPassControl?.value;

    if (!pass || !confirmPass) {
      return null;
    }

    if (pass !== confirmPass) {
      confirmPassControl?.setErrors({ ...confirmPassControl.errors, missmatch: true });
      return { missmatch: true };
    } else {
      if (confirmPassControl?.hasError('missmatch')) {
        delete confirmPassControl.errors?.['missmatch'];
        if (!Object.keys(confirmPassControl.errors || {}).length) {
          confirmPassControl.setErrors(null);
        }
      }
      return null;
    }
  }

  ngOnInit(): void {
    this.loadGovernorates();
    this.emailFromQuery = this._route.snapshot.queryParams['email'] || '';
  }

  private loadGovernorates(): void {
    this.isLoadingGovernorates = true;

    this._CommonDateService.getGovernments().subscribe({
      next: (res) => {
        this.governorates = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));

        this.isLoadingGovernorates = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingGovernorates = false;
        this._cdr.detectChanges();
      }
    });
  }

  onGovernorateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const governmentId = Number(select.value);

    this.cities = [];
    this.form.patchValue({ cityId: null });

    if (!governmentId) return;

    this.loadCities(governmentId);
  }

  private loadCities(governmentId: number): void {
    this.isLoadingCities = true;
    this._cdr.detectChanges();

    this._CommonDateService.getCitiesByGovernmentId(governmentId).subscribe({
      next: (res) => {
        this.cities = res.map(item => ({
          value: item.id.toString(),
          label: item.name
        }));

        this.isLoadingCities = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingCities = false;
        this._cdr.detectChanges();
      }
    });
  }

  submit(): void {
    console.log("Doinw");
    if (this.form.invalid) {
      console.log("Doinw2");
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const { confirmPassword, ...cleanFormValue } = rawValue;

    const payload = {
      ...cleanFormValue,
      userTypeId: 1,
      appId: 2,
      governmentId: Number(cleanFormValue.governmentId),
      cityId: Number(cleanFormValue.cityId),
      mobile: null,
      mobile2: null,
      email: this.emailFromQuery,
      defaultLang: 'ar',
      photoURL: this.photoPreviewUrl !== this.defaultAvatar ? this.photoPreviewUrl : ''
    };
    console.log(payload);
    this._Register.SetRegister(payload).subscribe({
      next: (res) => {
        if (res) {
          localStorage.setItem('usertoken', res.data.token);
          this._router.navigate(['/home']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.swal.showToast(err?.error?.message, 'error');
      }
    });
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
      this._cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoPreviewUrl = this.defaultAvatar;
    fileInput.value = '';
  }
}