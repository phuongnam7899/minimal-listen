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
  currentTime$: Observable<number>;
  duration$: Observable<number>;

  // 🐛 DEBUG MODE - Set to false to hide debug console
  showDebugConsole = true;

  // Force load button for iPhone
  showForceLoadButton = false;
  private isCurrentlyLoading = false;

  // Sleep / stop timer state (in seconds)
  private readonly stopTimerStepSeconds = 30 * 60; // 30 minutes
  stopTimerRemainingSeconds = this.stopTimerStepSeconds;
  private stopTimerIntervalId: number | null = null;

  constructor(
    private audioService: AudioService,
    private pwaService: PwaService // Keep for offline functionality
  ) {
    this.isPlaying$ = this.audioService.isPlaying$;
    this.currentSong$ = this.audioService.currentSong$;
    this.isLoading$ = this.audioService.isLoading$;
    this.updateAvailable$ = this.pwaService.updateAvailable$;
    this.currentTime$ = this.audioService.currentTime$;
    this.duration$ = this.audioService.duration$;

    this.isPlaying$.pipe(takeUntil(this.destroy$)).subscribe((playing) => {
      console.log('Component: isPlaying changed to:', playing);
      this.startStopTimerIfNeeded(playing);
    });
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
    this.clearStopTimerInterval();
    this.destroy$.next();
    this.destroy$.complete();
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

  // ---- Sleep / stop timer API ----

  onIncreaseStopTimer(): void {
    // Increase remaining time by 30 minutes
    this.stopTimerRemainingSeconds += this.stopTimerStepSeconds;
  }

  onDecreaseStopTimer(): void {
    if (this.stopTimerRemainingSeconds <= 0) {
      this.stopTimerRemainingSeconds = 0;
      return;
    }

    this.stopTimerRemainingSeconds -= this.stopTimerStepSeconds;

    if (this.stopTimerRemainingSeconds <= 0) {
      this.stopTimerRemainingSeconds = 0;
      // If timer hits zero while playing, stop audio immediately
      this.handleStopTimerReachedZero();
    }
  }

  onTogglePlayPause(): void {
    console.log('Component: Play/pause button clicked');
    this.audioService.togglePlayPause();

    // We rely on isPlaying$ subscription to start/stop the timer,
    // so no direct timer manipulation is needed here.
  }

  private startStopTimerIfNeeded(isPlaying: boolean): void {
    if (!isPlaying) {
      this.clearStopTimerInterval();
      return;
    }

    if (this.stopTimerRemainingSeconds <= 0) {
      // Nothing to count down to
      this.clearStopTimerInterval();
      return;
    }

    // Avoid multiple intervals
    this.clearStopTimerInterval();

    this.stopTimerIntervalId = window.setInterval(() => {
      if (this.stopTimerRemainingSeconds <= 0) {
        this.stopTimerRemainingSeconds = 0;
        this.handleStopTimerReachedZero();
        return;
      }

      this.stopTimerRemainingSeconds -= 1;

      if (this.stopTimerRemainingSeconds <= 0) {
        this.stopTimerRemainingSeconds = 0;
        this.handleStopTimerReachedZero();
      }
    }, 1000);
  }

  private clearStopTimerInterval(): void {
    if (this.stopTimerIntervalId != null) {
      window.clearInterval(this.stopTimerIntervalId);
      this.stopTimerIntervalId = null;
    }
  }

  private handleStopTimerReachedZero(): void {
    this.clearStopTimerInterval();
    console.log('Sleep timer reached zero, stopping audio');
    // Stop playback via audio service
    this.audioService.togglePlayPause();
  }

  formatTime(seconds: number | null | undefined): string {
    if (!seconds || !Number.isFinite(seconds) || seconds < 0) {
      return '00:00';
    }

    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;

    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');

    return `${minutesStr}:${secondsStr}`;
  }
}
