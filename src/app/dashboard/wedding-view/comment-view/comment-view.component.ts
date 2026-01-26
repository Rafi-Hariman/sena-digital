import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WeddingData } from '../../../services/wedding-data.service';
import {
  DashboardService,
  DashboardServiceType,
  KomentarItem,
  KomentarListResponse,
  KomentarCreateRequest,
  KomentarCreateResponse,
  KomentarStatisticsResponse
} from '../../../dashboard.service';
import { Notyf } from 'notyf';

interface CommentFormData {
  nama: string;
  komentar: string;
}

@Component({
  selector: 'wc-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrls: ['./comment-view.component.scss']
})
export class CommentViewComponent implements OnInit, OnDestroy {
  @Input() weddingData: WeddingData | undefined;

  // Comment list state
  comments: KomentarItem[] = [];
  totalComments: number = 0;
  currentPage: number = 1;
  perPage: number = 10;
  hasMore: boolean = false;
  isLoadingComments: boolean = false;
  isLoadingMore: boolean = false;

  // Form state
  formData: CommentFormData = {
    nama: '',
    komentar: ''
  };
  isSubmitting: boolean = false;

  // Validation constants
  readonly MIN_NAMA_LENGTH = 2;
  readonly MAX_NAMA_LENGTH = 255;
  readonly MIN_KOMENTAR_LENGTH = 5;
  readonly MAX_KOMENTAR_LENGTH = 500;

  private notyf: Notyf;
  private subscriptions = new Subscription();

  constructor(private dashboardService: DashboardService) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit(): void {

    this.loadComments();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadComments(): void {
    const apiParams = this.getApiParams();
    if (!apiParams.user_id && !apiParams.domain) {

      return;
    }

    this.isLoadingComments = true;

    const params = {
      ...apiParams,
      page: this.currentPage,
      per_page: this.perPage
    };

    const subscription = this.dashboardService.list(
      DashboardServiceType.KOMENTAR_LIST,
      params
    ).subscribe({
      next: (response: KomentarListResponse) => {
        this.comments = response.data;
        this.totalComments = response.meta.total;
        this.hasMore = response.meta.current_page < response.meta.last_page;
        this.isLoadingComments = false;
      },
      error: (error) => {

        this.isLoadingComments = false;
      }
    });

    this.subscriptions.add(subscription);
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMore) {
      return;
    }

    this.isLoadingMore = true;
    this.currentPage++;

    const apiParams = this.getApiParams();
    const params = {
      ...apiParams,
      page: this.currentPage,
      per_page: this.perPage
    };

    const subscription = this.dashboardService.list(
      DashboardServiceType.KOMENTAR_LIST,
      params
    ).subscribe({
      next: (response: KomentarListResponse) => {
        this.comments = [...this.comments, ...response.data];
        this.hasMore = response.meta.current_page < response.meta.last_page;
        this.isLoadingMore = false;
      },
      error: (error) => {

        this.isLoadingMore = false;
        this.currentPage--;
      }
    });

    this.subscriptions.add(subscription);
  }

  private loadStatistics(): void {
    const apiParams = this.getApiParams();
    if (!apiParams.user_id && !apiParams.domain) return;

    const subscription = this.dashboardService.list(
      DashboardServiceType.KOMENTAR_STATISTICS,
      apiParams
    ).subscribe({
      next: (response: KomentarStatisticsResponse) => {
        this.totalComments = response.data.total_komentars;
      },
      error: (error) => {

      }
    });

    this.subscriptions.add(subscription);
  }

  onSubmit(): void {
    const apiParams = this.getApiParams();
    if (!apiParams.user_id && !apiParams.domain) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const requestData: KomentarCreateRequest = {
      ...apiParams,
      nama: this.formData.nama.trim(),
      komentar: this.formData.komentar.trim()
    };

    const subscription = this.dashboardService.create(
      DashboardServiceType.KOMENTAR_CREATE,
      requestData
    ).subscribe({
      next: (response: KomentarCreateResponse) => {
        this.notyf.success('Komentar berhasil dikirim! Terima kasih.');
        this.resetForm();
        this.comments = [response.data, ...this.comments];
        this.totalComments++;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.handleSubmissionError(error);
        this.isSubmitting = false;
      }
    });

    this.subscriptions.add(subscription);
  }

  private validateForm(): boolean {
    const nama = this.formData.nama.trim();
    const komentar = this.formData.komentar.trim();

    if (nama.length < this.MIN_NAMA_LENGTH || nama.length > this.MAX_NAMA_LENGTH) {
      return false;
    }

    if (komentar.length < this.MIN_KOMENTAR_LENGTH || komentar.length > this.MAX_KOMENTAR_LENGTH) {
      return false;
    }

    return true;
  }

  private handleSubmissionError(error: any): void {
    let errorMessage = 'Terjadi kesalahan saat mengirim komentar.';

    if (error.status === 422 && error.error?.errors) {
      const validationErrors = error.error.errors;
      const errorMessages: string[] = [];

      Object.keys(validationErrors).forEach(field => {
        const fieldErrors = validationErrors[field];
        if (Array.isArray(fieldErrors)) {
          errorMessages.push(...fieldErrors);
        }
      });

      if (errorMessages.length > 0) {
        errorMessage = errorMessages.join('\n');
      }
    } else if (error.status === 429) {
      errorMessage = 'Anda telah mengirim terlalu banyak komentar. Batas: 10 komentar per jam. Silakan coba lagi nanti.';
    } else if (error.status === 403) {
      errorMessage = error.error?.message || 'Undangan tidak aktif. Tidak dapat mengirim komentar.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

  }

  private resetForm(): void {
    this.formData = {
      nama: '',
      komentar: ''
    };
  }

  /**
   * Get user_id from localStorage (preferred method)
   */
  private getUserId(): number | null {
    const userId = localStorage.getItem('wedding_user_id');
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Get domain from weddingData (fallback method)
   */
  private getDomain(): string | null {
    return this.weddingData?.settings?.domain || null;
  }

  /**
   * Get parameters for API calls (user_id OR domain)
   * Priority: user_id from localStorage > domain from weddingData
   */
  private getApiParams(): { user_id?: number; domain?: string } {
    const userId = this.getUserId();
    if (userId) {
      return { user_id: userId };
    }
    const domain = this.getDomain();
    if (domain) {
      return { domain: domain };
    }
    return {};
  }

  hasComments(): boolean {
    return this.comments && this.comments.length > 0;
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  trackByCommentId(index: number, item: KomentarItem): number {
    return item.id;
  }
}
