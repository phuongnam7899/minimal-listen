import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private deferredPrompt: any;
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);

  public isOnline$ = this.isOnlineSubject.asObservable();
  public isInstallable$ = this.isInstallableSubject.asObservable();
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor() {
    console.log('🔧 PwaService: Initializing...');
    console.log(`📱 User Agent: ${navigator.userAgent}`);
    console.log(`🌐 Service Worker supported: ${'serviceWorker' in navigator}`);
    console.log(`💾 Cache API supported: ${typeof caches !== 'undefined'}`);
    console.log(`📲 Standalone mode: ${this.isStandalone()}`);

    this.setupOnlineStatusDetection();
    this.setupInstallPrompt();
    this.setupUpdateDetection();
    this.debugServiceWorkerStatus();
  }

  private setupOnlineStatusDetection(): void {
    // Monitor online/offline status
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe((isOnline) => {
      this.isOnlineSubject.next(isOnline);
      console.log('PWA Online status:', isOnline);
    });
  }

  private setupInstallPrompt(): void {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallableSubject.next(true);
    });

    // Listen for app installation
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA was installed');
      this.isInstallableSubject.next(false);
      this.deferredPrompt = null;
    });
  }

  private setupUpdateDetection(): void {
    // Detect iOS Safari
    const isIOSSafari = (): boolean => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isSafari =
        /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
      return isIOS && isSafari;
    };

    // For iOS Safari, use simpler detection
    if (isIOSSafari()) {
      console.log('iOS Safari detected - using simple update detection');
      // Check for updates periodically for iOS
      setInterval(() => {
        this.checkForUpdatesIOS();
      }, 60000); // Check every minute
      return;
    }

    // Check if service worker is supported (non-iOS or iOS Chrome)
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated');
        this.updateAvailableSubject.next(true);
      });

      // Check for updates on page load
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          console.log('Service worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('New version available');
                this.updateAvailableSubject.next(true);
              }
            });
          }
        });
      });
    }
  }

  private async checkForUpdatesIOS(): Promise<void> {
    try {
      // Simple version check for iOS - check if main.js has changed
      const response = await fetch('/index.html', { cache: 'no-cache' });
      const text = await response.text();
      const currentVersion = text.match(/main-(\w+)\.js/)?.[1];

      const storedVersion = localStorage.getItem('app-version');
      if (storedVersion && currentVersion && storedVersion !== currentVersion) {
        console.log('iOS: New version detected');
        this.updateAvailableSubject.next(true);
      }

      if (currentVersion) {
        localStorage.setItem('app-version', currentVersion);
      }
    } catch (error) {
      console.error('iOS update check failed:', error);
    }
  }

  public async installPwa(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
        this.isInstallableSubject.next(false);
        return true;
      } else {
        console.log('User dismissed PWA install');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  public isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  public async checkForUpdates(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        console.log('Update check completed');
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }

  public async applyUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        // Reload the page to apply the update
        window.location.reload();
      } catch (error) {
        console.error('Error applying update:', error);
      }
    }
  }

  private async debugServiceWorkerStatus(): Promise<void> {
    console.log('🔍 PWA: Debugging Service Worker status...');

    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ PWA: Service Worker not supported');
      return;
    }

    try {
      // Check registration status
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.warn('⚠️ PWA: No Service Worker registered yet');

        // Wait for registration and check again
        setTimeout(async () => {
          const newReg = await navigator.serviceWorker.getRegistration();
          if (newReg) {
            console.log('✅ PWA: Service Worker registered after delay');
            this.logServiceWorkerDetails(newReg);
          } else {
            console.error('🚨 PWA: Service Worker failed to register');
          }
        }, 5000);
        return;
      }

      console.log('✅ PWA: Service Worker is registered');
      this.logServiceWorkerDetails(registration);

      // Test cache API
      await this.testCacheAPI();

      // Test offline navigation
      await this.testOfflineNavigation();
    } catch (error) {
      console.error('🚨 PWA: Error debugging Service Worker:', error);
    }
  }

  private logServiceWorkerDetails(
    registration: ServiceWorkerRegistration
  ): void {
    console.log('📋 PWA: Service Worker Details:');
    console.log(`  - Active: ${!!registration.active}`);
    console.log(`  - Installing: ${!!registration.installing}`);
    console.log(`  - Waiting: ${!!registration.waiting}`);
    console.log(`  - Scope: ${registration.scope}`);
    console.log(`  - Update via cache: ${registration.updateViaCache}`);

    if (registration.active) {
      console.log(`  - State: ${registration.active.state}`);
      console.log(`  - Script URL: ${registration.active.scriptURL}`);
    }
  }

  private async testCacheAPI(): Promise<void> {
    console.log('🧪 PWA: Testing Cache API...');

    try {
      const cacheNames = await caches.keys();
      console.log(`💾 PWA: Available caches: ${cacheNames.length}`);
      cacheNames.forEach((name) => console.log(`  - ${name}`));

      // Test if we can access the main cache
      const mainCache = await caches.open('ngsw:db:Angular Music PWA:1');
      const cachedRequests = await mainCache.keys();
      console.log(
        `📦 PWA: Cached requests in main cache: ${cachedRequests.length}`
      );

      // Check if index.html is cached
      const indexResponse = await mainCache.match('/index.html');
      console.log(`🏠 PWA: index.html cached: ${!!indexResponse}`);

      // Check if music files are cached
      const musicResponse = await mainCache.match(
        '/assets/music/anh_den_pho.mp3'
      );
      console.log(`🎵 PWA: Music file cached: ${!!musicResponse}`);
    } catch (error) {
      console.error('🚨 PWA: Cache API test failed:', error);
    }
  }

  private async testOfflineNavigation(): Promise<void> {
    console.log('🧪 PWA: Testing offline navigation...');

    try {
      // Simulate offline request to test service worker
      const controller = navigator.serviceWorker.controller;
      if (controller) {
        console.log('✅ PWA: Service Worker is controlling this page');

        // Test if we can fetch the main page offline
        const response = await fetch('/listen', {
          cache: 'no-cache',
          headers: { 'X-Test-Offline': 'true' },
        });
        console.log(
          `🌐 PWA: Navigation test response: ${response.status} ${response.statusText}`
        );
      } else {
        console.warn('⚠️ PWA: No Service Worker controlling this page');
      }
    } catch (error) {
      console.error('🚨 PWA: Offline navigation test failed:', error);
    }
  }
}
