## Base Code dan Analisis Arsitektur

### 1. Analisis Struktur Project

#### a. Struktur Folder
- **src/app/**: Berisi seluruh source code aplikasi Angular.
  - **components/**: Komponen global seperti navbar.
  - **dashboard/**: Fitur dashboard user, terdiri dari subfitur seperti overview, profile, settings, pengunjung, testimoni, website, dll.
  - **dashboard-admin/**: Dashboard khusus admin, dengan fitur seperti gateway, pembayaran, pengaturan, pengguna, testimonies, video, website.
  - **generate-undangan/**: Fitur untuk generate undangan, dengan subfitur data registrasi, informasi mempelai, upload galeri, dsb.
  - **home/**: Halaman utama, dengan subkomponen seperti hero-section, community, features, footer, testimonials.
  - **login-page/** & **register/**: Halaman login dan register.
  - **shared/**: Komponen, modal, pipes, interfaces, dan utilitas yang reusable lintas fitur.
  - **services/**: Tempat service Angular (biasanya untuk API, state management, dsb).
- **src/assets/**: Asset gambar, ikon, dsb.
- **src/environments/**: Konfigurasi environment (dev/prod).
- **src/styles/**: SCSS global dan font.

#### b. Arsitektur Umum
- **Component-based**: Setiap fitur dipecah menjadi komponen kecil.
- **Modular**: Fitur besar seperti dashboard, dashboard-admin, generate-undangan, home, dsb, dipisah dalam folder masing-masing.
- **Shared Module**: Komponen, modal, dan utilitas yang reusable.
- **Routing**: Menggunakan `app-routing.module.ts` untuk navigasi antar halaman/fitur.
- **Service Layer**: Untuk komunikasi API dan logic non-UI.

---

### 2. Base Code Super Detail

#### a. Struktur Folder Base (usulan)

```
src/
  app/
    core/
      services/
      guards/
      interceptors/
    shared/
      components/
      pipes/
      interfaces/
      utils/
    features/
      home/
      dashboard/
      dashboard-admin/
      generate-undangan/
      login/
      register/
    app-routing.module.ts
    app.component.ts
    app.component.html
    app.component.scss
    app.module.ts
  assets/
  environments/
  styles/
```

#### b. Penjelasan Struktur
- **core/**: Service global, guard, interceptor, dsb.
- **shared/**: Komponen, pipe, interface, utilitas yang reusable.
- **features/**: Setiap fitur utama aplikasi (home, dashboard, dsb) dipecah per-module (lazy-loaded).
- **app-routing.module.ts**: Konfigurasi routing utama (root routes + lazy loading).
- **app.module.ts**: Root module Angular.

#### c. Contoh Base Code

##### 1) app.module.ts
```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Shared & Core
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    // ...komponen global lain
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    // ...module fitur lain
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

##### 2) app-routing.module.ts
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'admin', loadChildren: () => import('./features/dashboard-admin/dashboard-admin.module').then(m => m.DashboardAdminModule) },
  { path: 'generate-undangan', loadChildren: () => import('./features/generate-undangan/generate-undangan.module').then(m => m.GenerateUndanganModule) },
  { path: 'login', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule) },
  { path: 'register', loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

##### 3) core.module.ts
```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';

@NgModule({
  providers: [
    // Service global, interceptor, guard, dsb
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
```

##### 4) shared.module.ts
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import komponen, pipe, dsb

@NgModule({
  declarations: [
    // Komponen, pipe, dsb
  ],
  imports: [
    CommonModule
  ],
  exports: [
    // Komponen, pipe, dsb
  ]
})
export class SharedModule { }
```

##### 5) Contoh Feature Module (dashboard.module.ts)
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
// Import subkomponen dashboard

@NgModule({
  declarations: [
    DashboardComponent,
    // Subkomponen dashboard
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    // SharedModule jika butuh
  ]
})
export class DashboardModule { }
```

##### 6) Contoh Service (core/services/api.service.ts)
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
```

##### 7) Contoh Interface (shared/interfaces/user.interface.ts)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  // ...field lain
}
```

##### 8) Contoh Komponen Shared (shared/components/button/button.component.ts)
```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'wc-button',
  template: `<button [type]="type" [disabled]="disabled"><ng-content></ng-content></button>`,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
}
```

---

### 3. Best Practice & Catatan

- **Lazy Loading**: Setiap fitur utama di-load secara lazy untuk optimasi performa.
- **Shared Module**: Semua komponen/pipes yang reusable diletakkan di shared.
- **Core Module**: Service global, guard, interceptor, dsb, hanya di-import di AppModule.
- **SCSS Modular**: Gunakan SCSS per komponen, dan SCSS global untuk variable/mixin.
- **Interface & Type**: Semua model data didefinisikan di `shared/interfaces`.
- **Service Layer**: Semua komunikasi API dan logic non-UI di service.

---

### 4. Kesimpulan

Dengan struktur dan base code di atas, project menjadi:
- Mudah dikembangkan (scalable)
- Mudah dipelihara (maintainable)
- Siap untuk pengembangan fitur lebih lanjut


