import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  email = '';

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  goToRole(role: 'owner' | 'customer'): void {
    const target = role === 'owner' ? '/register/owner' : '/register/customer';
    this._router.navigate([target], {
      queryParams: this.email ? { email: this.email } : {}
    });
  }
}