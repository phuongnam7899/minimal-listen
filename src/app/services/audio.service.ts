import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Song {
  id: number;
  title: string;
  filename: string;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private songs: Song[] = [
    { id: 1, title: 'Anh Den Pho', filename: 'anh_den_pho.mp3' },
  ];

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public isPlaying$: Observable<boolean> = this.isPlayingSubject.asObservable();
  public currentSong$: Observable<Song | null> =
    this.currentSongSubject.asObservable();
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor() {
    this.loadRandomSong();
  }

  private loadRandomSong(): void {
    const randomIndex = Math.floor(Math.random() * this.songs.length);
    const selectedSong = this.songs[randomIndex];
    this.currentSongSubject.next(selectedSong);

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.audio = new Audio();
    this.audio.src = `assets/music/${selectedSong.filename}`;
    this.audio.preload = 'auto';

    this.audio.addEventListener('loadstart', () => {
      this.isLoadingSubject.next(true);
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.isLoadingSubject.next(false);
      // Auto-play the song when it's ready
      this.play();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
      // Load and play next random song when current song ends
      this.loadRandomSong();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      this.isLoadingSubject.next(false);
      this.isPlayingSubject.next(false);
    });
  }

  public play(): void {
    if (this.audio && !this.isLoadingSubject.value) {
      this.audio
        .play()
        .then(() => {
          this.isPlayingSubject.next(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          this.isPlayingSubject.next(false);
        });
    }
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlayingSubject.next(false);
    }
  }

  public togglePlayPause(): void {
    if (this.isPlayingSubject.value) {
      this.pause();
    } else {
      this.play();
    }
  }

  public loadNewRandomSong(): void {
    this.loadRandomSong();
  }
}
