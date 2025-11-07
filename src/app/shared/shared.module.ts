import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxSelectModule } from 'ngx-select-ex';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';

// Shared Components
import { ToastComponent } from './toast/toast.component';
import { TableComponent } from './table/table.component';
import { ModalComponent } from './modal/modal.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';
import { SuccessConfirmPaymentComponent } from './success-confirm-payment/success-confirm-payment.component';
import { ModalAddCategoryAdminComponent } from './modal/modal-add-category-admin/modal-add-category-admin.component';
import { ModalEditCategoryAdminComponent } from './modal/modal-edit-category-admin/modal-edit-category-admin.component';
import { ModalDeleteCategoryAdminComponent } from './modal/modal-delete-category-admin/modal-delete-category-admin.component';
import { ModalDeleteAllCategoryComponent } from './modal/modal-delete-all-category/modal-delete-all-category.component';
import { ModalAddVideoCategoryComponent } from './modal/modal-add-video-category/modal-add-video-category.component';
import { ModalAddWebsiteCategoryComponent } from './modal/modal-add-website-category/modal-add-website-category.component';
import { QRCodeModalComponent } from './modal/qr-code-modal/qr-code-modal.component';
import { InvoicePaymentComponent } from './invoice-payment/invoice-payment.component';
import { PaymentStatusComponent } from './payment-status/payment-status.component';

@NgModule({
  declarations: [
    ToastComponent,
    TableComponent,
    ModalComponent,
    PaymentConfirmComponent,
    SuccessConfirmPaymentComponent,
    ModalAddCategoryAdminComponent,
    ModalEditCategoryAdminComponent,
    ModalDeleteCategoryAdminComponent,
    ModalDeleteAllCategoryComponent,
    ModalAddVideoCategoryComponent,
    ModalAddWebsiteCategoryComponent,
    QRCodeModalComponent,
    InvoicePaymentComponent,
    PaymentStatusComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    NgxSelectModule,
    BsDatepickerModule,
    ModalModule,
  ],
  exports: [
    ToastComponent,
    TableComponent,
    ModalComponent,
    PaymentConfirmComponent,
    SuccessConfirmPaymentComponent,
    ModalAddCategoryAdminComponent,
    ModalEditCategoryAdminComponent,
    ModalDeleteCategoryAdminComponent,
    ModalDeleteAllCategoryComponent,
    ModalAddVideoCategoryComponent,
    ModalAddWebsiteCategoryComponent,
    QRCodeModalComponent,
    InvoicePaymentComponent,
    PaymentStatusComponent,
    // Re-export commonly used modules for convenience
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
