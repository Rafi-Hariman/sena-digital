import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { catchError, of, forkJoin } from 'rxjs';
import {
  DashboardService,
  DashboardServiceType,
  TestimoniItem,
  TestimoniResponse,
  TestimoniCreateRequest,
  TestimoniCreateResponse,
  TestimoniDeleteResponse
} from 'src/app/dashboard.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'wc-testimoni',
  templateUrl: './testimoni.component.html',
  styleUrls: ['./testimoni.component.scss']
})
export class TestimoniComponent implements OnInit {
  // Form properties
  reviewForm!: FormGroup;

  // Data properties
  dataList: TestimoniItem[] = [];
  isLoading = false;
  isSubmitting = false;
  apiError: string | null = null;

  // Search functionality
  searchQuery = '';

  // Modal
  modalRef?: BsModalRef;

  private notyf: Notyf;

  constructor(
    private dashboardService: DashboardService,
    private modalSvc: BsModalService
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: {
        x: 'right',
        y: 'top'
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    // this.loadTestimonials();
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm(): void {
    this.reviewForm = new FormGroup({
      provinsi: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      kota: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      ulasan: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(500)
      ])
    });
  }

  /**
   * Load user's testimonials
   */
  private loadTestimonials(): void {
    this.isLoading = true;
    this.apiError = null;

    // Note: API documentation shows admin endpoints, but for user testimonials
    // we might need a different endpoint. Using admin list for now with proper error handling
    this.dashboardService.list(DashboardServiceType.TESTIMONI_ADMIN_LIST).pipe(
      catchError(error => {
        console.error('Error fetching testimonials:', error);
        return of(null);
      })
    ).subscribe(
      (response) => {
        this.isLoading = false;
        if (response) {
          const testimoniResponse = response as TestimoniResponse;
          this.dataList = testimoniResponse.data || [];
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error loading testimonials:', error);
        this.apiError = 'Gagal memuat data testimoni. Silakan coba lagi.';
        this.notyf.error('Gagal memuat data testimoni');
      }
    );
  }

  /**
   * Get filtered testimonials based on search query
   */
  get filteredDataList(): TestimoniItem[] {
    if (!this.searchQuery.trim()) {
      return this.dataList;
    }

    const query = this.searchQuery.toLowerCase();
    return this.dataList.filter(item =>
      item.ulasan.toLowerCase().includes(query) ||
      item.kota.toLowerCase().includes(query) ||
      item.provinsi.toLowerCase().includes(query) ||
      item.user?.name.toLowerCase().includes(query)
    );
  }

  /**
   * Get total count for display
   */
  getTotalCount(): number {
    return this.dataList.length;
  }

  /**
   * Get approved testimonials count
   */
  getApprovedCount(): number {
    return this.dataList.filter(item => item.status).length;
  }

  /**
   * Get pending testimonials count
   */
  getPendingCount(): number {
    return this.dataList.filter(item => !item.status).length;
  }

  /**
   * Submit testimonial form
   */
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.markFormGroupTouched();
      this.notyf.error('Silakan lengkapi semua field yang diperlukan.');
      return;
    }

    this.isSubmitting = true;
    const formData = this.reviewForm.value as TestimoniCreateRequest;

    this.dashboardService.create(DashboardServiceType.USER_TESTIMONI, formData).subscribe({
      next: (response: TestimoniCreateResponse) => {
        this.isSubmitting = false;
        const message = response?.message || 'Testimoni berhasil dikirim!';
        this.notyf.success(message);
        this.reviewForm.reset();
        // this.loadTestimonials(); // Reload data to show new testimonial
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting testimonial:', error);

        // Handle validation errors
        if (error.status === 422 && error.error?.errors) {
          this.handleValidationErrors(error.error.errors);
        } else {
          this.notyf.error('Gagal mengirim testimoni. Silakan coba lagi.');
        }
      }
    });
  }

  /**
   * Handle validation errors from API
   */
  private handleValidationErrors(errors: any): void {
    Object.keys(errors).forEach(field => {
      const control = this.reviewForm.get(field);
      if (control) {
        control.setErrors({ serverError: errors[field][0] });
      }
    });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.reviewForm.controls).forEach(key => {
      const control = this.reviewForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string {
    const control = this.reviewForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} wajib diisi.`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} minimal ${control.errors['minlength'].requiredLength} karakter.`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} maksimal ${control.errors['maxlength'].requiredLength} karakter.`;
      }
      if (control.errors['serverError']) {
        return control.errors['serverError'];
      }
    }
    return '';
  }

  /**
   * Get friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'provinsi': 'Provinsi',
      'kota': 'Kota',
      'ulasan': 'Ulasan'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.reviewForm.get(fieldName);
    return !!(control && control.errors && control.touched);
  }

  /**
   * Delete testimonial (if user has permission)
   */
  doDelete(item: TestimoniItem): void {
    const initialState = {
      message: `Apakah Anda yakin ingin menghapus testimoni ini?`,
      cancelClicked: () => this.handleCancelClicked(),
    };

    this.modalRef = this.modalSvc.show(ModalComponent, { initialState });

    if (this.modalRef && this.modalRef.content) {
      this.modalRef.content.onClose.subscribe((res: any) => {
        if (res && res.state === 'delete') {
          this.deleteTestimonial(item.id);
        }
        this.modalRef?.hide();
      });
    }
  }

  /**
   * Handle modal cancel
   */
  private handleCancelClicked(): void {
    console.log('Delete canceled');
  }

  /**
   * Delete testimonial by ID
   */
  private deleteTestimonial(id: number): void {
    this.isLoading = true;

    this.dashboardService.deleteV2(DashboardServiceType.TESTIMONI_ADMIN_DELETE_BY_ID, id).subscribe({
      next: (response: TestimoniDeleteResponse) => {
        this.notyf.success(response?.message || 'Testimoni berhasil dihapus');
        this.loadTestimonials(); // Reload data
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting testimonial:', error);
        this.notyf.error('Gagal menghapus testimoni. Silakan coba lagi.');
      }
    });
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: boolean): string {
    return status ? 'badge bg-success' : 'badge bg-warning';
  }

  /**
   * Get status text
   */
  getStatusText(status: boolean): string {
    return status ? 'Disetujui' : 'Menunggu Persetujuan';
  }

  /**
   * Reload testimonials manually
   */
  reloadData(): void {
    this.loadTestimonials();
  }
}
