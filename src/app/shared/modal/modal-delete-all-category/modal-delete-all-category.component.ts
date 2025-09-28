import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DashboardService, DashboardServiceType } from '../../../dashboard.service';
import { WebsiteCategoryService } from '../../../services/website-category.service';
import { VideoCategoryService } from '../../../services/video-category.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import { Subject } from 'rxjs';

@Component({
  selector: 'wc-modal-delete-all-category',
  templateUrl: './modal-delete-all-category.component.html',
  styleUrls: ['./modal-delete-all-category.component.scss']
})
export class ModalDeleteAllCategoryComponent implements OnInit {

  @Input() initialState: any;
  @Input() categoryType: 'website' | 'video' = 'website'; // Type of category to determine refresh strategy
  categoryForm!: FormGroup;
  private notyf: Notyf
  onClose!: Subject<boolean>;

  constructor(
    private modalSvc: BsModalService,
    private dasboardSvc: DashboardService,
    private websiteCategoryService: WebsiteCategoryService,
    private videoCategoryService: VideoCategoryService,
    private formSvc: FormBuilder
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit() {
    this.categoryForm = this.formSvc.group({
      confirm: ['', Validators.required],
    });
    this.onClose = new Subject();
  }

  closeModal() {
    this.modalSvc.hide();
  }

  onDeleteAllCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const confirmText = this.categoryForm.value.confirm;

    // Validate confirmation text
    if (confirmText.toLowerCase() !== 'yes') {
      this.notyf.error('Harap ketik "yes" untuk konfirmasi penghapusan');
      return;
    }

    const payload = {
      confirm: confirmText,
    };

    this.dasboardSvc.delete(DashboardServiceType.ADM_DELETE_ALL_CATEGORY, payload)
      .subscribe({
        next: (res) => {
          this.notyf.success(res?.message || 'Semua data berhasil dihapus.');
          this.modalSvc.hide();

          // After delete all, refresh the appropriate service data
          if (this.categoryType === 'website') {
            this.websiteCategoryService.refreshCategories();
          } else if (this.categoryType === 'video') {
            this.videoCategoryService.refreshCategories();
          }

          this.onClose.next(true);
        },
        error: (error) => {
          console.error('Error deleting all categories:', error);
          this.notyf.error('Terjadi kesalahan saat menghapus semua kategori');
        }
      });
  }
}
