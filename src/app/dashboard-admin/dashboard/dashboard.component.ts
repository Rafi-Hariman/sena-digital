import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Notyf } from 'notyf';
import { DashboardService, DashboardServiceType } from 'src/app/dashboard.service';

@Component({
  selector: 'wc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  rows: Array<any> = [];
  columns: Array<any> = [];
  isLoading: boolean = false;

  user: any;
  salary: number = 0;
  total_users: number = 0;
  pending_req: number = 0;

  // Modal and form properties
  modalRef?: BsModalRef;
  confirmPaymentForm: FormGroup;
  selectedUser: any = null;
  private notyf: Notyf;

  constructor(
    private dashboardSvc: DashboardService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    // Initialize Notyf
    this.notyf = new Notyf({
      duration: 1000,
      position: {
        x: 'right',
        y: 'top'
      }
    });

    // Initialize form
    this.confirmPaymentForm = this.fb.group({
      user_id: ['', Validators.required],
      kode_pemesanan: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.columns = [
      { name: 'No Invoice', prop: 'invoice' },
      { name: 'Pengguna', prop: 'pengguna' },
      { name: 'Domain', prop: 'domain' },
      { name: 'Status', prop: 'status', type: 'html' }
    ];
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardSvc.getParam(DashboardServiceType.ADM_IDX_DASHBOARD, '').subscribe({
      next: (res) => {
        this.processDashboardData(res);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  processDashboardData(res: any): void {
    const users = res?.users?.data ?? [];

    // Use backend-calculated revenue instead of client-side recalculation
    this.salary = res?.dashboard_analytics?.revenue?.total ?? 0;

    this.total_users = res?.total_users ?? 0;
    this.pending_req = (res?.jumlah_belum_lunas_dan_pending?.BL ?? 0) +
      (res?.jumlah_belum_lunas_dan_pending?.MK ?? 0);

    this.rows = users.map((user: any) => ({
      id: user.id,
      invoice: user.kode_pemesanan ?? '–',
      pengguna: user.email ?? '–',
      domain: user.domain ?? '–',
      statusCode: user.kd_status,
      statusData: this.getStatusData(user.kd_status),
      konfirmasiAktif: user.kd_status !== 'SB',
      originalData: user
    }));
  }

  getStatusData(code: string | null): { text: string; class: string; ariaLabel: string } {
    switch (code) {
      case 'SB':
        return {
          text: 'Aktif',
          class: 'aktif',
          ariaLabel: 'Status Aktif'
        };
      case 'MK':
        return {
          text: 'Menunggu Konfirmasi',
          class: 'waiting',
          ariaLabel: 'Status Menunggu Konfirmasi'
        };
      case 'BL':
        return {
          text: 'Belum Lunas',
          class: 'unpaid',
          ariaLabel: 'Status Belum Lunas'
        };
      case 'EX':
        return {
          text: 'Expired',
          class: 'expired',
          ariaLabel: 'Status Expired'
        };
      default:
        return {
          text: 'Belum selesai',
          class: 'pending',
          ariaLabel: 'Status Belum selesai'
        };
    }
  }

  onConfirmClicked(row: any, template: TemplateRef<any>): void {
    this.selectedUser = row;

    // Populate form with selected user data
    this.confirmPaymentForm.patchValue({
      user_id: row.id,
      kode_pemesanan: row.invoice === '–' ? '' : row.invoice
    });

    // Open modal with custom class for styling
    this.modalRef = this.modalService.show(template, {
      class: 'modal-lg custom-payment-modal',
      backdrop: 'static',
      keyboard: false
    });
  }

  onSubmitPaymentConfirmation(): void {
    if (this.confirmPaymentForm.valid) {
      const payload = this.confirmPaymentForm.value;

      this.dashboardSvc.update(DashboardServiceType.RDM_CONFIRM_PAYMENT, '', payload).subscribe({
        next: (res) => {
          this.notyf.success('Berhasil konfirmasi pembayaran');
          this.modalRef?.hide();
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error confirming payment:', error);
          this.notyf.error('Gagal konfirmasi pembayaran');
        }
      });
    } else {
      this.notyf.error('Mohon lengkapi semua field yang diperlukan');
    }
  }

  onCancelModal(): void {
    this.modalRef?.hide();
    this.confirmPaymentForm.reset();
    this.selectedUser = null;
  }

  onEditClicked(row: any): void {
    console.log('Edit action:', row);
  }

  onDeleteClicked(row: any): void {
    console.log('Delete action:', row);
  }
}
