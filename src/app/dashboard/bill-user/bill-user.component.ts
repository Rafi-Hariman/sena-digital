import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, DashboardServiceType, UserTagihanItem, UserTagihanResponse } from '../../dashboard.service';
import { ToastService } from '../../toast.service';

export interface Invoice {
  no_invoice: string;
  tanggal_transaksi: string;
  paket: string;
  status: string;
  harga: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

@Component({
  selector: 'wc-bill-user',
  templateUrl: './bill-user.component.html',
  styleUrls: ['./bill-user.component.scss']
})
export class BillUserComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userProfile: UserProfile = {
    name: 'Sheraphine Alana',
    avatar: 'assets/user-profile.jpg'
  };

  invoices: Invoice[] = [];
  isLoading = false;
  error: string | null = null;
  hasData = false;

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadBillingData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load billing data from API
   */
  private loadBillingData(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService.list(DashboardServiceType.USER_TAGIHAN)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UserTagihanResponse) => {
          this.invoices = response.data || [];
          this.hasData = this.invoices.length > 0;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.hasData = false;
          
          if (error.status === 401) {
            this.error = 'Sesi Anda telah berakhir. Silakan login kembali.';
            this.toastService.showToast('Sesi berakhir, silakan login kembali', 'error');
          } else if (error.status === 500) {
            this.error = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
            this.toastService.showToast('Gagal mengambil data tagihan', 'error');
          } else {
            this.error = 'Terjadi kesalahan saat mengambil data tagihan.';
            this.toastService.showToast('Gagal mengambil data tagihan', 'error');
          }
          
          console.error('Error loading billing data:', error);
        }
      });
  }

  /**
   * Retry loading data
   */
  retryLoadData(): void {
    this.loadBillingData();
  }

  /**
   * Format currency to Indonesian Rupiah
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'lunas':
        return 'status-lunas';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-lunas'; // Default to lunas since API only returns paid invoices
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'lunas':
        return 'Lunas';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Lunas'; // Default to lunas since API only returns paid invoices
    }
  }

  /**
   * TrackBy function for invoice list performance optimization
   */
  trackByInvoice(index: number, invoice: Invoice): string {
    return invoice.no_invoice;
  }
}