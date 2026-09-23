import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import {  RouterModule } from '@angular/router';
import { RegisterOwnerComponent } from '../../components/register-owner/register-owner.component';
import { RegisterCustomerComponent } from '../../components/register-customer/register-customer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RegisterOwnerComponent, RegisterCustomerComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {


  activeTab: 'restaurant' | 'customer' = 'restaurant';

  restaurantForm!: FormGroup;
  customerForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Restaurant Registration Form
    this.restaurantForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      restaurantName: ['', Validators.required],
      restaurantType: ['', Validators.required],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required]
    });

    // Customer Registration Form
    this.customerForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  setTab(tab: 'restaurant' | 'customer'): void {
    this.activeTab = tab;
  }

  onRestaurantSubmit(): void {
    if (this.restaurantForm.valid) {
      console.log('Restaurant Form Data:', this.restaurantForm.value);
    } else {
      this.restaurantForm.markAllAsTouched();
    }
  }

  onCustomerSubmit(): void {
    if (this.customerForm.valid) {
      console.log('Customer Form Data:', this.customerForm.value);
    } else {
      this.customerForm.markAllAsTouched();
    }
  }
}