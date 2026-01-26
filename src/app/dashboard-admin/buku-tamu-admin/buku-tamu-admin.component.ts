import { Component, OnInit, TemplateRef } from '@angular/core';
import { Notyf } from 'notyf';
import {
  DashboardService,
  DashboardServiceType,
  BukuTamuAdminEntry,
  BukuTamuAdminResponse,
  BukuTamuStatistics,
  BukuTamuStatisticsResponse
} from 'src/app/dashboard.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'wc-buku-tamu-admin',
  templateUrl: './buku-tamu-admin.component.html',
  styleUrls: ['./buku-tamu-admin.component.scss']
})
export class BukuTamuAdminComponent implements OnInit {

  dataList: BukuTamuAdminEntry[] = [];
  filteredDataList: BukuTamuAdminEntry[] = [];
  statistics: BukuTamuStatistics | null = null;
  isLoading = false;
  apiError: string | null = null;

  private notyf: Notyf;

  // Filters
  searchQuery = '';
  userFilter = 'all';
  statusFilter: 'all' | 'hadir' | 'tidak_hadir' | 'ragu' = 'all';
  approvalFilter: 'all' | 'approved' | 'pending' = 'all';
  sortOrder: 'newest' | 'oldest' = 'newest';

  // Pagination
  currentPage = 1;
  pageSize = 15;
  totalItems = 0;

  // Bulk actions
  selectedIds: Set<number> = new Set();
  selectAll = false;

  // Modal
  modalRef?: BsModalRef;
  selectedEntry: BukuTamuAdminEntry | null = null;

  constructor(
    private dashBoardSvc: DashboardService,
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
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.apiError = null;

    const listParams = {
      page: this.currentPage,
      per_page: this.pageSize
    };

    const bukuTamuList$ = this.dashBoardSvc.list(
      DashboardServiceType.BUKUTAMU_ADMIN_LIST,
      listParams
    ).pipe(
      catchError(error => {
        console.error('Error fetching buku tamu list:', error);
        return of(null);
      })
    );

    const statistics$ = this.dashBoardSvc.list(
      DashboardServiceType.BUKUTAMU_ADMIN_STATISTICS,
      ''
    ).pipe(
      catchError(error => {
        console.error('Error fetching statistics:', error);
        return of(null);
      })
    );

    forkJoin({
      bukuTamuList: bukuTamuList$,
      statistics: statistics$
    }).subscribe(
      (results) => {
        if (results.bukuTamuList) {
          const response = results.bukuTamuList as BukuTamuAdminResponse;
          this.dataList = response.data || [];
          this.totalItems = response.meta?.total || 0;
          this.applyFilters();
        }

        if (results.statistics) {
          const statsResponse = results.statistics as BukuTamuStatisticsResponse;
          this.statistics = statsResponse.data;
        }

        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading data:', error);
        this.apiError = 'Gagal memuat data';
        this.notyf.error('Gagal memuat data');
        this.isLoading = false;
      }
    );
  }

  applyFilters(): void {
    let filtered = [...this.dataList];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.nama.toLowerCase().includes(query) ||
        entry.user?.name?.toLowerCase().includes(query) ||
        entry.email?.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status_kehadiran === this.statusFilter);
    }

    if (this.approvalFilter !== 'all') {
      const isApproved = this.approvalFilter === 'approved';
      filtered = filtered.filter(entry => entry.is_approved === isApproved);
    }

    if (this.sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    this.filteredDataList = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.filteredDataList.forEach(entry => this.selectedIds.add(entry.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleSelection(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectAll = this.selectedIds.size === this.filteredDataList.length;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  openDetailModal(template: TemplateRef<any>, entry: BukuTamuAdminEntry): void {
    this.selectedEntry = entry;
    this.modalRef = this.modalSvc.show(template, { class: 'modal-lg' });
  }

  closeModal(): void {
    this.modalRef?.hide();
    this.selectedEntry = null;
  }

  deleteSingle(entry: BukuTamuAdminEntry): void {
    if (!confirm(`Hapus ucapan dari ${entry.nama}?`)) {
      return;
    }

    this.dashBoardSvc.deleteV2(
      DashboardServiceType.BUKUTAMU_ADMIN_DELETE,
      entry.id
    ).subscribe(
      () => {
        this.notyf.success('Data berhasil dihapus');
        this.loadData();
      },
      (error) => {
        console.error('Error deleting entry:', error);
        this.notyf.error('Gagal menghapus data');
      }
    );
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) {
      this.notyf.error('Pilih data terlebih dahulu');
      return;
    }

    if (!confirm(`Hapus ${this.selectedIds.size} data terpilih?`)) {
      return;
    }

    this.notyf.info('Fitur bulk delete sedang dalam pengembangan');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'hadir': return 'badge-success';
      case 'tidak_hadir': return 'badge-danger';
      case 'ragu': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'hadir': return 'Hadir';
      case 'tidak_hadir': return 'Tidak Hadir';
      case 'ragu': return 'Masih Ragu';
      default: return status;
    }
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
