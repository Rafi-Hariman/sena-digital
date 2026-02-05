import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import {
  DashboardService,
  DashboardServiceType,
  BukuTamuEntry,
  BukuTamuResponse,
  BukuTamuStatistics,
  BukuTamuStatisticsResponse,
  BukuTamuCreateRequest
} from 'src/app/dashboard.service';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'wc-buku-tamu-view',
  templateUrl: './buku-tamu-view.component.html',
  styleUrls: ['./buku-tamu-view.component.scss']
})
export class BukuTamuViewComponent implements OnInit {

  @Input() userId!: number;

  bukuTamuForm!: FormGroup;
  entries: BukuTamuEntry[] = [];
  statistics: BukuTamuStatistics | null = null;
  isSubmitting = false;
  isLoading = true;

  statusFilter: 'all' | 'hadir' | 'tidak_hadir' | 'ragu' = 'all';
  entriesToShow = 3;

  private notyf: Notyf;

  constructor(
    private fb: FormBuilder,
    private dashboardSvc: DashboardService
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.bukuTamuForm = this.fb.group({
      nama: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      telepon: ['', [Validators.maxLength(20)]],
      status_kehadiran: ['', Validators.required],
      jumlah_tamu: [1, [Validators.min(1), Validators.max(20)]],
      ucapan: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]]
    });

    this.bukuTamuForm.get('status_kehadiran')?.valueChanges.subscribe(status => {
      if (status === 'hadir') {
        this.bukuTamuForm.get('jumlah_tamu')?.setValidators([Validators.required, Validators.min(1), Validators.max(20)]);
      } else {
        this.bukuTamuForm.get('jumlah_tamu')?.clearValidators();
        this.bukuTamuForm.get('jumlah_tamu')?.setValue(null);
      }
      this.bukuTamuForm.get('jumlah_tamu')?.updateValueAndValidity();
    });
  }

  private loadData(): void {
    const params = { user_id: this.userId };

    const list$ = this.dashboardSvc.list(DashboardServiceType.BUKUTAMU_PUBLIC_LIST, params).pipe(
      catchError(() => of(null))
    );

    const stats$ = this.dashboardSvc.list(DashboardServiceType.BUKUTAMU_PUBLIC_STATISTICS, params).pipe(
      catchError(() => of(null))
    );

    forkJoin({ list: list$, stats: stats$ }).subscribe(results => {
      if (results.list) {
        const response = results.list as BukuTamuResponse;
        this.entries = response.data || [];
      }
      if (results.stats) {
        const statsResponse = results.stats as BukuTamuStatisticsResponse;
        this.statistics = statsResponse.data;
      }
      this.isLoading = false;
    });
  }

  onSubmit(): void {
    if (this.bukuTamuForm.invalid) {
      Object.keys(this.bukuTamuForm.controls).forEach(key => {
        this.bukuTamuForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData: BukuTamuCreateRequest = {
      ...this.bukuTamuForm.value,
      user_id: this.userId
    };

    this.dashboardSvc.create(DashboardServiceType.BUKUTAMU_PUBLIC_CREATE, formData).subscribe(
      () => {
        this.notyf.success('Ucapan berhasil dikirim!');
        this.bukuTamuForm.reset({ status_kehadiran: '', jumlah_tamu: 1 });
        this.loadData();
        this.isSubmitting = false;
      },
      error => {
        console.error('Error submitting:', error);
        this.notyf.error('Gagal mengirim ucapan');
        this.isSubmitting = false;
      }
    );
  }

  get filteredEntries(): BukuTamuEntry[] {
    let filtered = this.entries.filter(e => e.is_approved);
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status_kehadiran === this.statusFilter);
    }
    return filtered.slice(0, this.entriesToShow);
  }

  loadMore(): void {
    this.entriesToShow += 3;
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const threshold = 100;
    const position = target.scrollTop + target.offsetHeight;
    const height = target.scrollHeight;
    
    if (position > height - threshold && this.entriesToShow < this.entries.length) {
      this.loadMore();
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes = { hadir: 'badge-success', tidak_hadir: 'badge-danger', ragu: 'badge-warning' };
    return classes[status as keyof typeof classes] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels = { hadir: 'Hadir', tidak_hadir: 'Tidak Hadir', ragu: 'Masih Ragu' };
    return labels[status as keyof typeof labels] || status;
  }

  getRelativeTime(dateString: string): string {
    const diffMs = new Date().getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  get ucapanLength(): number {
    return this.bukuTamuForm.get('ucapan')?.value?.length || 0;
  }
}
