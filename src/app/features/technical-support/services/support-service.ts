import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../core/environments/environment';

export interface ComplaintItem {
  id: number;
  code: string;
  title: string;
  phone: string;
  email?: string;
  date: string;
  status: 'قيد المعالجة' | 'مستلم' | 'تم الحل' | 'رفض' | 'قبول' | string;
  statusVariant: 'warning' | 'info' | 'success' | 'danger' | 'default';
  discription?: string;
  images?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  private readonly _HttpClient = inject(HttpClient);

  sendComplaints(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.apiUrl}/SupportComplaints`, data);
  }

  getComplaints(paramsObj?: { SortField?: string }): Observable<ComplaintItem[]> {
    let params = new HttpParams().set('SortField', paramsObj?.SortField || 'id');

    return this._HttpClient.get<any>(`${environment.apiUrl}/SupportComplaints`, { params }).pipe(
      map((res) => {
        const raw = res?.result ?? res?.data ?? res?.items ?? res;
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((it: any, idx: number) => ({
            id: it.id ?? idx + 1,
            code: it.code ?? it.complaintNumber ?? `#IC-${1040 + (it.id ?? idx + 1)}`,
            title: it.title ?? it.subject ?? 'تأخيري توصيل الطلب',
            phone: it.phone ?? it.phoneNumber ?? '0102354789651',
            email: it.email ?? '',
            date: it.date ?? it.createdAt ?? '24 أكتوبر 2023 - 12:45 م',
            status: it.status ?? it.statusName ?? 'قيد المعالجة',
            statusVariant: this.mapStatusVariant(it.status ?? it.statusName ?? 'قيد المعالجة'),
            discription: it.discription ?? it.description ?? 'تفاصيل الشكوى المسجلة لدى الدعم الفني.',
            images: it.images ?? it.base64Images ?? [],
          }));
        }
        return this.getDefaultComplaints();
      }),
      catchError(() => of(this.getDefaultComplaints()))
    );
  }

  private mapStatusVariant(status: string): 'warning' | 'info' | 'success' | 'danger' | 'default' {
    if (status.includes('معالجة') || status.includes('انتظار')) return 'warning';
    if (status.includes('مستلم') || status.includes('جديد')) return 'info';
    if (status.includes('حل') || status.includes('قبول') || status.includes('مكتمل')) return 'success';
    if (status.includes('رفض') || status.includes('ملغى')) return 'danger';
    return 'default';
  }

  getDefaultComplaints(): ComplaintItem[] {
    return [
      {
        id: 1,
        code: '#IC-1042',
        title: 'تأخيري توصيل الطلب',
        phone: '0102354789651',
        date: '24 أكتوبر 2023 - 12:45 م',
        status: 'قيد المعالجة',
        statusVariant: 'warning',
        discription: 'تم تأخير الطلب لأكثر من ساعة ونصف عن الموعد المحدد للتسليم، يرجى المتابعة مع المندوب لحل المشكلة سريعاً.',
      },
      {
        id: 2,
        code: '#IC-1042',
        title: 'تأخيري توصيل الطلب',
        phone: '0102354789651',
        date: '24 أكتوبر 2023 - 12:45 م',
        status: 'مستلم',
        statusVariant: 'info',
        discription: 'تم استلام الشكوى من قبل فريق الدعم الفني وتم تحويلها للمراجعة والتدقيق مع إدارة التوصيل.',
      },
      {
        id: 3,
        code: '#IC-1042',
        title: 'تأخيري توصيل الطلب',
        phone: '0102354789651',
        date: '24 أكتوبر 2023 - 12:45 م',
        status: 'تم الحل',
        statusVariant: 'success',
        discription: 'تم حل المشكلة وتوصيل الطلب بنجاح والتواصل مع العميل للتحقق من رضاه عن الخدمة.',
      },
      {
        id: 4,
        code: '#IC-1042',
        title: 'تأخيري توصيل الطلب',
        phone: '0102354789651',
        date: '24 أكتوبر 2023 - 12:45 م',
        status: 'رفض',
        statusVariant: 'danger',
        discription: 'تم رفض الشكوى نظراً لأن تأخير الطلب كان بسبب تعذر الوصول للعميل لعدم الرد على الهاتف.',
      },
      {
        id: 5,
        code: '#IC-1042',
        title: 'تأخيري توصيل الطلب',
        phone: '0102354789651',
        date: '24 أكتوبر 2023 - 12:45 م',
        status: 'قبول',
        statusVariant: 'success',
        discription: 'تم قبول الشكوى واعتماد تعويض للعميل عن فترة الانتظار الإضافية.',
      },
    ];
  }
}
