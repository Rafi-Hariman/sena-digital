import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DashboardService, DashboardServiceType } from '../../../dashboard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import { Subject } from 'rxjs';

@Component({
  selector: 'wc-modal-add-category-admin',
  templateUrl: './modal-add-category-admin.component.html',
  styleUrls: ['./modal-add-category-admin.component.scss']
})
export class ModalAddCategoryAdminComponent implements OnInit {

  @Input() initialState: any;
  categoryForm!: FormGroup;
  private notyf: Notyf
  onClose!: Subject<boolean>;

  constructor(
    private modalSvc: BsModalService,
    private dasboardSvc: DashboardService,
    private formSvc: FormBuilder
  ) {
    this.notyf = new Notyf({
      duration: 1000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit() {
    this.categoryForm = this.formSvc.group({
      name: ['', Validators.required],
      slug: ['', Validators.required]
    });
    this.onClose = new Subject();

  }

  closeModal() {
    this.modalSvc.hide();
  }

  onAddCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.categoryForm.value.name,
      slug: this.categoryForm.value.slug
    };

    this.dasboardSvc.create(DashboardServiceType.ADM_ADD_CATEGORY, payload)
      .subscribe({
        next: (res) => {
          this.notyf.success(res?.message || 'Data berhasil disimpan.');
          this.modalSvc.hide();
          this.onClose.next(true);
        },
      });
  }
}
