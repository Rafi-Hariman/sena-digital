import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateSnapTokenRequest, SnapTokenResponse } from '../models/payment.model';

declare var snap: any;

@Injectable({
  providedIn: 'root'
})
export class MidtransService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create Snap Token for Midtrans Payment
   *
   * PUBLIC API - No authentication required
   * Uses user_id as query parameter instead of Bearer token
   *
   * @param userId - User ID to pass as query parameter
   * @param payload - Payment details (invitation_id, amount, customer_details)
   * @returns Observable<SnapTokenResponse> with snap_token and order_id
   *
   * API Endpoint: POST /api/midtrans/create-snap-token?user_id={userId}
   * See: PUBLIC_PAYMENT_API.md for full documentation
   */
  createSnapToken(userId: number, payload: CreateSnapTokenRequest): Observable<SnapTokenResponse> {
    const params = new HttpParams().set('user_id', userId.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('Creating snap token with user_id:', userId);

    return this.http.post<SnapTokenResponse>(
      `${this.apiUrl}/midtrans/create-snap-token`,
      payload,
      { params, headers }
    );
  }

  /**
   * Get Snap redirect URL for opening payment in new tab
   *
   * @param snapToken - The snap token received from createSnapToken
   * @returns Full URL to open Snap payment in new tab
   */
  getSnapRedirectUrl(snapToken: string): string {
    const baseUrl = environment.production
      ? 'https://app.midtrans.com/snap/v2/vtweb'
      : 'https://app.sandbox.midtrans.com/snap/v2/vtweb';
    return `${baseUrl}/${snapToken}`;
  }

  /**
   * Simulate test payment (auto-success) for development
   *
   * Used when environment.midtrans.testMode = true AND autoSuccess = true
   * Bypasses Snap modal and immediately triggers onSuccess callback
   *
   * @param callbacks - Payment callbacks (onSuccess, onPending, onError, onClose)
   */
  private simulateTestPayment(callbacks?: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }): void {
    console.log('🧪 TEST MODE: Simulating auto-success payment...');

    setTimeout(() => {
      const mockResult = {
        status_code: "200",
        status_message: "Success",
        transaction_id: `test-${Date.now()}`,
        order_id: `INV-test-${Date.now()}`,
        gross_amount: "199000.00",
        payment_type: "credit_card",
        transaction_time: new Date().toISOString(),
        transaction_status: "settlement",
        fraud_status: "accept"
      };

      console.log('✅ TEST: Payment auto-approved', mockResult);

      if (callbacks?.onSuccess) {
        callbacks.onSuccess(mockResult);
      }
    }, environment.midtrans?.testPaymentDelay || 2000);
  }

  /**
   * Open Midtrans Snap Payment Popup
   *
   * In test mode (when environment.midtrans.testMode = true AND autoSuccess = true),
   * this bypasses Snap modal and auto-approves the payment.
   *
   * @param snapToken - The snap token from createSnapToken API
   * @param callbacks - Callbacks for payment events
   */
  pay(
    snapToken: string,
    callbacks?: {
      onSuccess?: (result: any) => void;
      onPending?: (result: any) => void;
      onError?: (result: any) => void;
      onClose?: () => void;
    }
  ): void {
    // Check if test mode is enabled for auto-success
    if (environment.midtrans?.testMode && environment.midtrans?.autoSuccess) {
      console.log('🧪 Test mode enabled: Using simulated payment');
      this.simulateTestPayment(callbacks);
      return;
    }

    // Production mode: Use real Snap.js
    if (typeof snap === 'undefined') {
      console.error('Midtrans Snap.js not loaded! Check index.html');
      alert('Payment system is not ready. Please refresh the page.');
      return;
    }

    snap.pay(snapToken, {
      onSuccess: (result: any) => {
        console.log('Payment success:', result);
        if (callbacks?.onSuccess) callbacks.onSuccess(result);
      },
      onPending: (result: any) => {
        console.log('Payment pending:', result);
        if (callbacks?.onPending) callbacks.onPending(result);
      },
      onError: (result: any) => {
        console.error('Payment error:', result);
        if (callbacks?.onError) callbacks.onError(result);
      },
      onClose: () => {
        console.log('Payment popup closed');
        if (callbacks?.onClose) callbacks.onClose();
      }
    });
  }
}
