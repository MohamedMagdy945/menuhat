import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserDataService } from '../../../../core/services/userData.service';

@Component({
  selector: 'app-home-mobile-first-section',
  imports: [RouterLink],
  templateUrl: './home-mobile-first-section.component.html',
  styleUrl: './home-mobile-first-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMobileFirstSection {
  private readonly _userDataService = inject(UserDataService);
  private readonly _router = inject(Router);

  readonly searchQuery = signal<string>('');

  // Displays user's name or fallback to design mock name
  readonly userName = computed<string>(() => {
    return this._userDataService.getUserFullName() || 'عبدو حتاكه';
  });

  onSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const query = this.searchQuery().trim();
    if (query) {
      this._router.navigate(['/restaurants'], {
        queryParams: { search: query },
      });
    }
  }
}

