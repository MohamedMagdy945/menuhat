import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { SearchInputComponent } from '../../../../../shared/components/search-input/search-input.component';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { ConfirmModalComponent } from '../../../restaurants/modals/confirm-modal/confirm-modal.component';
import { AdminCategoriesService } from '../../admin-categories.service';
import { AdminCategoryTableComponent } from '../category-table/category-table.component';
import { AdminCategory } from '../../models/admin-category.model';
import { AdminCategoryTile } from '../../models/admin-category-tile.model';
import { AdminSubCategory } from '../../models/admin-sub-category.model';

const PAGE_SIZE = 48;

/**
 * Sub categories of one main category — `/admin/categories/:id/subcategories`.
 * GET /Admin/GetMainCategory/{id} (header) + GET /Admin/GetAllSubCategory?MenuCategoryId={id}.
 */
@Component({
  selector: 'app-admin-sub-categories',
  imports: [
    SearchInputComponent,
    DecimalPipe,
    FormsModule,
    RouterLink,
    AdminCategoryTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './sub-categories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSubCategoriesComponent implements OnInit {
  private readonly _categoriesService = inject(AdminCategoriesService);
  private readonly _toast = inject(ToastService);

  readonly mainId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;

  readonly main = signal<AdminCategory | null>(null);
  readonly mainNotFound = signal(false);

  readonly subs = signal<AdminSubCategory[]>([]);
  readonly itemsCount = signal(0);
  readonly totalPages = signal(1);
  readonly page = signal(1);
  readonly search = signal('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly deletingId = signal<number | null>(null);
  readonly pendingDelete = signal<AdminSubCategory | null>(null);
  readonly deleteMessage = computed(
    () =>
      `هل أنت متأكد من حذف القسم الفرعي "${this.pendingDelete()?.menuSubCategoryName ?? ''}"؟ لا يمكن التراجع عن هذا الإجراء.`,
  );

  readonly mainPhoto = computed(() => resolveAdminFileUrl(this.main()?.photoURL));

  readonly tiles = computed<AdminCategoryTile[]>(() =>
    this.subs().map((s) => ({
      id: s.id,
      name: s.menuSubCategoryName,
      nameEn: s.menuSubCategoryName_En,
      photoUrl: resolveAdminFileUrl(s.photoURL),
      order: s.catOrder ?? s.no,
      subtitle: s.description,
      subtitleIcon: 'notes',
      editLink: ['/admin/categories', this.mainId, 'subcategories', s.id, 'edit'],
    })),
  );

  private readonly _searchChanges = new Subject<void>();
  private _request?: Subscription;

  constructor() {
    this._searchChanges
      .pipe(debounceTime(400), takeUntilDestroyed())
      .subscribe(() => this.goToPage(1));
    inject(DestroyRef).onDestroy(() => this._request?.unsubscribe());
  }

  ngOnInit(): void {
    if (!this.mainId) {
      this.mainNotFound.set(true);
      return;
    }
    this._categoriesService.getCategory(this.mainId).subscribe({
      next: (main) => this.main.set(main),
      error: (err) => {
        if (err?.status !== 404) console.error('Failed to load main category:', err);
        this.mainNotFound.set(true);
      },
    });
    this.load();
  }

  onSearch(value: string): void {
    this.search.set(value);
    this._searchChanges.next();
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), Math.max(this.totalPages(), 1)));
    this.load();
  }

  load(): void {
    this._request?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);

    this._request = this._categoriesService
      .getSubCategories({
        pageNumber: this.page(),
        pageSize: PAGE_SIZE,
        searchValue: this.search(),
        menuCategoryId: this.mainId,
      })
      .subscribe({
        next: (res) => {
          this.subs.set(res.items);
          this.itemsCount.set(res.itemsCount);
          this.totalPages.set(Math.max(res.totalPages, 1));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load sub categories:', err);
          this.isLoading.set(false);
          this.error.set('تعذر تحميل الأقسام الفرعية');
        },
      });
  }

  askDelete(id: number): void {
    if (this.deletingId() !== null) return;
    this.pendingDelete.set(this.subs().find((s) => s.id === id) ?? null);
  }

  confirmDelete(): void {
    const sub = this.pendingDelete();
    if (!sub || this.deletingId() !== null) return;

    this.deletingId.set(sub.id);
    this._categoriesService.deleteSubCategory(sub.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.success('تم حذف القسم الفرعي');
        const lastOnPage = this.subs().length === 1 && this.page() > 1;
        this.goToPage(lastOnPage ? this.page() - 1 : this.page());
      },
      error: (err) => {
        console.error('Failed to delete sub category:', err);
        this.deletingId.set(null);
        this.pendingDelete.set(null);
        this._toast.error(err?.error?.message?.value || 'تعذر حذف القسم الفرعي');
      },
    });
  }
}
