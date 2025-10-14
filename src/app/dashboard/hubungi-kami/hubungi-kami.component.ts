import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardServiceType, UserContactSettingsResponse, UserContactSettingsData } from '../../dashboard.service';

@Component({
  selector: 'wc-hubungi-kami',
  templateUrl: './hubungi-kami.component.html',
  styleUrls: ['./hubungi-kami.component.scss']
})
export class HubungiKamiComponent implements OnInit {

  contactSettings: UserContactSettingsData | null = null;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(private dashboardSvc: DashboardService) { }

  ngOnInit(): void {
    this.loadContactSettings();
  }

  loadContactSettings(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.dashboardSvc.list(DashboardServiceType.USER_CONTACT_SETTINGS_GET).subscribe({
      next: (response: UserContactSettingsResponse) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.contactSettings = response.data;
        } else {
          this.hasError = true;
          this.errorMessage = 'Contact information is not available at the moment.';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.hasError = true;

        if (error.status === 404) {
          this.errorMessage = 'Contact information is not available at the moment.';
        } else if (error.status === 401) {
          this.errorMessage = 'You need to be logged in to view contact information.';
        } else {
          this.errorMessage = 'Failed to load contact information. Please try again later.';
        }

        console.error('Error loading contact settings:', error);
      }
    });
  }

  getWhatsAppLink(): string {
    if (!this.contactSettings?.whatsapp) {
      return '#';
    }

    const phone = this.contactSettings.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(this.contactSettings.whatsapp_message || 'Hello Admin, saya mau bertanya.');

    return `https://wa.me/${phone}?text=${message}`;
  }

  getEmailLink(): string {
    if (!this.contactSettings?.email) {
      return '#';
    }

    return `mailto:${this.contactSettings.email}`;
  }

}
