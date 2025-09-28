import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Notyf } from 'notyf';
import { DashboardService, DashboardServiceType } from 'src/app/dashboard.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PaymentConfirmComponent } from 'src/app/shared/payment-confirm/payment-confirm.component';

@Component({
  selector: 'wc-regis-pembayaran',
  templateUrl: './regis-pembayaran.component.html',
  styleUrls: ['./regis-pembayaran.component.scss']
})
export class RegisPembayaranComponent implements OnInit {

  @Input() formData: any;

  @Output() prev = new EventEmitter<void>();


  events: any = [];
  selectedMethod: any;
  bill: any;
  manualBill: any;
  private notyf: Notyf


  selectOptions: any = {
    payment: {
      items: [],
      defaultValue: [],
      FormControl: new FormControl(),
    }
  };
  userId: any;

  constructor(
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

  ngOnInit(): void {
    this.getMasterPayment()
    const allDataFromStepsStr = localStorage.getItem('formData');
    if (allDataFromStepsStr) {
      const allDataFromSteps = JSON.parse(allDataFromStepsStr);
      if (allDataFromSteps?.registrasi?.formData) {
        this.manualBill = allDataFromSteps.registrasi.formData.price;
      }
      const userId = allDataFromSteps?.registrasi?.response?.user?.id;
      this.userId = userId;
    }
  }

  getMasterPayment() {
    this.dashboardSvc.getParam(DashboardServiceType.MD_RGS_PAYMENT, '').subscribe((response) => {
      this.selectOptions.payment.items = response["data"];
    });
  }

  getMasterMethod() {
    this.dashboardSvc.getParam(DashboardServiceType.MNL_MD_METHOD, '').subscribe(res => {
      this.events = res?.data;
    })
  }

  getDetailMethod() {
    const query = `?id_methode_pembayaran=${this.selectedMethod}`
    this.dashboardSvc.getParam(DashboardServiceType.MNL_MD_METHOD_DETAIL, query).subscribe(res => {
      this.bill = res?.data;
    })
  }

  onMetodeSelect(event: any) {
    console.log(event);
    this.selectedMethod = event;
    this.getDetailMethod();
  }

  onBack() {
    this.prev.emit()
  }

  onNextClicked() {
    this.modalService.show(PaymentConfirmComponent, {
      initialState: {
        userId: this.userId
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notyf.success('Nomor rekening disalin!');
    }).catch(() => {
      this.notyf.error('Gagal menyalin.');
    });
  }

  copyTripayToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notyf.success('Kode Tripay disalin!');
    }).catch(() => {
      this.notyf.error('Gagal menyalin.');
    });
  }

  copyMidtrans(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.notyf.success('Kode Midtrans disalin!');
    }).catch(() => {
      this.notyf.error('Gagal menyalin.');
    });
  }
}
