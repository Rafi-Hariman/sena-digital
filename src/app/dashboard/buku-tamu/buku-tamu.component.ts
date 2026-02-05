import { Component, OnInit, TemplateRef } from '@angular/core';
import { Notyf } from 'notyf';
import {
  DashboardService,
  DashboardServiceType,
  BukuTamuEntry,
  BukuTamuResponse,
  BukuTamuStatistics,
  BukuTamuStatisticsResponse,
  BukuTamuDeleteResponse,
  BukuTamuUpdateApprovalRequest,
  BukuTamuBulkApprovalRequest,
  BukuTamuBulkResponse,
  BukuTamuExportResponse
} from 'src/app/dashboard.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'wc-buku-tamu',
  templateUrl: './buku-tamu.component.html',
  styleUrls: ['./buku-tamu.component.scss']
})
export class BukuTamuComponent implements OnInit {

  dataList: BukuTamuEntry[] = [];
  filteredDataList: BukuTamuEntry[] = [];
  statistics: BukuTamuStatistics | null = null;
  isLoading = false;
  apiError: string | null = null;

  private notyf: Notyf;

  // Filter and search
  searchQuery = '';
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

  // Expose Math for template
  Math = Math;
  selectedEntry: BukuTamuEntry | null = null;

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
      DashboardServiceType.BUKUTAMU_USER_LIST,
      listParams
    ).pipe(
      catchError(error => {
        console.error('Error fetching buku tamu list:', error);
        return of(null);
      })
    );

    const statistics$ = this.dashBoardSvc.list(
      DashboardServiceType.BUKUTAMU_USER_STATISTICS,
      ''
    ).pipe(
      catchError(error => {
        console.error('Error fetching buku tamu statistics:', error);
        return of(null);
      })
    );

    forkJoin({
      bukuTamuList: bukuTamuList$,
      statistics: statistics$
    }).subscribe(
      (results) => {
        if (results.bukuTamuList) {
          const response = results.bukuTamuList as BukuTamuResponse;
          this.dataList = response.data || [];
          this.totalItems = response.pagination?.total || 0;
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

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.nama.toLowerCase().includes(query) ||
        entry.email?.toLowerCase().includes(query) ||
        (entry.ucapan?.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status_kehadiran === this.statusFilter);
    }

    // Approval filter
    if (this.approvalFilter !== 'all') {
      const isApproved = this.approvalFilter === 'approved';
      filtered = filtered.filter(entry => entry.is_approved === isApproved);
    }

    // Sort
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
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

  openDetailModal(template: TemplateRef<any>, entry: BukuTamuEntry): void {
    this.selectedEntry = entry;
    this.modalRef = this.modalSvc.show(template, { class: 'modal-lg' });
  }

  closeModal(): void {
    this.modalRef?.hide();
    this.selectedEntry = null;
  }

  toggleApproval(entry: BukuTamuEntry): void {
    const newStatus = !entry.is_approved;
    const body: BukuTamuUpdateApprovalRequest = { is_approved: newStatus };

    this.dashBoardSvc.update(
      DashboardServiceType.BUKUTAMU_USER_UPDATE_APPROVAL,
      `/${entry.id}/approval`,
      body
    ).subscribe(
      () => {
        entry.is_approved = newStatus;
        this.notyf.success(newStatus ? 'Ucapan disetujui' : 'Ucapan disembunyikan');
        this.loadData(); // Refresh statistics
      },
      (error) => {
        console.error('Error updating approval status:', error);
        this.notyf.error('Gagal mengubah status');
      }
    );
  }

  deleteSingle(entry: BukuTamuEntry): void {
    if (!confirm(`Hapus ucapan dari ${entry.nama}?`)) {
      return;
    }

    this.dashBoardSvc.deleteV2(
      DashboardServiceType.BUKUTAMU_USER_DELETE,
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

  bulkApprove(): void {
    if (this.selectedIds.size === 0) {
      this.notyf.error('Pilih data terlebih dahulu');
      return;
    }

    const body: BukuTamuBulkApprovalRequest = {
      ids: Array.from(this.selectedIds),
      is_approved: true
    };

    this.dashBoardSvc.patch(
      DashboardServiceType.BUKUTAMU_USER_BULK_APPROVAL,
      '',
      body
    ).subscribe(
      (response: BukuTamuBulkResponse) => {
        this.notyf.success(`${response.data.updated_count} data berhasil disetujui`);
        this.selectedIds.clear();
        this.selectAll = false;
        this.loadData();
      },
      (error: any) => {
        console.error('Error bulk approve:', error);
        this.notyf.error('Gagal menyetujui data');
      }
    );
  }

  bulkHide(): void {
    if (this.selectedIds.size === 0) {
      this.notyf.error('Pilih data terlebih dahulu');
      return;
    }

    const body: BukuTamuBulkApprovalRequest = {
      ids: Array.from(this.selectedIds),
      is_approved: false
    };

    this.dashBoardSvc.patch(
      DashboardServiceType.BUKUTAMU_USER_BULK_APPROVAL,
      '',
      body
    ).subscribe(
      (response: BukuTamuBulkResponse) => {
        this.notyf.success(`${response.data.updated_count} data berhasil disembunyikan`);
        this.selectedIds.clear();
        this.selectAll = false;
        this.loadData();
      },
      (error: any) => {
        console.error('Error bulk hide:', error);
        this.notyf.error('Gagal menyembunyikan data');
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

    const deletePromises = Array.from(this.selectedIds).map(id =>
      this.dashBoardSvc.deleteV2(
        DashboardServiceType.BUKUTAMU_USER_DELETE,
        id
      ).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.notyf.success(`${this.selectedIds.size} data berhasil dihapus`);
        this.selectedIds.clear();
        this.selectAll = false;
        this.loadData();
      })
      .catch((error) => {
        console.error('Error bulk delete:', error);
        this.notyf.error('Gagal menghapus data');
      });
  }

  deleteAll(): void {
    if (!confirm('Hapus semua data buku tamu? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    this.dashBoardSvc.delete(DashboardServiceType.BUKUTAMU_USER_DELETE_ALL).subscribe(
      () => {
        this.notyf.success('Semua data berhasil dihapus');
        this.loadData();
      },
      (error) => {
        console.error('Error deleting all:', error);
        this.notyf.error('Gagal menghapus semua data');
      }
    );
  }

  exportData(): void {
    this.isLoading = true;

    this.dashBoardSvc.list(
      DashboardServiceType.BUKUTAMU_USER_EXPORT,
      { format: 'csv' }
    ).subscribe(
      (response: BukuTamuExportResponse) => {
        const blob = this.base64ToBlob(response.data.content, response.data.mime_type);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.notyf.success('Data berhasil diekspor');
        this.isLoading = false;
      },
      (error) => {
        console.error('Error exporting data:', error);
        this.notyf.error('Gagal mengekspor data');
        this.isLoading = false;
      }
    );
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'hadir':
        return 'badge-success';
      case 'tidak_hadir':
        return 'badge-danger';
      case 'ragu':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'hadir':
        return 'Hadir';
      case 'tidak_hadir':
        return 'Tidak Hadir';
      case 'ragu':
        return 'Masih Ragu';
      default:
        return status;
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
