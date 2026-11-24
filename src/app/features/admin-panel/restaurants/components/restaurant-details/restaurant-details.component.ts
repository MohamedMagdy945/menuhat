import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonDateService } from '../../../../../core/common-data/common-date';
import { DropdownItem } from '../../../../../core/models/dropdown-item.model';
import { resolveAdminFileUrl } from '../../../utils/admin-file-url';
import { formatAdminTime, formatWorkingHours } from '../../../utils/admin-time';
import { AdminRestaurantsService } from '../../admin-restaurants.service';
import { AdminMenuDetails } from '../../models/admin-menu-details.model';
import { AdminDetailSection } from '../../models/admin-detail-section.model';

/** Admin restaurant details page — `/admin/restaurants/:id` → GET /Admin/GetMenu/{id}. */
@Component({
  selector: 'app-admin-restaurant-details',
  imports: [RouterLink],
  templateUrl: './restaurant-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRestaurantDetailsComponent implements OnInit {
  private readonly _restaurantsService = inject(AdminRestaurantsService);
  private readonly _commonData = inject(CommonDateService);

  private readonly _id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly menu = signal<AdminMenuDetails | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly _governments = signal<DropdownItem[]>([]);
  private readonly _cities = signal<DropdownItem[]>([]);
  private readonly _fields = signal<DropdownItem[]>([]);
  private readonly _orderConditions = signal<DropdownItem[]>([]);

  readonly logoUrl = computed(() => resolveAdminFileUrl(this.menu()?.logoURL));
  readonly pdfUrl = computed(() => resolveAdminFileUrl(this.menu()?.pdfURL));
  readonly isPdf = computed(() => this.pdfUrl().toLowerCase().endsWith('.pdf'));

  /** Text shown for any null / missing value. */
  readonly emptyLabel = 'فارغ';

  /** Every field of GET /Admin/GetMenu/{id}; null/missing values are shown as "فارغ". */
  readonly sections = computed<AdminDetailSection[]>(() => {
    const m = this.menu();
    if (!m) return [];
    const from = m.fromTime ?? null;
    const to = m.toTime ?? null;

    return [
      {
        title: 'البيانات الأساسية',
        icon: 'info',
        fields: [
          { label: 'المعرّف (ID)', value: this.text(m.id ?? m.menuId), ltr: true },
          { label: 'رقم المطعم', value: this.text(m.no), ltr: true },
          { label: 'السيريال', value: this.text(m.serial), ltr: true },
          { label: 'رقم المالك (المستخدم)', value: this.text(m.userId), ltr: true },
          { label: 'اسم المطعم', value: this.text(m.clientName) },
          { label: 'الاسم بالإنجليزية', value: this.text(m.clientName_En), ltr: true },
          { label: 'النشاط', value: this.lookup(this._fields(), m.fieldId) },
          { label: 'شروط الطلب', value: this.lookup(this._orderConditions(), m.orderConditionId) },
          { label: 'تاريخ الإنشاء', value: this.date(m.createdDate) },
        ],
      },
      {
        title: 'الحالة',
        icon: 'toggle_on',
        fields: [
          { label: 'حالة المطعم', value: this.bool(m.isOpen, 'مفتوح', 'مغلق') },
          { label: 'الظهور للعملاء', value: this.bool(m.isVisable, 'ظاهر', 'مخفي') },
          { label: 'صور المنتجات', value: this.bool(m.hasNoImage, 'بدون صور', 'بصور') },
        ],
      },
      {
        title: 'الموقع',
        icon: 'location_on',
        fields: [
          { label: 'المحافظة', value: this.lookup(this._governments(), m.governmentId) },
          { label: 'المدينة', value: this.lookup(this._cities(), m.cityId) },
          { label: 'العنوان', value: this.text(m.address), wide: true },
          { label: 'العنوان بالإنجليزية', value: this.text(m.address_En), ltr: true, wide: true },
          { label: 'خط العرض', value: this.text(m.latitude), ltr: true },
          { label: 'خط الطول', value: this.text(m.longitude), ltr: true },
        ],
      },
      {
        title: 'ساعات العمل',
        icon: 'schedule',
        fields: [
          { label: 'يفتح', value: formatAdminTime(from) || null },
          { label: 'يغلق', value: formatAdminTime(to) || null },
          { label: 'المدة', value: from && to ? formatWorkingHours(from, to) : null, wide: true },
        ],
      },
      {
        title: 'الملاحظات',
        icon: 'sticky_note_2',
        fields: [{ label: 'ملاحظات', value: this.text(m.notes), wide: true }],
      },
    ];
  });

  readonly mapUrl = computed(() => {
    const m = this.menu();
    if (m?.latitude == null || m?.longitude == null) return '';
    return `https://www.google.com/maps?q=${m.latitude},${m.longitude}`;
  });

  ngOnInit(): void {
    this._commonData.getGovernments().subscribe({
      next: (list) => this._governments.set(list ?? []),
      error: (err) => console.error('Failed to load governments:', err),
    });
    this._commonData.getFields().subscribe({
      next: (list) => this._fields.set(list ?? []),
      error: (err) => console.error('Failed to load fields:', err),
    });
    this._commonData.getOrderConditions().subscribe({
      next: (list) => this._orderConditions.set(list ?? []),
      error: (err) => console.error('Failed to load order conditions:', err),
    });
    this.load();
  }

  load(): void {
    if (!this._id) {
      this.isLoading.set(false);
      this.error.set('لم يتم العثور على هذا المطعم');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this._restaurantsService.getMenu(this._id).subscribe({
      next: (menu) => {
        this.menu.set(menu);
        this.isLoading.set(false);
        if (menu.governmentId) this.loadCities(menu.governmentId);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err?.status === 404) {
          this.error.set('لم يتم العثور على هذا المطعم');
        } else {
          console.error('Failed to load menu:', err);
          this.error.set('تعذر تحميل بيانات المطعم');
        }
      },
    });
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith('/images/default-restaurant.png')) {
      img.src = '/images/default-restaurant.png';
    }
  }

  private loadCities(governmentId: number): void {
    this._commonData.getCitiesByGovernmentId(governmentId).subscribe({
      next: (list) => this._cities.set(list ?? []),
      error: (err) => console.error('Failed to load cities:', err),
    });
  }

  /** null / undefined / blank → null (rendered as "فارغ"). */
  private text(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    return str ? str : null;
  }

  private bool(value: boolean | null | undefined, yes: string, no: string): string | null {
    if (value === null || value === undefined) return null;
    return value ? yes : no;
  }

  /** Lookup name; falls back to the raw id until the list loads (or if it is unknown). */
  private lookup(list: DropdownItem[], id: number | null | undefined): string | null {
    if (!id) return null;
    return list.find((item) => item.id === id)?.name ?? `#${id}`;
  }

  private date(raw: string | null | undefined): string | null {
    const d = raw ? new Date(raw) : null;
    if (!d || isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }
}
