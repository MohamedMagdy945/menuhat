import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { DASHBOARD_API_ENDPOINTS } from '../../../../core/constants/dashboard-api.constants';
import { ComplaintItem } from '../models/complaint-item.model';
import { SendComplaintPayload } from '../models/send-complaint-payload.model';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches the complaints list from backend, with fallback to default items
   */
  getComplaints(): Observable<ComplaintItem[]> {
    return this.http.get<any>(DASHBOARD_API_ENDPOINTS.complaintsGetAll).pipe(
      map((res) => {
        const raw = res?.data ?? res?.result ?? (Array.isArray(res) ? res : []);
        const list = Array.isArray(raw) ? raw : [];

        if (list.length === 0) {
          return this.getDefaultComplaints();
        }

        return list.map((item: any, index: number): ComplaintItem => ({
          id: item.id ?? index + 1,
          code: item.code ?? `#IC-${1040 + (item.id ?? index + 1)}`,
          title: item.title ?? 'شكوى فنية',
          phone: item.phone ?? '',
          date: item.date ?? item.createdAt ?? 'اليوم',
          status: item.status ?? 'قيد المعالجة',
          discription: item.discription ?? item.description ?? '',
          email: item.email ?? '',
          menuId: item.menuId,
        }));
      }),
      catchError(() => {
        return of(this.getDefaultComplaints());
      })
    );
  }

  /**
   * Submits a new complaint
   */
  sendComplaints(payload: SendComplaintPayload): Observable<any> {
    return this.http.post<any>(DASHBOARD_API_ENDPOINTS.complaints, payload);
  }

  /**
   * Returns default mock complaints list matching dashboard UI
   */
  getDefaultComplaints(): ComplaintItem[] {
    return [
      {
        id: 1,
        code: '#IC-1042',
        title: 'مشكلة في تحديث قائمة الأسعار للمنيو',
        phone: '01012345678',
        date: '18 مايو 2024 - 14:30',
        status: 'قيد المعالجة',
        discription:
          'قمت بمحاولة تعديل أسعار الوجبات ولكن تظهر رسالة خطأ عند الحفظ ولم يتم التحديث في المنيو الإلكتروني.',
        email: 'owner@combo7foods.com',
      },
      {
        id: 2,
        code: '#IC-1039',
        title: 'تأخر في استلام إشعارات الطلبات الجديدة',
        phone: '01198765432',
        date: '16 مايو 2024 - 19:15',
        status: 'مستلم',
        discription:
          'الطلبات تصل في لوحة التحكم بعد دقائق من إرسالها من قبل الزبون مما يسبب تأخير في التجهيز.',
        email: 'owner@combo7foods.com',
      },
      {
        id: 3,
        code: '#IC-1025',
        title: 'طلب تغيير صورة الغلاف للمطعم',
        phone: '01234567890',
        date: '12 مايو 2024 - 11:00',
        status: 'تم الحل',
        discription:
          'تم رفع صورة جديدة للغلاف ولكن لم تكن متوافقة مع الأبعاد، وتم التواصل مع الدعم وحلها بنجاح.',
        email: 'owner@combo7foods.com',
      },
      {
        id: 4,
        code: '#IC-1011',
        title: 'استفسار بخصوص تفعيل الدفع الإلكتروني',
        phone: '01012345678',
        date: '05 مايو 2024 - 16:45',
        status: 'قبول',
        discription:
          'نرجو تزويدنا بمتطلبات تفعيل بوابات الدفع الإلكتروني عبر المنيو الخاص بنا.',
        email: 'owner@combo7foods.com',
      },
    ];
  }
}
