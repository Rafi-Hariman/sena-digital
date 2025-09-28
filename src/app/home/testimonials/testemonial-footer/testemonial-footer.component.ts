import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, TestimonialService, TestimonialData } from '../../../dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'wc-testemonial-footer',
  templateUrl: './testemonial-footer.component.html',
  styleUrls: ['./testemonial-footer.component.scss']
})
export class TestemonialFooterComponent implements OnInit, OnDestroy {
  testimonials: TestimonialData[] = [];
  isLoading = true;
  hasError = false;
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;

  private destroy$ = new Subject<void>();
  private testimonialService: TestimonialService;

  constructor(private dashboardService: DashboardService) {
    this.testimonialService = new TestimonialService(this.dashboardService);
  }

  ngOnInit(): void {
    this.loadTestimonials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load public testimonials from API
   */
  loadTestimonials(): void {
    this.isLoading = true;
    this.hasError = false;

    this.testimonialService.getPublicTestimonials({
      limit: this.itemsPerPage,
      page: this.currentPage
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response && response.data) {
          this.testimonials = response.data;
          this.totalItems = response.meta?.total || response.data.length;
        } else {
          this.testimonials = [];
          this.hasError = true;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.testimonials = [];
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  /**
   * Load more testimonials
   */
  loadMore(): void {
    if (this.testimonials.length < this.totalItems) {
      this.currentPage++;
      this.loadTestimonials();
    }
  }

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Truncate review text
   */
  truncateReview(review: string, maxLength: number = 120): string {
    if (review.length <= maxLength) return review;
    return review.substring(0, maxLength) + '...';
  }

  /**
   * Format location display
   */
  getLocationDisplay(kota: string, provinsi: string): string {
    return `${kota}, ${provinsi}`;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByTestimonialId(index: number, testimonial: TestimonialData): number {
    return testimonial.id;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  }
}
