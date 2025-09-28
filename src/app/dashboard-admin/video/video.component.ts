import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { VideoCategoryService } from '../../services/video-category.service';
import { VideoThemeService, VideoTheme } from '../../services/video-theme.service';
import { VideoCategory, CategoryListParams } from '../../interfaces/admin-category.interfaces';
import { ModalAddVideoCategoryComponent } from '../../shared/modal/modal-add-video-category/modal-add-video-category.component';
import { ModalDeleteCategoryAdminComponent } from '../../shared/modal/modal-delete-category-admin/modal-delete-category-admin.component';
import { ModalEditCategoryAdminComponent } from '../../shared/modal/modal-edit-category-admin/modal-edit-category-admin.component';
import { ModalDeleteAllCategoryComponent } from 'src/app/shared/modal/modal-delete-all-category/modal-delete-all-category.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { Notyf } from 'notyf';

@Component({
  selector: 'wc-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {

  // Category data
  allData: VideoCategory[] = [];
  displayedData: VideoCategory[] = [];
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSizes: number[] = [5, 10, 20, 30, 50, 100];
  selectedItem: VideoCategory | null = null;
  searchTerm: string = '';
  statusFilter: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Theme data
  allThemes: VideoTheme[] = [];
  displayedThemes: VideoTheme[] = [];
  themePageSize: number = 6;
  themeCurrentPage: number = 1;
  themeTotalPages: number = 1;
  themeSearchTerm: string = '';
  themeStatusFilter: string = '';
  themeLoading: boolean = false;
  themeError: string | null = null;

  private subscriptions: Subscription[] = [];
  private notyf: Notyf;

  constructor(
    private videoCategoryService: VideoCategoryService,
    private videoThemeService: VideoThemeService,
    private modalSvc: BsModalService,
    private cdr: ChangeDetectorRef
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit(): void {
    this.initializeSubscriptions();
    this.getData();
    this.getThemes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeSubscriptions(): void {
    // Subscribe to loading state
    const loadingSub = this.videoCategoryService.loading$.subscribe(loading => {
      this.loading = loading;
    });
    this.subscriptions.push(loadingSub);

    // Subscribe to error state
    const errorSub = this.videoCategoryService.error$.subscribe(error => {
      this.error = error;
    });
    this.subscriptions.push(errorSub);

    // Subscribe to categories
    const categoriesSub = this.videoCategoryService.categories$.subscribe(categories => {
      this.allData = categories;
      this.updatePagination();
    });
    this.subscriptions.push(categoriesSub);

    // Subscribe to theme loading state
    const themeLoadingSub = this.videoThemeService.loading$.subscribe(loading => {
      this.themeLoading = loading;
    });
    this.subscriptions.push(themeLoadingSub);

    // Subscribe to theme error state
    const themeErrorSub = this.videoThemeService.error$.subscribe(error => {
      this.themeError = error;
    });
    this.subscriptions.push(themeErrorSub);

    // Subscribe to themes
    const themesSub = this.videoThemeService.themes$.subscribe(themes => {
      console.log('Themes subscription triggered:', themes.length);
      this.allThemes = themes;
      this.updateThemePagination();
      this.cdr.detectChanges(); // Force change detection
    });
    this.subscriptions.push(themesSub);
  }

  getData() {
    // Build params object without undefined values
    const params: any = {
      per_page: 100 // Get all data for client-side pagination
    };

    // Only add search if it has a valid value
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params.search = this.searchTerm.trim();
    }

    // Only add status if it's valid
    if (this.statusFilter === 'active' || this.statusFilter === 'inactive') {
      params.status = this.statusFilter;
    }

    this.videoCategoryService.getCategories(params).subscribe({
      next: (response) => {
        // Data is automatically updated via subscription
    this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading video categories:', error);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.getData();
  }

  onStatusFilter(status: string) {
    this.statusFilter = status;
    this.currentPage = 1;
    this.getData();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.allData.length / this.pageSize);
    this.onPageChange(this.currentPage);
    if (this.allData.length === 0) {
      this.displayedData = [];
    }
  }

  private updateThemePagination() {
    console.log('Updating theme pagination. All themes:', this.allThemes.length);

    // Reset to first page if current page would be invalid
    if (this.allThemes.length === 0) {
      this.displayedThemes = [];
      this.themeTotalPages = 0;
      this.themeCurrentPage = 1;
      return;
    }

    this.themeTotalPages = Math.ceil(this.allThemes.length / this.themePageSize);

    // Ensure current page is valid
    if (this.themeCurrentPage > this.themeTotalPages) {
      this.themeCurrentPage = Math.max(1, this.themeTotalPages);
    }

    this.onThemePageChange(this.themeCurrentPage);
    console.log('Theme pagination updated. Displayed themes:', this.displayedThemes.length);
  }

  getThemes() {
    // Build params object without undefined values
    const params: any = {
      per_page: 100 // Get all data for client-side pagination
    };

    // Only add search if it has a valid value
    if (this.themeSearchTerm && this.themeSearchTerm.trim() !== '') {
      params.search = this.themeSearchTerm.trim();
    }

    // Only add status if it's valid
    if (this.themeStatusFilter === 'active' || this.themeStatusFilter === 'inactive') {
      params.status = this.themeStatusFilter;
    }

    this.videoThemeService.getThemes(params).subscribe({
      next: (response) => {
        // Data is automatically updated via subscription
      },
      error: (error) => {
        console.error('Error loading video themes:', error);
      }
    });
  }

  onThemeSearch(searchTerm: string) {
    this.themeSearchTerm = searchTerm;
    this.themeCurrentPage = 1;
    this.getThemes();
  }

  onThemeStatusFilter(status: string) {
    this.themeStatusFilter = status;
    this.themeCurrentPage = 1;
    this.getThemes();
  }

  onThemePageChange(page: number) {
    if (page < 1 || page > this.themeTotalPages || this.themeTotalPages === 0) return;
    this.themeCurrentPage = page;
    const start = (page - 1) * this.themePageSize;
    const end = start + this.themePageSize;
    this.displayedThemes = this.allThemes.slice(start, end);
  }

  toggleThemeStatus(theme: VideoTheme) {
    if (!theme.id) return;

    const newStatus = !theme.is_active;
    this.videoThemeService.toggleActivation(theme.id, newStatus).subscribe({
      next: (result) => {
        // Data will be refreshed automatically via subscription
        // This will also refresh categories since they're synchronized
        this.getData();
      },
      error: (error) => {
        console.error('Error toggling theme status:', error);
      }
    });
  }

  getThemeImageUrl(imagePath: string): string {
    return this.videoThemeService.getImageUrl(imagePath);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages || this.totalPages === 0) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedData = this.allData.slice(start, end);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleCategoryStatus(category: VideoCategory) {
    if (!category.id) return;

    const newStatus = !category.is_active;
    this.videoCategoryService.toggleActivation(category.id, newStatus).subscribe({
      next: (result) => {
        if (result.success) {
          // Data will be refreshed automatically via subscription
          // This will also refresh themes since they're synchronized
          this.getThemes();
        }
      },
      error: (error) => {
        console.error('Error toggling category status:', error);
      }
    });
  }

  getImageUrl(imagePath: string): string {
    return this.videoCategoryService.getImageUrl(imagePath);
  }

  openEditModal(item: VideoCategory) {
    this.selectedItem = { ...item };
    const modalRef = this.modalSvc.show(ModalEditCategoryAdminComponent, {
      class: 'modal-medium',
      initialState: {
        item: this.selectedItem
      },
      ignoreBackdropClick: false
    });
    if (modalRef.content) {
      modalRef.content.onClose.subscribe(() => {
        this.getData();
      });
    }
  }

  openDeleteModal(item: VideoCategory) {
    this.selectedItem = { ...item };
    const modalRef = this.modalSvc.show(ModalDeleteCategoryAdminComponent, {
      class: 'modal-medium',
      initialState: {
        item: this.selectedItem,
        categoryType: 'video'
      },
      ignoreBackdropClick: false
    });
    if (modalRef.content) {

      modalRef.content.onClose.subscribe((result: boolean) => {
        if (result) {
          this.getData();
          this.getThemes(); // Refresh themes too since they're synchronized
        }
      });
    }
  }

  openModalAdd() {
    const modalRef = this.modalSvc.show(ModalAddVideoCategoryComponent, {
      class: 'modal-medium',
      ignoreBackdropClick: false
    });
    if (modalRef.content) {
      modalRef.content.onClose.subscribe(() => {
        this.getData();
        this.getThemes(); // Refresh themes too since they're synchronized
      });
    }
  }

  openModalDeleteAll() {
    const modalRef = this.modalSvc.show(ModalDeleteAllCategoryComponent, {
      class: 'modal-medium',
      initialState: {
        categoryType: 'video'
      },
      ignoreBackdropClick: false
    });
    if (modalRef.content) {
      modalRef.content.onClose.subscribe((result: boolean) => {
        if (result) {
          this.getData();
          this.getThemes(); // Refresh themes too since they're synchronized
        }
      });
    }
  }

  /**
   * Alternative method to show delete confirmation using the simple modal component
   */
  showDeleteConfirmation(item: VideoCategory): void {
    const modalRef = this.modalSvc.show(ModalComponent, {
      class: 'modal-medium',
      initialState: {
        message: `Apakah Anda yakin ingin menghapus kategori "${item.nama_kategori}"?`,
        submitMessage: 'Hapus',
        cancelClicked: () => {
          console.log('Delete cancelled');
        },
        submitClicked: (data: any) => {
          this.deleteCategory(item);
        }
      },
      ignoreBackdropClick: false
    });

    if (modalRef.content) {
      modalRef.content.onClose.subscribe((result: any) => {
        console.log('Modal closed with result:', result);
      });
    }
  }

  /**
   * Delete category using service
   */
  private deleteCategory(item: VideoCategory): void {
    if (!item.id) {
      this.notyf.error('ID kategori tidak valid');
      return;
    }

    this.videoCategoryService.deleteCategory(item.id).subscribe({
      next: (result) => {
        if (result.success) {
          this.notyf.success('Kategori berhasil dihapus');
          this.getData();
          this.getThemes(); // Refresh themes too since they're synchronized
          this.updatePagination();
        } else {
          this.notyf.error(result.error || 'Gagal menghapus kategori');
        }
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.notyf.error(error.error || 'Terjadi kesalahan saat menghapus kategori');
      }
    });
  }

  /**
   * Delete theme using service
   */
  deleteTheme(theme: VideoTheme): void {
    if (!theme.id) {
      this.notyf.error('ID tema tidak valid');
      return;
    }

    // Use the same modal as category delete
    const modalRef = this.modalSvc.show(ModalDeleteCategoryAdminComponent, {
      class: 'modal-medium',
      initialState: {
        item: {
          id: theme.id,
          nama_kategori: theme.nama_kategori,
          slug: theme.slug
        },
        categoryType: 'video-theme' // Special type for theme deletion
      },
      ignoreBackdropClick: false
    });

    if (modalRef.content) {
      modalRef.content.onClose.subscribe((result: boolean) => {
        if (result) {
          console.log('Theme delete confirmed, refreshing data...');
          // Force immediate refresh of themes and categories after deletion
          this.refreshDataAfterDelete();
        }
      });
    }
  }

  /**
   * Get theme display name from API data
   */
  getThemeDisplayName(theme: VideoTheme): string {
    // Use the actual name from API, fallback to formatted slug
    if (theme.nama_kategori) {
      return theme.nama_kategori;
    }
    if (theme.slug) {
      return this.formatSlugTitle(theme.slug);
    }
    return 'Unknown Theme';
  }

  /**
   * Format slug for display (if needed as fallback)
   */
  formatSlugTitle(slug: string): string {
    return slug.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

    /**
   * Force refresh data after delete operation
   */
  private refreshDataAfterDelete(): void {
    console.log('Starting force refresh after delete...');

    // Clear current displayed themes immediately to show loading state
    this.displayedThemes = [];
    this.themeLoading = true;

    // Use force refresh on theme service
    this.videoThemeService.forceRefreshThemes();

    // Also refresh categories
    this.getData();

    // Wait for subscription to update, then force pagination update
    setTimeout(() => {
      console.log('Force updating pagination after delete');
      this.updateThemePagination();
      this.updatePagination();
      this.themeLoading = false;
      this.cdr.detectChanges(); // Force change detection after refresh
      console.log('Data refresh completed. Current themes:', this.allThemes.length);
    }, 1000); // Increased delay to ensure API response is processed
  }

}
