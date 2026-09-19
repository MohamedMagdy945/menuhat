import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IOrder, OrderStatus } from '../../../../layouts/public-layout/Interfaces/iorder';
@Component({
  imports: [CommonModule],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})

export class Cart {
  activeStatus: OrderStatus = 'all';
  filterTabs: { label: string; value: OrderStatus }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'قيد الانتظار', value: 'pending' },
    { label: 'جاري التجهيز', value: 'preparing' },
    { label: 'جاري التوصيل', value: 'delivering' },
    { label: 'المكتملة', value: 'completed' },
    { label: 'المرفوضة', value: 'rejected' }
  ];

  // Mock Data لكل التبويبات
allOrders: IOrder[] = [
    {
      id: '9101',
      restaurantName: 'البيتزا الأفضل',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80',
      date: '14 أكتوبر 2023',
      time: '09:15 م',
      status: 'delivering',
      statusText: 'جاري التوصيل'
    },
    {
      id: '9088',
      restaurantName: 'حلويات الأرز',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=150&q=80',
      date: '12 أكتوبر 2023',
      time: '08:30 م',
      status: 'completed',
      statusText: 'المكتملة'
    },
    {
      id: '9055',
      restaurantName: 'شاورما دمشقية',
      imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=150&q=80',
      date: '10 أكتوبر 2023',
      time: '07:45 م',
      status: 'pending',
      statusText: 'قيد الانتظار'
    },
    {
      id: '8492',
      restaurantName: 'بيتزا هت',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80',
      date: '12 أكتوبر 2023',
      time: '08:30 م',
      status: 'preparing',
      statusText: 'جاري التجهيز'
    },
    {
      id: '8485',
      restaurantName: 'كنتاكي',
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=150&q=80',
      date: '10 أكتوبر 2023',
      time: '02:15 م',
      status: 'rejected',
      statusText: 'المرفوضة'
    }
  ];

 get filteredOrders(): IOrder[] {
    if (this.activeStatus === 'all') {
      return this.allOrders;
    }
    return this.allOrders.filter(order => order.status === this.activeStatus);
  }

  // تغيير الحالة المعروضة
  setStatusFilter(status: OrderStatus): void {
    this.activeStatus = status;
  }

  onCancelOrder(id: string): void {
    alert(`تم إلغاء الطلب رقم: #${id}`);
  }

  onViewDetails(id: string): void {
    alert(`تفاصيل الطلب رقم: #${id}`);
  }
}