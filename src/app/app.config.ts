import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Detect iOS Safari (but allow iOS Chrome)
const isIOSSafari = (): boolean => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari =
    /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);

  // Only disable for iOS Safari, allow iOS Chrome
  return isIOS && isSafari;
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Disable service worker for iOS Safari to prevent loading issues
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !isIOSSafari(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
