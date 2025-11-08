import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { BehaviorSubject, fromEvent, merge, of, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private swUpdate = inject(SwUpdate);
  private deferredPrompt: any;
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  private updateCheckInterval: any;

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
    this.setupPeriodicUpdateChecks();
    this.setupVisibilityUpdateChecks();
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
    // Check if SwUpdate is enabled (only in production)
    if (!this.swUpdate.isEnabled) {
      console.log('⚠️ PWA: SwUpdate is not enabled (likely in dev mode)');
      // Fallback to manual detection for dev mode or unsupported browsers
      this.setupManualUpdateDetection();
      return;
    }

    console.log('✅ PWA: Using Angular SwUpdate for update detection');

    // Listen for version ready events (when a new version is available)
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe((evt) => {
        console.log('🆕 PWA: New version available:', evt.latestVersion);
        this.updateAvailableSubject.next(true);
      });

    // Listen for version installation failures
    this.swUpdate.versionUpdates
      .pipe(filter((evt) => evt.type === 'VERSION_INSTALLATION_FAILED'))
      .subscribe((evt) => {
        console.error('❌ PWA: Version installation failed:', evt);
      });

    // Check for updates immediately on initialization
    this.checkForUpdates();
  }

  private setupManualUpdateDetection(): void {
    // Fallback for browsers/dev mode where SwUpdate is not available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated (manual detection)');
        this.updateAvailableSubject.next(true);
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          console.log('Service worker update found (manual detection)');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('New version available (manual detection)');
                this.updateAvailableSubject.next(true);
              }
            });
          }
        });
      });
    }
  }

  private setupPeriodicUpdateChecks(): void {
    // Check for updates every 6 hours (21600000 ms)
    // This ensures updates are detected even if the user keeps the app open
    this.updateCheckInterval = setInterval(() => {
      console.log('🔄 PWA: Periodic update check');
      this.checkForUpdates();
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Also check every 5 minutes when app is active (more frequent but less resource intensive)
    interval(5 * 60 * 1000).subscribe(() => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  private setupVisibilityUpdateChecks(): void {
    // Check for updates when the app becomes visible (user switches back to the tab/app)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👁️ PWA: App became visible, checking for updates');
        this.checkForUpdates();
      }
    });

    // Check for updates when the window gains focus
    window.addEventListener('focus', () => {
      console.log('🎯 PWA: Window gained focus, checking for updates');
      this.checkForUpdates();
    });
  }

  // Cleanup method to clear intervals
  public ngOnDestroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
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
    if (this.swUpdate.isEnabled) {
      try {
        const updateAvailable = await this.swUpdate.checkForUpdate();
        if (updateAvailable) {
          console.log('✅ PWA: Update check found new version');
        } else {
          console.log('ℹ️ PWA: Update check - no new version available');
        }
      } catch (error) {
        console.error('❌ PWA: Error checking for updates:', error);
        // Fallback to manual check
        this.checkForUpdatesManual();
      }
    } else {
      // Fallback for browsers/dev mode
      this.checkForUpdatesManual();
    }
  }

  private async checkForUpdatesManual(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('✅ PWA: Manual update check completed');
        }
      } catch (error) {
        console.error('❌ PWA: Error in manual update check:', error);
      }
    }
  }

  public async applyUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        // Activate the update
        await this.swUpdate.activateUpdate();
        console.log('✅ PWA: Update activated, reloading...');
        // Reload the page to apply the update
        window.location.reload();
      } catch (error) {
        console.error('❌ PWA: Error applying update:', error);
        // Fallback: try manual reload
        window.location.reload();
      }
    } else {
      // Fallback for browsers/dev mode
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration.waiting) {
            // Tell the waiting service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          // Reload the page
          window.location.reload();
        } catch (error) {
          console.error('❌ PWA: Error applying update (manual):', error);
          window.location.reload();
        }
      } else {
        window.location.reload();
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
