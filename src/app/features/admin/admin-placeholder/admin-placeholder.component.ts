import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Temporary page for admin-panel sections that are not built yet. Title comes from route data. */
@Component({
  selector: 'app-admin-placeholder',
  template: `
    <section class="rounded-2xl bg-white border border-gray-100 shadow-xs p-8 text-center">
      <div
        class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3"
      >
        <span class="material-symbols-sharp text-3xl" aria-hidden="true">construction</span>
      </div>
      <h1 class="text-lg font-bold text-slate-800">{{ title }}</h1>
      <p class="text-sm text-slate-400 mt-1">هذه الصفحة قيد الإنشاء</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPlaceholderComponent {
  readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'لوحة التحكم';
}
