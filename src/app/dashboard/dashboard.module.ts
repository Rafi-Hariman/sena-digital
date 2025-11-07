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

import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { ProfileComponent } from './profile/profile.component';
import { OverviewComponent } from './overview/overview.component';
import { WebsiteUserComponent } from './website/website.component';
import { PengunjungComponent } from './pengunjung/pengunjung.component';
import { TestimoniComponent } from './testimoni/testimoni.component';
import { HubungiKamiComponent } from './hubungi-kami/hubungi-kami.component';
import { TampilanComponent } from './website/tampilan/tampilan.component';
import { PengaturanComponent } from './website/pengaturan/pengaturan.component';
import { DataWebsiteComponent } from './website/data-website/data-website.component';
import { MempelaiComponent } from './website/mempelai/mempelai.component';
import { AcaraComponent } from './website/acara/acara.component';
import { GalleryComponent } from './website/gallery/gallery.component';
import { CeritaQuoteComponent } from './website/cerita-quote/cerita-quote.component';
import { RekeningComponent } from './website/rekening/rekening.component';
import { RiwayatComponent } from './pengunjung/riwayat/riwayat.component';
import { UcapanComponent } from './pengunjung/ucapan/ucapan.component';
import { BillUserComponent } from './bill-user/bill-user.component';
import { WeddingViewComponent } from './wedding-view/wedding-view.component';
import { CoupleViewComponent } from './wedding-view/couple-view/couple-view.component';
import { MessageViewComponent } from './wedding-view/message-view/message-view.component';
import { AkadViewComponent } from './wedding-view/akad-view/akad-view.component';
import { ResepsiViewComponent } from './wedding-view/resepsi-view/resepsi-view.component';
import { StoryViewComponent } from './wedding-view/story-view/story-view.component';
import { GalleryViewComponent } from './wedding-view/gallery-view/gallery-view.component';
import { PresenceViewComponent } from './wedding-view/presence-view/presence-view.component';
import { GiftViewComponent } from './wedding-view/gift-view/gift-view.component';
import { AuthGuard } from '../auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardUserComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
      { path: 'bill', component: BillUserComponent },
      { path: 'overview', component: OverviewComponent },
      {
        path: 'website',
        component: WebsiteUserComponent,
        children: [
          { path: 'tampilan', component: TampilanComponent },
          { path: 'pengaturan', component: PengaturanComponent },
          { path: 'data-website', component: DataWebsiteComponent },
          { path: 'mempelai', component: MempelaiComponent },
          { path: 'acara', component: AcaraComponent },
          { path: 'gallery', component: GalleryComponent },
          { path: 'cerita-quote', component: CeritaQuoteComponent },
          { path: 'rekening', component: RekeningComponent },
        ],
      },
      {
        path: 'pengunjung',
        component: PengunjungComponent,
        children: [
          { path: 'riwayat', component: RiwayatComponent },
          { path: 'ucapan', component: UcapanComponent },
        ],
      },
      { path: 'testimoni', component: TestimoniComponent },
      { path: 'hubungi-kami', component: HubungiKamiComponent },
    ],
  },
];

@NgModule({
  declarations: [
    DashboardUserComponent,
    ProfileComponent,
    OverviewComponent,
    WebsiteUserComponent,
    PengunjungComponent,
    TestimoniComponent,
    HubungiKamiComponent,
    TampilanComponent,
    PengaturanComponent,
    DataWebsiteComponent,
    MempelaiComponent,
    AcaraComponent,
    GalleryComponent,
    CeritaQuoteComponent,
    RekeningComponent,
    RiwayatComponent,
    UcapanComponent,
    BillUserComponent,
    WeddingViewComponent,
    CoupleViewComponent,
    MessageViewComponent,
    AkadViewComponent,
    ResepsiViewComponent,
    StoryViewComponent,
    GalleryViewComponent,
    PresenceViewComponent,
    GiftViewComponent,
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
export class DashboardModule {}
