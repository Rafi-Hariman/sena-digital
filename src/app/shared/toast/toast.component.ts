import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastMessage, ToastService } from 'src/app/toast.service';


@Component({
  selector: 'wc-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toastMessage: ToastMessage | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(message => {
      this.toastMessage = message;
    });
  }
  
}
