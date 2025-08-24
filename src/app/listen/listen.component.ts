import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, Song } from '../services/audio.service';
import { PwaService } from '../services/pwa.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listen.component.html',
  styleUrls: ['./listen.component.scss'],
})
export class ListenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isPlaying$: Observable<boolean>;
  currentSong$: Observable<Song | null>;
  isLoading$: Observable<boolean>;

  constructor(
    private audioService: AudioService,
    private pwaService: PwaService // Keep for offline functionality
  ) {
    this.isPlaying$ = this.audioService.isPlaying$;
    this.currentSong$ = this.audioService.currentSong$;
    this.isLoading$ = this.audioService.isLoading$;
  }

  ngOnInit(): void {
    // PWA service runs in background for offline functionality

    // Debug: Log current states
    this.isPlaying$.pipe(takeUntil(this.destroy$)).subscribe((playing) => {
      console.log('Component: isPlaying changed to:', playing);
    });

    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      console.log('Component: isLoading changed to:', loading);
    });

    this.currentSong$.pipe(takeUntil(this.destroy$)).subscribe((song) => {
      console.log('Component: currentSong changed to:', song);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTogglePlayPause(): void {
    console.log('Component: Play/pause button clicked');
    this.audioService.togglePlayPause();
  }
}
