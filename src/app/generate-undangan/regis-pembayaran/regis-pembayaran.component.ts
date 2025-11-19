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
  showInvoice = false;
  invoiceData: any = null;


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
    this.getMasterPayment();

    // Get data from formData (passed from parent component)
    if (this.formData) {
      // Get userId from registrasi response
      this.userId = this.formData?.response?.user?.id;

      // Get price from registrasi formData
      if (this.formData?.formData?.price) {
        this.manualBill = this.formData.formData.price;
      }
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

    if (event === 3 || event === '3') {
      this.showInvoice = true;
    } else {
      this.showInvoice = false;
      this.getDetailMethod();
    }
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
