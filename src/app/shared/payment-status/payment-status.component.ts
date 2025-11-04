import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { DashboardService, DashboardServiceType } from '../../dashboard.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss']
})
export class PaymentStatusComponent implements OnInit, OnDestroy {
  orderId: string | null = null;
  status: string | null = null;
  isChecking = true;
  progress = 0;
  redirectCountdown = 0;
  isRedirecting = false;

  private subscriptions = new Subscription();
  private maxAttempts: number;
  private currentAttempt = 0;
  private pollInterval: number;
  private redirectDelay: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) {
    this.maxAttempts = environment.midtrans?.paymentStatusMaxAttempts || 20;
    this.pollInterval = environment.midtrans?.paymentStatusPollInterval || 3000;
    this.redirectDelay = environment.midtrans?.paymentSuccessRedirectDelay || 2500;
  }

  ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('order_id');
    this.pollPaymentStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  pollPaymentStatus(): void {
    this.isChecking = true;
    this.currentAttempt = 0;
    this.progress = 0;

    const sub = interval(this.pollInterval)
      .pipe(
        take(this.maxAttempts),
        switchMap(() => {
          this.currentAttempt++;
          this.progress = Math.min((this.currentAttempt / this.maxAttempts) * 100, 100);
          return this.dashboardService.list(DashboardServiceType.USER_PROFILE, '');
        })
      )
      .subscribe({
        next: (response: any) => {
          const paymentStatus = response.data?.invitation?.payment_status;

          if (paymentStatus === 'paid') {
            this.status = 'paid';
            this.isChecking = false;
            this.progress = 100;
            this.subscriptions.unsubscribe();
            this.startRedirectCountdown();
          } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
            this.status = 'failed';
            this.isChecking = false;
            this.subscriptions.unsubscribe();
          } else if (this.currentAttempt >= this.maxAttempts) {
            this.status = paymentStatus || 'pending';
            this.isChecking = false;
            this.progress = 100;
          }
        },
        error: (error) => {
          console.error('Failed to check payment status:', error);
          this.isChecking = false;
          this.status = 'error';
          this.progress = 100;
        }
      });

    this.subscriptions.add(sub);
  }

  private startRedirectCountdown(): void {
    this.isRedirecting = true;
    this.redirectCountdown = Math.ceil(this.redirectDelay / 1000);

    const countdownSub = interval(1000)
      .pipe(take(this.redirectCountdown))
      .subscribe({
        next: () => {
          this.redirectCountdown--;
          if (this.redirectCountdown <= 0) {
            this.redirectToDashboard();
          }
        }
      });

    this.subscriptions.add(countdownSub);

    const redirectSub = timer(this.redirectDelay).subscribe(() => {
      this.redirectToDashboard();
    });

    this.subscriptions.add(redirectSub);
  }

  private redirectToDashboard(): void {
    this.router.navigate(['/dashboard/overview']);
  }

  checkAgain(): void {
    this.currentAttempt = 0;
    this.progress = 0;
    this.pollPaymentStatus();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard/overview']);
  }

  retry(): void {
    this.router.navigate(['/generate-undangan']);
  }

  cancelRedirect(): void {
    this.isRedirecting = false;
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }
}
