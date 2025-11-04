// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000/api',
  midtrans: {
    clientKey: 'SB-Mid-client-NjshfjUODw5Zt75',
    snapUrl: 'https://app.sandbox.midtrans.com/snap/snap.js',
    testMode: false,      // Disable simulation - use real Midtrans sandbox
    autoSuccess: false,   // Disable auto-success
    testPaymentDelay: 0,
    paymentStatusPollInterval: 3000,      // Poll every 3 seconds
    paymentStatusMaxAttempts: 20,         // Max 20 attempts (60 seconds total)
    paymentSuccessRedirectDelay: 2500     // Redirect to dashboard after 2.5 seconds
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
