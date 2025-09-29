import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notyf } from 'notyf';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import {
  DashboardService,
  TestimonialService,
  TestimonialData,
  TestimonialResponse
} from 'src/app/dashboard.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

@Component({
  selector: 'wc-testimonies',
  templateUrl: './testimonies.component.html',
  styleUrls: ['./testimonies.component.scss']
})
export class TestimoniesComponent implements OnInit, OnDestroy {
  // Expose Math to template
  Math = Math;
  testimonials: TestimonialData[] = [];
  filteredTestimonials: TestimonialData[] = [];
  isLoading = true;
  hasError = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Search and filters
  searchControl = new FormControl('');
  selectedStatus = 'all'; // 'all', 'published', 'unpublished'

  // Selection
  selectedTestimonials: number[] = [];
  selectAll = false;

  private destroy$ = new Subject<void>();
  private testimonialService: TestimonialService;
  private notyf: Notyf;
  modalRef?: BsModalRef;

  constructor(
    private dashboardService: DashboardService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef
  ) {
    this.testimonialService = new TestimonialService(this.dashboardService);
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit(): void {
    this.loadTestimonials();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup search subscription with debounce
   */
  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTestimonials();
      });
  }

  /**
   * Load testimonials from API
   */
  loadTestimonials(): void {
    this.isLoading = true;
    this.hasError = false;

    const params = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchControl.value || undefined,
      status: this.selectedStatus === 'all' ? undefined :
             (this.selectedStatus === 'published' ? '1' : '0')
    };

    this.testimonialService.getAdminTestimonials(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TestimonialResponse) => {
          if (response.data) {
            this.testimonials = response.data;
            this.totalItems = response.meta?.total || response.data.length;
            this.totalPages = response.meta?.last_page || 1;
            this.selectedTestimonials = [];
            this.selectAll = false;
          } else {
            this.testimonials = [];
            this.hasError = true;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading testimonials:', error);
          this.testimonials = [];
          this.hasError = true;
          this.isLoading = false;
          this.notyf.error('Gagal memuat data testimoni');
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadTestimonials();
  }

  /**
   * Handle pagination
   */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTestimonials();
    }
  }

  /**
   * Handle items per page change
   */
  onItemsPerPageChange(event: Event): void {
    const items = +(event.target as HTMLSelectElement).value;
    this.itemsPerPage = items;
    this.currentPage = 1;
    this.loadTestimonials();
  }

  /**
   * Toggle testimonial status
   */
  toggleTestimonialStatus(testimonial: TestimonialData): void {
    const newStatus = testimonial.status === 0 ? 1 : 0;
    const statusText = newStatus === 1 ? 'dipublikasikan' : 'disembunyikan';

    const initialState = {
      message: `Apakah Anda yakin ingin mengubah status testimoni menjadi ${statusText}?`,
      cancelClicked: () => this.modalRef?.hide(),
      submitClicked: () => this.confirmToggleStatus(testimonial.id, newStatus === 1),
      submitMessage: 'Ya, Ubah',
    };

    this.modalRef = this.modalService.show(ModalComponent, { initialState });
  }

  /**
   * Confirm status toggle
   */
  private confirmToggleStatus(id: number, status: boolean): void {
    this.testimonialService.updateTestimonialStatus(id, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modalRef?.hide();
          this.notyf.success(response.message || 'Status testimoni berhasil diubah');
          this.loadTestimonials();
        },
        error: (error) => {
          this.modalRef?.hide();
          console.error('Error updating status:', error);
          this.notyf.error('Gagal mengubah status testimoni');
        }
      });
  }

  /**
   * Delete single testimonial
   */
  deleteTestimonial(testimonial: TestimonialData): void {
    const userName = testimonial.user.name || testimonial.user.email;
    const initialState = {
      message: `Apakah Anda yakin ingin menghapus testimoni dari ${userName}?`,
      cancelClicked: () => this.modalRef?.hide(),
      submitClicked: () => this.confirmDeleteTestimonial(testimonial.id),
      submitMessage: 'Ya, Hapus',
    };

    this.modalRef = this.modalService.show(ModalComponent, { initialState });
  }

  /**
   * Confirm single testimonial deletion
   */
  private confirmDeleteTestimonial(id: number): void {
    this.testimonialService.deleteTestimonial(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modalRef?.hide();
          this.notyf.success(response.message || 'Testimoni berhasil dihapus');
          this.loadTestimonials();
        },
        error: (error) => {
          this.modalRef?.hide();
          console.error('Error deleting testimonial:', error);
          this.notyf.error('Gagal menghapus testimoni');
        }
      });
  }

  /**
   * Delete all testimonials
   */
  deleteAllTestimonials(): void {
    const initialState = {
      message: 'Apakah Anda yakin ingin menghapus SEMUA testimoni? Tindakan ini tidak dapat dibatalkan!',
      cancelClicked: () => this.modalRef?.hide(),
      submitClicked: () => this.confirmDeleteAll(),
      submitMessage: 'Ya, Hapus Semua',
    };

    this.modalRef = this.modalService.show(ModalComponent, { initialState });
  }

  /**
   * Confirm delete all testimonials
   */
  private confirmDeleteAll(): void {
    this.testimonialService.deleteAllTestimonials()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.modalRef?.hide();
          this.notyf.success(response.message || 'Semua testimoni berhasil dihapus');
          this.loadTestimonials();
        },
        error: (error) => {
          this.modalRef?.hide();
          console.error('Error deleting all testimonials:', error);
          this.notyf.error('Gagal menghapus testimoni');
        }
      });
  }

  /**
   * Handle individual selection
   */
  onTestimonialSelect(testimonialId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedTestimonials.push(testimonialId);
    } else {
      this.selectedTestimonials = this.selectedTestimonials.filter(id => id !== testimonialId);
      this.selectAll = false;
    }
    this.updateSelectAllState();
  }

  /**
   * Handle select all
   */
  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll = checked;
    if (checked) {
      this.selectedTestimonials = this.testimonials.map(t => t.id);
    } else {
      this.selectedTestimonials = [];
    }
  }

  /**
   * Update select all state
   */
  private updateSelectAllState(): void {
    this.selectAll = this.testimonials.length > 0 &&
                     this.selectedTestimonials.length === this.testimonials.length;
  }

  /**
   * Bulk status update
   */
  bulkUpdateStatus(status: boolean): void {
    if (this.selectedTestimonials.length === 0) {
      this.notyf.error('Silakan pilih testimoni terlebih dahulu');
      return;
    }

    const statusText = status ? 'dipublikasikan' : 'disembunyikan';
    const initialState = {
      message: `Apakah Anda yakin ingin mengubah status ${this.selectedTestimonials.length} testimoni menjadi ${statusText}?`,
      cancelClicked: () => this.modalRef?.hide(),
      submitClicked: () => this.confirmBulkStatusUpdate(status),
      submitMessage: 'Ya, Ubah',
    };

    this.modalRef = this.modalService.show(ModalComponent, { initialState });
  }

  /**
   * Confirm bulk status update
   */
  private confirmBulkStatusUpdate(status: boolean): void {
    this.testimonialService.bulkUpdateStatus({
      ids: this.selectedTestimonials,
      status: status
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.modalRef?.hide();
        this.notyf.success(response.message || 'Status testimoni berhasil diubah');
        this.selectedTestimonials = [];
        this.selectAll = false;
        this.loadTestimonials();
      },
      error: (error) => {
        this.modalRef?.hide();
        console.error('Error bulk updating status:', error);
        this.notyf.error('Gagal mengubah status testimoni');
      }
    });
  }

  /**
   * Check if testimonial is selected
   */
  isSelected(testimonialId: number): boolean {
    return this.selectedTestimonials.includes(testimonialId);
  }

  /**
   * Get status badge HTML
   */
  getStatusBadge(status: number): string {
    return status === 1
      ? '<span class="badge badge-success">Dipublikasi</span>'
      : '<span class="badge badge-secondary">Disembunyikan</span>';
  }

  /**
   * Truncate text
   */
  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByTestimonialId(index: number, testimonial: TestimonialData): number {
    return testimonial.id;
  }
}
