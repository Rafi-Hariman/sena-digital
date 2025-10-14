import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardServiceType, AdminContactSettingsResponse, AdminContactSettingsUpdateRequest } from '../../../dashboard.service';
declare const Swal: any;

@Component({
  selector: 'wc-settings-aplication',
  templateUrl: './settings-aplication.component.html',
  styleUrls: ['./settings-aplication.component.scss']
})
export class SettingsAplicationComponent implements OnInit {

  contactForm = {
    host_email: '',
    email: '',
    whatsapp: '',
    email_password: '',
    whatsapp_token: '',
    whatsapp_message: ''
  };

  isLoading = false;
  isSubmitting = false;

  constructor(private dashboardSvc: DashboardService) { }

  ngOnInit(): void {
    this.loadContactSettings();
  }

  loadContactSettings(): void {
    this.isLoading = true;
    this.dashboardSvc.list(DashboardServiceType.ADMIN_CONTACT_SETTINGS_GET).subscribe({
      next: (response: AdminContactSettingsResponse) => {
        if (response.success && response.data) {
          this.contactForm = {
            host_email: response.data.host_email || '',
            email: response.data.email || '',
            whatsapp: response.data.whatsapp || '',
            email_password: '',
            whatsapp_token: response.data.whatsapp_token || '',
            whatsapp_message: response.data.whatsapp_message || ''
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contact settings:', error);
        if (error.status !== 404) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load contact settings',
            confirmButtonColor: '#0275d8'
          });
        }
        this.isLoading = false;
      }
    });
  }

  onSubmitContact(event: Event): void {
    event.preventDefault();

    if (this.isSubmitting) {
      return;
    }

    const updateData: AdminContactSettingsUpdateRequest = {
      host_email: this.contactForm.host_email || null,
      email: this.contactForm.email || null,
      whatsapp: this.contactForm.whatsapp || null,
      whatsapp_token: this.contactForm.whatsapp_token || null,
      whatsapp_message: this.contactForm.whatsapp_message || null
    };

    if (this.contactForm.email_password) {
      updateData.email_password = this.contactForm.email_password;
    }

    this.isSubmitting = true;

    this.dashboardSvc.httpSvc.put<AdminContactSettingsResponse>(
      this.dashboardSvc.getUrl(DashboardServiceType.ADMIN_CONTACT_SETTINGS_UPDATE),
      updateData
    ).subscribe({
      next: (response: AdminContactSettingsResponse) => {
        this.isSubmitting = false;
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Contact settings saved successfully',
            confirmButtonColor: '#0275d8',
            timer: 2000
          });
          this.contactForm.email_password = '';
          this.loadContactSettings();
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error saving contact settings:', error);

        let errorMessage = 'Failed to save contact settings';
        if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage = errors.join(', ');
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#0275d8'
        });
      }
    });
  }

}
