import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MidtransService } from '../../services/midtrans.service';
import { Invitation, PaketUndangan, User } from '../../models';

@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss']
})
export class InvoicePaymentComponent implements OnInit, OnDestroy {
  @Input() invoiceData: any;

  user: User | null = null;
  invitation: Invitation | null = null;
  package: PaketUndangan | null = null;

  isLoading = false;
  isProcessingPayment = false;
  errorMessage = '';

  // Payment state tracking for modal close handling
  private lastSnapToken: string | null = null;
  private lastOrderId: string | null = null;
  modalWasClosed = false;
  showReopenButtons = false;

  // LocalStorage keys for payment state persistence
  private readonly STORAGE_KEY_TOKEN = 'pending_payment_token';
  private readonly STORAGE_KEY_ORDER = 'pending_payment_order';
  private readonly STORAGE_KEY_AMOUNT = 'pending_payment_amount';

  private subscriptions = new Subscription();

  constructor(
    private midtransService: MidtransService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.invoiceData) {
      this.parseInvoiceData();
    }

    // Load saved payment state for resume capability
    this.loadPaymentState();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private parseInvoiceData(): void {
    const registrasi = this.invoiceData?.registrasi;
    const mempelai = this.invoiceData?.informasiMempelai?.updatedData;

    if (registrasi?.response) {
      const userName = this.extractUserName(registrasi.response.user, mempelai);

      this.user = {
        id: registrasi.response.user?.id,
        name: userName,
        email: registrasi.response.user?.email,
        phone: registrasi.response.user?.phone,
        kode_pemesanan: registrasi.response.user?.kode_pemesanan,
        created_at: registrasi.response.user?.created_at || new Date().toISOString()
      };

      this.invitation = registrasi.response.invitation || null;

      if (this.invitation && registrasi.response.invitation?.package_features_snapshot) {
        const snapshot = registrasi.response.invitation.package_features_snapshot;
        this.package = {
          id: parseInt(registrasi.formData?.paket_undangan_id) || 0,
          name_paket: snapshot.name_paket || 'Paket Unknown',
          jenis_paket: this.mapJenisPaket(snapshot.jenis_paket),
          price: parseFloat(registrasi.formData?.price) || 0,
          masa_aktif: this.invitation.package_duration_snapshot || 0,
          halaman_buku: snapshot.halaman_buku || 0,
          kirim_wa: !!snapshot.kirim_wa,
          bebas_pilih_tema: !!snapshot.bebas_pilih_tema,
          kirim_hadiah: !!snapshot.kirim_hadiah,
          import_data: !!snapshot.import_data
        };
      }

      console.log('Invoice data parsed:', {
        user_id: this.user?.id,
        invitation_id: this.invitation?.id,
        payment_status: this.invitation?.payment_status,
        amount: this.package?.price
      });
    }
  }

  private extractUserName(userResponse: any, mempelai: any): string {
    if (mempelai?.name_lengkap_pria) {
      return mempelai.name_lengkap_pria;
    }
    if (userResponse?.email) {
      return userResponse.email.split('@')[0];
    }
    return 'Guest';
  }

  private mapJenisPaket(jenis: string): 'basic' | 'standard' | 'premium' {
    const lower = jenis?.toLowerCase() || '';
    if (lower.includes('basic')) return 'basic';
    if (lower.includes('gold') || lower.includes('standard')) return 'standard';
    if (lower.includes('platinum') || lower.includes('premium')) return 'premium';
    return 'standard';
  }

  getStatusBadge(): { label: string; class: string; icon: string } {
    switch (this.invitation?.payment_status) {
      case 'paid':
        return { label: 'Sudah Dibayar', class: 'badge-success', icon: '✅' };
      case 'failed':
        return { label: 'Pembayaran Gagal', class: 'badge-danger', icon: '❌' };
      case 'refunded':
        return { label: 'Dana Dikembalikan', class: 'badge-info', icon: '🔄' };
      case 'pending':
      default:
        return { label: 'Menunggu Pembayaran', class: 'badge-warning', icon: '🟡' };
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  processPayment(): void {
    if (!this.invitation || !this.package || !this.user) {
      this.errorMessage = 'Data tidak lengkap. Silakan refresh halaman.';
      return;
    }

    if (!this.user.id) {
      this.errorMessage = 'User ID tidak ditemukan. Silakan refresh halaman.';
      return;
    }

    if (this.invitation.payment_status !== 'pending') {
      this.errorMessage = 'Undangan ini sudah dibayar atau tidak dalam status pending.';
      return;
    }

    if (this.isProcessingPayment) return;

    this.isProcessingPayment = true;
    this.errorMessage = '';

    const nameParts = (this.user.name || this.user.email).split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload = {
      invitation_id: this.invitation.id,
      amount: this.package.price,
      customer_details: {
        first_name: firstName,
        last_name: lastName || '',
        email: this.user.email,
        phone: this.user.phone || '08123456789'
      },
      item_details: [
        {
          id: `paket-${this.invitation.paket_undangan_id}`,
          name: this.package.name_paket,
          price: this.package.price,
          quantity: 1
        }
      ]
    };

    console.log('Creating payment with payload:', {
      user_id: this.user.id,
      invitation_id: payload.invitation_id,
      amount: payload.amount,
      customer_email: payload.customer_details.email
    });

    // Call public payment API with user_id (no Bearer token required)
    // API: POST /api/midtrans/create-snap-token?user_id={user.id}
    const sub = this.midtransService.createSnapToken(this.user.id, payload).subscribe({
      next: (response) => {
        console.log('Snap token created:', response.data.order_id);

        // Store token and state for reopen capability
        this.lastSnapToken = response.data.snap_token;
        this.lastOrderId = response.data.order_id;
        this.savePaymentState(
          response.data.snap_token,
          response.data.order_id,
          response.data.gross_amount
        );

        this.midtransService.pay(response.data.snap_token, {
          onSuccess: (result) => {
            console.log('Payment completed:', result);
            this.handlePaymentSuccess(result);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            this.handlePaymentPending(result);
          },
          onError: (result) => {
            console.error('Payment failed:', result);
            this.handlePaymentError(result);
          },
          onClose: () => {
            this.handleModalClosed();
          }
        });
      },
      error: (error) => {
        console.error('Failed to create snap token:', error);
        this.handleApiError(error);
        this.isProcessingPayment = false;
      }
    });

    this.subscriptions.add(sub);
  }

  private handlePaymentSuccess(result: any): void {
    console.log('Payment success callback received');

    // Clear payment state on success
    this.clearPaymentState();

    this.router.navigate(['/payment-success'], {
      queryParams: { order_id: result.order_id }
    });
  }

  private handlePaymentPending(result: any): void {
    console.log('Payment pending callback received');
    this.router.navigate(['/payment-pending'], {
      queryParams: { order_id: result.order_id }
    });
  }

  private handlePaymentError(result: any): void {
    this.errorMessage = result.status_message || 'Pembayaran gagal. Silakan coba lagi.';
    this.isProcessingPayment = false;

    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private handleApiError(error: any): void {
    console.error('API Error:', error);
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message
    });

    if (error.error?.errors) {
      const errors = error.error.errors;
      const errorMessages = Object.values(errors).flat() as string[];
      this.errorMessage = errorMessages.join(', ');

      if (errorMessages.some(msg => msg.includes('invitation'))) {
        this.errorMessage += ' Pastikan Anda login dengan akun yang sesuai.';
      }
    } else if (error.error?.message) {
      this.errorMessage = error.error.message;
    } else if (error.status === 0) {
      this.errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (error.status === 401) {
      this.errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
    } else if (error.status === 403) {
      this.errorMessage = 'Anda tidak memiliki akses untuk melakukan pembayaran ini. Pastikan Anda login dengan akun yang benar.';
    } else {
      this.errorMessage = 'Gagal memproses pembayaran. Silakan coba lagi.';
    }
  }

  canPay(): boolean {
    return (
      !this.isLoading &&
      !this.isProcessingPayment &&
      this.invitation?.payment_status === 'pending' &&
      !!this.package
    );
  }

  hasHalamanBuku(): boolean {
    if (!this.package) return false;
    return this.package.halaman_buku === 'unlimited' ||
           (typeof this.package.halaman_buku === 'number' && this.package.halaman_buku > 0);
  }

  /**
   * Save payment state to localStorage for persistence
   * Allows user to resume payment after page refresh or navigation
   */
  private savePaymentState(snapToken: string, orderId: string, amount: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_TOKEN, snapToken);
      localStorage.setItem(this.STORAGE_KEY_ORDER, orderId);
      localStorage.setItem(this.STORAGE_KEY_AMOUNT, amount.toString());
      console.log('💾 Payment state saved to localStorage', { orderId, amount });
    } catch (error) {
      console.error('Failed to save payment state:', error);
    }
  }

  /**
   * Load payment state from localStorage
   * Called on component init to check for pending payments
   */
  private loadPaymentState(): void {
    try {
      this.lastSnapToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      this.lastOrderId = localStorage.getItem(this.STORAGE_KEY_ORDER);

      if (this.lastSnapToken && this.lastOrderId) {
        this.showReopenButtons = true;
        console.log('📂 Resumed pending payment from localStorage', { orderId: this.lastOrderId });
      }
    } catch (error) {
      console.error('Failed to load payment state:', error);
    }
  }

  /**
   * Clear payment state from localStorage
   * Called after successful payment or when no longer needed
   */
  private clearPaymentState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY_TOKEN);
      localStorage.removeItem(this.STORAGE_KEY_ORDER);
      localStorage.removeItem(this.STORAGE_KEY_AMOUNT);
      this.lastSnapToken = null;
      this.lastOrderId = null;
      this.showReopenButtons = false;
      this.modalWasClosed = false;
      console.log('🧹 Payment state cleared');
    } catch (error) {
      console.error('Failed to clear payment state:', error);
    }
  }

  /**
   * Handle modal closed event
   * Show reopen options when user closes Snap modal without completing payment
   */
  private handleModalClosed(): void {
    console.log('🚪 User closed Snap modal without completing payment');
    this.isProcessingPayment = false;
    this.modalWasClosed = true;
    this.showReopenButtons = true;
    this.errorMessage = '';
  }

  /**
   * Reopen Midtrans Snap modal with stored token
   * No new API call required - reuses existing snap_token
   */
  reopenPaymentModal(): void {
    if (!this.lastSnapToken) {
      this.errorMessage = 'Token pembayaran sudah kadaluarsa. Silakan refresh halaman untuk membuat token baru.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
      return;
    }

    console.log('🔄 Reopening Snap modal with stored token...');
    this.showReopenButtons = false;
    this.modalWasClosed = false;
    this.isProcessingPayment = true;
    this.errorMessage = '';

    this.midtransService.pay(this.lastSnapToken, {
      onSuccess: (result) => this.handlePaymentSuccess(result),
      onPending: (result) => this.handlePaymentPending(result),
      onError: (result) => this.handlePaymentError(result),
      onClose: () => this.handleModalClosed()
    });
  }

  /**
   * Open payment in new browser tab
   * Uses Snap redirect URL (vtweb) instead of popup modal
   */
  openPaymentInNewTab(): void {
    if (!this.lastSnapToken) {
      this.errorMessage = 'Token pembayaran sudah kadaluarsa. Silakan refresh halaman untuk membuat token baru.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
      return;
    }

    const paymentUrl = this.midtransService.getSnapRedirectUrl(this.lastSnapToken);
    const newTab = window.open(paymentUrl, '_blank');

    if (newTab) {
      console.log('🪟 Payment opened in new tab:', paymentUrl);
      this.errorMessage = '';
      this.showReopenButtons = false;
      this.isProcessingPayment = false;

      // Show instruction to user
      setTimeout(() => {
        this.errorMessage = 'Pembayaran telah dibuka di tab baru. Silakan selesaikan pembayaran di tab tersebut.';
      }, 500);

      setTimeout(() => {
        this.errorMessage = '';
      }, 10000);
    } else {
      this.errorMessage = 'Pop-up diblokir oleh browser. Harap izinkan pop-up untuk membuka pembayaran di tab baru.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }
}
