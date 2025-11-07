import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxSelectModule } from 'ngx-select-ex';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from '../shared/shared.module';

import { DashboardAdminComponent } from './dashboard-admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PenggunaComponent } from './pengguna/pengguna.component';
import { PembayaranComponent } from './pembayaran/pembayaran.component';
import { GatewayComponent } from './gateway/gateway.component';
import { VideoComponent } from './video/video.component';
import { TestimoniesComponent } from './testimonies/testimonies.component';
import { WebsiteComponent } from './website/website.component';
import { SettingsAplicationComponent } from './pengaturan/settings-aplication/settings-aplication.component';
import { SettingsBundleComponent } from './pengaturan/settings-bundle/settings-bundle.component';
import { SettingsPaymentComponent } from './pengaturan/settings-payment/settings-payment.component';
import { ProfileAdminComponent } from './pengaturan/profile-admin/profile-admin.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardAdminComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pengguna', component: PenggunaComponent },
      { path: 'profile', component: ProfileAdminComponent },
      { path: 'pembayaran', component: PembayaranComponent },
      { path: 'gateway', component: GatewayComponent },
      { path: 'testimoni', component: TestimoniesComponent },
      { path: 'website', component: WebsiteComponent },
      { path: 'video', component: VideoComponent },
      {
        path: 'pengaturan',
        children: [
          { path: 'aplikasi', component: SettingsAplicationComponent },
          { path: 'paket', component: SettingsBundleComponent },
          { path: 'pembayaran', component: SettingsPaymentComponent },
        ],
      },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardAdminComponent,
    DashboardComponent,
    PenggunaComponent,
    PembayaranComponent,
    GatewayComponent,
    TestimoniesComponent,
    VideoComponent,
    WebsiteComponent,
    SettingsAplicationComponent,
    SettingsBundleComponent,
    SettingsPaymentComponent,
    ProfileAdminComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    NgxSelectModule,
    SharedModule,
    BsDatepickerModule,
    ModalModule,
  ],
})
export class DashboardAdminModule {}
