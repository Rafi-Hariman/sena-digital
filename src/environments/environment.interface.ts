export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  urlProduction?: string;
  midtrans?: {
    clientKey: string;
    snapUrl: string;
    testMode: boolean;
    autoSuccess: boolean;
    testPaymentDelay: number;
    paymentStatusPollInterval: number;
    paymentStatusMaxAttempts: number;
    paymentSuccessRedirectDelay: number;
  };
}
