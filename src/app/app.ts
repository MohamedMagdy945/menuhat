import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './core/loading/loading.component';
import { UserDataService } from './core/services/userData.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LoadingComponent, ToastContainerComponent],
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

