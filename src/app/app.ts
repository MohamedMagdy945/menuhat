import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './core/loading/loading.component';
import { UserDataService } from './core/services/userData.service';

@Component({
  imports: [RouterOutlet, LoadingComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('menuhat');
  private readonly _userDataService = inject(UserDataService);

  ngOnInit(): void {
    this._userDataService.loadUserData();
  }
}

