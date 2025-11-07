import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule, Title, Meta } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'; // Import BsDatepickerModule
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroSectionComponent } from './home/hero-section/hero-section.component';
import { FeaturesComponent } from './home/features/features.component';
import { CommunityComponent } from './home/community/community.component';
import { TestimonialsComponent } from './home/testimonials/testimonials.component';
import { DevelopersComponent } from './home/developers/developers.component';
import { FooterComponent } from './home/footer/footer.component';
import { FooterHeroComponent } from './home/footer-hero/footer-hero.component';
import { FeatureFooterComponent } from './home/features/feature-footer/feature-footer.component';
import { FeatureFooterSectionComponent } from './home/features/feature-footer/feature-footer-section/feature-footer-section.component';
import { TestemoniFooterComponent } from './home/testimonials/testemoni-footer/testemoni-footer.component';
import { TestemonialFooterComponent } from './home/testimonials/testemonial-footer/testemonial-footer.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenerateUndanganComponent } from './generate-undangan/generate-undangan.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { RegisterComponent } from './register/register.component';
import { ToastService } from './toast.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from './shared/shared.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxSelectModule } from 'ngx-select-ex';
import { DataRegistrasiComponent } from './generate-undangan/data-registrasi/data-registrasi.component';
import { InformasiMempelaiComponent } from './generate-undangan/informasi-mempelai/informasi-mempelai.component';
import { RegisCeritaComponent } from './generate-undangan/regis-cerita/regis-cerita.component';
import { RegisPembayaranComponent } from './generate-undangan/regis-pembayaran/regis-pembayaran.component';
import { ModalUploadGaleriComponent } from './generate-undangan/modal-upload-galeri/modal-upload-galeri.component';
import { QueryService } from './dashboard.service';
import { SeoService } from './services/seo.service';
import { InvitationSectionComponent } from './home/features/feature-footer/invitation-section/invitation-section.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    HeroSectionComponent,
    FeaturesComponent,
    CommunityComponent,
    TestimonialsComponent,
    DevelopersComponent,
    FooterComponent,
    FooterHeroComponent,
    FeatureFooterComponent,
    FeatureFooterSectionComponent,
    TestemoniFooterComponent,
    TestemonialFooterComponent,
    LoginPageComponent,
    SettingsComponent,
    GenerateUndanganComponent,
    RegisterComponent,
    DataRegistrasiComponent,
    InformasiMempelaiComponent,
    RegisCeritaComponent,
    RegisPembayaranComponent,
    ModalUploadGaleriComponent,
    InvitationSectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    NgxSelectModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    Title,
    Meta,
    SeoService,
    { provide: LOCALE_ID, useValue: 'id' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
