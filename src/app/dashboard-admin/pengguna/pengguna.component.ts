import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardServiceType } from 'src/app/dashboard.service';

@Component({
  selector: 'wc-pengguna',
  templateUrl: './pengguna.component.html',
  styleUrls: ['./pengguna.component.scss']
})
export class PenggunaComponent implements OnInit {
  rows: Array<any> = [];
  columns: Array<any> = [];

  user: any
  salary: any;
  total_users: any;
  pending_req: any;

  constructor(
    private dashboardSvc: DashboardService
  ) { }

  ngOnInit(): void {

    this.getDetailUser();

    this.columns = [
      { name: 'No Invoice', prop: 'invoice' },
      { name: 'Pengguna', prop: 'pengguna' },
      { name: 'Domain', prop: 'domain' },
      { name: 'Status', prop: 'status', type: 'html' }
    ];
  }

  getDetailUser() {
    this.dashboardSvc.getParam(DashboardServiceType.ADM_IDX_DASHBOARD, '').subscribe(res => {
      const users = res?.users?.data ?? [];

      this.salary = res?.total_keuntungan ?? 0;
      this.total_users = res?.total_users ?? 0;
      this.pending_req = (res?.jumlah_belum_lunas_dan_pending?.BL ?? 0) +
        (res?.jumlah_belum_lunas_dan_pending?.MK ?? 0);

      this.rows = users.map((user: any) => ({
        invoice: user.kode_pemesanan ?? '–',
        pengguna: user.email ?? '–',
        domain: user.domain ?? '–',
        status: this.getStatusLabel(user.kd_status),
        konfirmasiAktif: user.kd_status === 'SB'
      }));
    });
  }

  getStatusLabel(code: string | null): string {
    switch (code) {
      case 'SB':
        return `<span class="status-badge aktif" aria-label="Status Aktif"><span class="dot"></span>Aktif</span>`;
      case 'MK':
        return `<span class="status-badge waiting" aria-label="Status Menunggu Konfirmasi"><span class="dot"></span>Menunggu Konfirmasi</span>`;
      case 'BL':
        return `<span class="status-badge unpaid" aria-label="Status Belum Lunas"><span class="dot"></span>Belum Lunas</span>`;
      case 'EX':
        return `<span class="status-badge expired" aria-label="Status Expired"><span class="dot"></span>Expired</span>`;
      default:
        return `<label class="status-badge pending">Belum selesai</label>`;
    }
  }
}
