import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, Song } from '../services/audio.service';
import { PwaService } from '../services/pwa.service';
import { DebugConsoleComponent } from '../debug-console/debug-console.component';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listen',
  standalone: true,
  imports: [CommonModule, DebugConsoleComponent],
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss'],
})
export class ListenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isPlaying$: Observable<boolean>;
  currentSong$: Observable<Song | null>;
  isLoading$: Observable<boolean>;
  updateAvailable$: Observable<boolean>;

  // 🐛 DEBUG MODE - Set to false to hide debug console
  showDebugConsole = true;

  // Force load button for iPhone
  showForceLoadButton = false;
  private isCurrentlyLoading = false;

  constructor(
    private audioService: AudioService,
    private pwaService: PwaService // Keep for offline functionality
  ) {
    this.isPlaying$ = this.audioService.isPlaying$;
    this.currentSong$ = this.audioService.currentSong$;
    this.isLoading$ = this.audioService.isLoading$;
    this.updateAvailable$ = this.pwaService.updateAvailable$;
  }

  ngOnInit(): void {
    // PWA service runs in background for offline functionality

    // Debug: Log current states and device info
    const isIPhone = /iPhone/.test(navigator.userAgent);
    const isIPad = /iPad/.test(navigator.userAgent);
    console.log('Device info:', {
      isIPhone,
      isIPad,
      userAgent: navigator.userAgent,
    });

    this.isPlaying$.pipe(takeUntil(this.destroy$)).subscribe((playing) => {
      console.log('Component: isPlaying changed to:', playing);
    });

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      console.log('Component: isLoading changed to:', loading);
      this.isCurrentlyLoading = loading;

      if (isIPhone && loading) {
        console.log('iPhone: Loading state detected');
        // Show force load button after 4 seconds on iPhone
        setTimeout(() => {
          if (this.isCurrentlyLoading) {
            this.showForceLoadButton = true;
            console.log('iPhone: Showing force load button');
          }
        }, 4000);
      } else {
        this.showForceLoadButton = false;
      }
    });

    this.currentSong$.pipe(takeUntil(this.destroy$)).subscribe((song) => {
      console.log('Component: currentSong changed to:', song);
    });

    // Check for updates when component loads
    this.pwaService.checkForUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTogglePlayPause(): void {
    console.log('Component: Play/pause button clicked');
    this.audioService.togglePlayPause();
  }

  onApplyUpdate(): void {
    console.log('Component: Applying update');
    this.pwaService.applyUpdate();
  }

  onForceLoad(): void {
    console.log('Component: Force load button clicked');
    this.showForceLoadButton = false;
    // Create a dummy audio context to unlock audio on iPhone
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContext.resume().then(() => {
        console.log('iPhone: Audio context unlocked');
        // Force reload the audio service
        this.audioService.forceReload();
      });
    } catch (error) {
      console.error('iPhone: Failed to unlock audio context:', error);
      // Fallback: just force reload
      this.audioService.forceReload();
    }
  }
}
