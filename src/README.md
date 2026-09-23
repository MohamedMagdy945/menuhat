restaurants/
├── models/                             <-- كل ما يخص البيانات والـ DTOs
│   ├── restaurant.model.ts             <-- كيان المطعم (Restaurant Entity)
│   ├── restaurant-filter.model.ts      <-- نموذج الفلترة والبحث
│   ├── restaurant-requests.dto.ts      <-- طلبات الـ API (Search & Query Params)
│   ├── restaurant-responses.dto.ts     <-- استجابات الـ API (Paginated List)
│   └── index.ts                        <-- Barrel Export
│
├── components/ (أو ui/)                <-- المكونات الفرعية للعرض فقط (Dumb Components)
│   ├── restaurant-card/                <-- بطاقة مطعم واحد
│   │   ├── restaurant-card.component.ts
│   │   └── restaurant-card.component.html
│   │
│   ├── restaurant-filters/             <-- شريط البحث والفلاتر
│   │   ├── restaurant-filters.component.ts
│   │   └── restaurant-filters.component.html
│   │
│   └── restaurant-pagination/          <-- شريط التنقل بين الصفحات
│       ├── restaurant-pagination.component.ts
│       └── restaurant-pagination.component.html
│
├── restaurant-list-page/               <-- الصفحة الرئيسية الجامعة (Smart Component)
│   ├── restaurant-list-page.component.ts
│   ├── restaurant-list-page.component.html
│   └── restaurant-list-page.component.css
│
├── restaurants.store.ts               <-- إدارية الحالة (Signal Store)
├── restaurants.service.ts             <-- التعامل مع الـ HTTP APIs
└── restaurants.routes.ts              <-- توجيه الصفحات (Routing)


auth/
├── models/
│   ├── auth-user.model.ts
│   ├── login-requests.dto.ts           <-- تفاصيل طلب الدخول والـ 2FA
│   ├── register-requests.dto.ts        <-- تفاصيل إنشاء الحساب والـ Validation
│   ├── auth-responses.dto.ts
│   └── index.ts
│
├── services/                           <-- فصل الخدمات حسب المسئولية
│   ├── login.service.ts                <-- معالجة اللوجن، OTP، وتذكّر كلمة المرور
│   ├── register.service.ts             <-- معالجة إنشاء الحساب والتأكد من البيانات
│   ├── token-storage.service.ts        <-- حفظ واسترجاع التوكن
│   └── auth.interceptor.ts
│
├── pages/
│   ├── login-page/
│   └── register-page/
│
├── auth.store.ts                       <-- تجميع الحالة من الخدمات المختلفة
└── auth.routes.ts


auth/
├── components/                          <-- جميع المكونات الفرعية هنا (General UI Components)
│   ├── social-login-buttons/
│   │   ├── social-login-buttons.component.ts
│   │   └── social-login-buttons.component.html
│   │
│   ├── otp-input/
│   │   ├── otp-input.component.ts
│   │   └── otp-input.component.html
│   │
│   └── otp-timer/
│       ├── otp-timer.component.ts
│       └── otp-timer.component.html
│
├── login-page/                          <-- [Smart Component / Page]
│   ├── login-page.component.ts
│   └── login-page.component.html
│
├── register-page/                       <-- [Smart Component / Page]
│   ├── register-page.component.ts
│   └── register-page.component.html
│
├── send-otp-page/                       <-- [Smart Component / Page]
│   ├── send-otp-page.component.ts
│   └── send-otp-page.component.html
│
├── models/                              <-- DTOs & Interfaces
│   ├── login-requests.dto.ts
│   ├── register-requests.dto.ts
│   ├── otp-requests.dto.ts
│   └── index.ts
│
├── services/                            <-- Services & Interceptors
│   ├── login.service.ts
│   ├── register.service.ts
│   ├── otp.service.ts
│   └── token-storage.service.ts
│
├── auth.store.ts                        <-- Signal Store
└── auth.routes.ts                       <-- Feature Routing