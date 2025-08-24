import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, Song } from '../services/audio.service';
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

  constructor(private audioService: AudioService) {
    this.isPlaying$ = this.audioService.isPlaying$;
    this.currentSong$ = this.audioService.currentSong$;
    this.isLoading$ = this.audioService.isLoading$;
  }

  ngOnInit(): void {
    // Component initialization logic if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTogglePlayPause(): void {
    this.audioService.togglePlayPause();
  }
}
