import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'wc-success-confirm-payment',
  templateUrl: './success-confirm-payment.component.html',
  styleUrls: ['./success-confirm-payment.component.scss']
})
export class SuccessConfirmPaymentComponent implements OnInit {

  @Input() message: string = '';

  constructor(
    private routeSvc: Router,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    console.log('message', this.message);
  }


  onRedirectToDasboard() {
    this.routeSvc.navigate(['/dashboard']);
    this.modalService.hide();
  }

  onCancel() {
    this.modalService.hide();
  }

}
