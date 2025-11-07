import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { GenerateUndanganComponent } from './generate-undangan/generate-undangan.component';
import { RegisterComponent } from './register/register.component';
import { WeddingViewComponent } from './dashboard/wedding-view/wedding-view.component';
import { PaymentStatusComponent } from './shared/payment-status/payment-status.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'wedding/:coupleName', component: WeddingViewComponent },
  { path: 'wedding', component: WeddingViewComponent }, // Fallback route without parameter
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'buat-undangan', component: GenerateUndanganComponent },
  { path: 'payment-success', component: PaymentStatusComponent },
  { path: 'payment-pending', component: PaymentStatusComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./dashboard-admin/dashboard-admin.module').then(m => m.DashboardAdminModule)
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    initialNavigation: 'enabledBlocking',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
