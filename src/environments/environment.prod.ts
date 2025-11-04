import { Environment } from './environment.interface';

const API_BASE_URL = 'https://cloud-api.sena-digital.com/api';

export const environment: Environment = {
  production: true,
  apiBaseUrl: API_BASE_URL,
  urlProduction: 'https://cloud-api.sena-digital.com/api',
  midtrans: {
    clientKey: 'Mid-client-hl_8yo60vBjhoX32',
    snapUrl: 'https://app.midtrans.com/snap/snap.js',
    testMode: false,
    autoSuccess: false,
    testPaymentDelay: 0,
    paymentStatusPollInterval: 3000,      // Poll every 3 seconds
    paymentStatusMaxAttempts: 20,         // Max 20 attempts (60 seconds total)
    paymentSuccessRedirectDelay: 2500     // Redirect to dashboard after 2.5 seconds
  }
};
