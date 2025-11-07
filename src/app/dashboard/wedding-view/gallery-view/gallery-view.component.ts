import { Component, OnInit, Input } from '@angular/core';
import { GalleryItem } from '../../../services/wedding-data.service';
import { DashboardService, DashboardServiceType } from '../../../dashboard.service';

@Component({
  selector: 'wc-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss']
})
export class GalleryViewComponent implements OnInit {
  @Input() userId: number | undefined;

  galleryItems: GalleryItem[] = [];
  isLoading: boolean = true;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadGalleryData();
  }

  private loadGalleryData(): void {
    if (!this.userId) {
      console.warn('Gallery: userId not provided, skipping gallery load');
      this.isLoading = false;
      this.galleryItems = [];
      return;
    }

    this.isLoading = true;
    const params = { user_id: this.userId };

    this.dashboardService.list(DashboardServiceType.GALERY_DATA, params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.galleryItems = response.data;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Gallery load error:', error);
        this.isLoading = false;
        this.galleryItems = [];
      }
    });
  }

  getGalleryImages(): GalleryItem[] {
    return this.galleryItems || [];
  }

  hasImages(): boolean {
    return !!(this.galleryItems && this.galleryItems.length > 0);
  }

  getImageUrl(item: GalleryItem): string {
    return item.photo_url || '';
  }

  getImageAlt(item: GalleryItem, index: number): string {
    return item.nama_foto || `Gallery image ${index + 1}`;
  }

  trackByGalleryId(index: number, item: GalleryItem): number {
    return item.id;
  }
}
