import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Notyf } from 'notyf';
import { DashboardService, DashboardServiceType } from '../../dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SuccessConfirmPaymentComponent } from '../success-confirm-payment/success-confirm-payment.component';

@Component({
  selector: 'wc-payment-confirm',
  templateUrl: './payment-confirm.component.html',
  styleUrls: ['./payment-confirm.component.scss']
})
export class PaymentConfirmComponent implements OnInit {

  private notyf: Notyf;
  kodePayment: any;
  inputKodePayment: string = '';
  @Input() userId!: number;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dashboardSvc: DashboardService,
    private modalService: BsModalService,
  ) {
    this.notyf = new Notyf({
      duration: 1000,
      position: {
        x: 'right',
        y: 'top'
      }
    });
  }

  ngOnInit() {
    const allDataFromStepsStr = localStorage.getItem('formData');
    console.log('userId', this.userId);

    let kodePemesanan = '';

    if (allDataFromStepsStr) {
      const allDataFromSteps = JSON.parse(allDataFromStepsStr);

      const kodeFromForm = allDataFromSteps?.registrasi?.formData?.kode_pemesanan;
      const kodeFromUser = allDataFromSteps?.registrasi?.response.user?.kode_pemesanan;

      if (kodeFromForm) {
        kodePemesanan = kodeFromForm;
      } else if (kodeFromUser) {
        kodePemesanan = kodeFromUser;
      }

      this.kodePayment = kodePemesanan;
    }

    this.form = this.fb.group({
      user_id: [this.userId],
      kode_pemesanan: [this.kodePayment || '']
    });
  }


  copyMidtrans(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notyf.success('berhasil disalin!');
    }).catch(() => {
      this.notyf.error('Gagal menyalin.');
    });
  }

  onConfirm() {
    const payload = this.form.value;
    this.dashboardSvc.update(DashboardServiceType.RDM_CONFIRM_PAYMENT, '', payload).subscribe(res => {
      this.notyf.success('Berhasil konfirmasi pembayaran');
      this.modalService.hide();
      setTimeout(() => {
        this.modalService.show(SuccessConfirmPaymentComponent, {
          initialState: {
            message: 'Konfirmasi berhasil!'
          }
        });
      }, 300);
    });
  }

}
