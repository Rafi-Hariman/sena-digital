import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DashboardService, DashboardServiceType } from '../../../dashboard.service';
import { WebsiteCategoryService } from '../../../services/website-category.service';
import { VideoCategoryService } from '../../../services/video-category.service';
import { WebsiteThemeService } from '../../../services/website-theme.service';
import { VideoThemeService } from '../../../services/video-theme.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import { Subject } from 'rxjs';

@Component({
  selector: 'wc-modal-delete-category-admin',
  templateUrl: './modal-delete-category-admin.component.html',
  styleUrls: ['./modal-delete-category-admin.component.scss']
})
export class ModalDeleteCategoryAdminComponent implements OnInit {

  private notyf: Notyf

  @Input() item: any;
  @Input() categoryType: 'website' | 'video' | 'website-theme' | 'video-theme' = 'website'; // Extended to support themes

  categoryForm!: FormGroup;
  onClose!: Subject<boolean>;

  constructor(
    private modalSvc: BsModalService,
    private dasboardSvc: DashboardService,
    private websiteCategoryService: WebsiteCategoryService,
    private videoCategoryService: VideoCategoryService,
    private websiteThemeService: WebsiteThemeService,
    private videoThemeService: VideoThemeService,
    private formSvc: FormBuilder
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit() {
    this.categoryForm = this.formSvc.group({
      id: [this.item?.id || '', Validators.required],
      name: [this.item?.nama_kategori || this.item?.name || '', Validators.required],
      slug: [this.item?.slug || '', Validators.required]
    });
    this.onClose = new Subject();
  }

  closeModal() {
    this.modalSvc.hide();
  }

  onDeleteCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryId = this.categoryForm.value.id;

    if (!categoryId) {
      this.notyf.error('ID tidak valid');
      return;
    }

    // Determine which service to use based on category type
    let deleteObservable;
    let itemType = '';

    switch (this.categoryType) {
      case 'website':
        deleteObservable = this.websiteCategoryService.deleteCategory(categoryId);
        itemType = 'kategori';
        break;
      case 'video':
        deleteObservable = this.videoCategoryService.deleteCategory(categoryId);
        itemType = 'kategori';
        break;
      case 'website-theme':
        deleteObservable = this.websiteThemeService.deleteTheme(categoryId); // Use actual delete method
        itemType = 'tema';
        break;
      case 'video-theme':
        deleteObservable = this.videoThemeService.deleteTheme(categoryId); // Use actual delete method
        itemType = 'tema';
        break;
      default:
        this.notyf.error('Tipe tidak valid');
        return;
    }

    deleteObservable.subscribe({
      next: (result) => {
        console.log('Delete response:', result);

        // Handle different response formats - some APIs return 204 No Content on successful delete
        const isSuccess = result?.success || result?.status || result === null || result === undefined;

        if (isSuccess !== false) { // Consider null/undefined as success for delete operations
          const action = 'dihapus'; // All items are now actually deleted
          this.notyf.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} berhasil ${action}`);
          this.modalSvc.hide();

          // Add small delay before notifying parent to ensure API has processed
          setTimeout(() => {
            this.onClose.next(true);
          }, 200);
        } else {
          const action = 'menghapus';
          this.notyf.error(result.error || `Gagal ${action} ${itemType}`);
        }
      },
      error: (error) => {
        console.error(`Error with ${itemType}:`, error);
        const action = 'menghapus';
        this.notyf.error(error.error || `Terjadi kesalahan saat ${action} ${itemType}`);
      }
    });
  }
}
