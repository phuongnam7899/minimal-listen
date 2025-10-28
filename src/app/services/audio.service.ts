import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
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
  private songs: Song[] = (environment as any).songs || [
    { id: 1, title: 'Anh Den Pho', filename: 'anh_den_pho.mp3' },
  ];

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public isPlaying$: Observable<boolean> = this.isPlayingSubject.asObservable();
  public currentSong$: Observable<Song | null> =
    this.currentSongSubject.asObservable();
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor() {
    console.log('🎵 AudioService: Initializing music player...');
    console.log(`📱 Device: ${navigator.userAgent}`);
    console.log(`🔊 Audio support: ${typeof Audio !== 'undefined'}`);
    console.log(`💾 Cache API: ${typeof caches !== 'undefined'}`);
    console.log(`🎶 Available songs: ${this.songs.length}`);

    // Detect PWA mode
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    console.log(`📱 PWA Mode: ${isPWA}`);
    console.log(`🌐 Window location: ${window.location.href}`);
    console.log(`🏠 Base href: ${document.baseURI}`);

    this.loadRandomSong();
    this.preloadAllSongs();
  }

  private async preloadAllSongs(): Promise<void> {
    console.log('Preloading songs for offline use...');

    // Detect iPhone (smaller memory constraints)
    const isIPhone = /iPhone/.test(navigator.userAgent);

    // Use browser cache API if available
    if ('caches' in window) {
      try {
        const cache = await caches.open('music-cache-v1');
        const basePath = (environment as any).audioBasePath || 'assets/music';
        const songUrls = this.songs.map(
          (song) => `${basePath}/${song.filename}`
        );

        if (isIPhone) {
          console.log(
            'iPhone detected - using careful sequential caching to avoid memory issues'
          );
          console.log(
            `📥 iPhone: Starting download of ${songUrls.length} songs`
          );

          // Cache songs one by one with delays to avoid memory pressure
          for (let i = 0; i < songUrls.length; i++) {
            try {
              console.log(
                `📥 iPhone: Downloading ${i + 1}/${songUrls.length}: ${
                  songUrls[i]
                }`
              );
              const startTime = performance.now();

              await cache.add(songUrls[i]);

              const endTime = performance.now();
              const downloadTime = Math.round(endTime - startTime);
              console.log(
                `✅ iPhone: Downloaded & cached ${i + 1}/${songUrls.length}: ${
                  songUrls[i]
                } (${downloadTime}ms)`
              );

              // Verify the cache entry exists
              const cachedResponse = await cache.match(songUrls[i]);
              if (cachedResponse) {
                const contentLength =
                  cachedResponse.headers.get('content-length');
                console.log(
                  `💾 iPhone: Cache verified for ${songUrls[i]} (${
                    contentLength || 'unknown'
                  } bytes)`
                );
              } else {
                console.warn(
                  `⚠️ iPhone: Cache verification failed for ${songUrls[i]}`
                );
              }

              // Small delay between caches to be gentle on iPhone memory
              if (i < songUrls.length - 1) {
                console.log(`⏱️ iPhone: Waiting 500ms before next download...`);
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error(
                `❌ iPhone: Failed to download/cache ${songUrls[i]}:`,
                error
              );
              // Continue with other songs even if one fails
            }
          }
          console.log('🎵 iPhone: All songs download & cache process complete');
        } else {
          // Normal caching for other devices
          for (const url of songUrls) {
            try {
              await cache.add(url);
              console.log(`Cached: ${url}`);
            } catch (error) {
              console.warn(`Failed to cache: ${url}`, error);
            }
          }
          console.log('All songs cached for offline use');
        }
      } catch (error) {
        console.warn('Cache API not available or failed:', error);
        if (isIPhone) {
          console.log('iPhone: Falling back to single song preload');
          this.preloadCurrentSongOnly();
        }
      }
    } else {
      console.log('Cache API not supported');
      if (isIPhone) {
        console.log('iPhone: Using single song preload as fallback');
        this.preloadCurrentSongOnly();
      }
    }
  }

  private preloadCurrentSongOnly(): void {
    const currentSong = this.currentSongSubject.value;
    if (currentSong) {
      console.log(
        `iPhone: Preloading current song only: ${currentSong.filename}`
      );
      // Create a hidden audio element to preload current song
      const preloadAudio = new Audio();
      const basePath = (environment as any).audioBasePath || 'assets/music';
      preloadAudio.src = `${basePath}/${currentSong.filename}`;
      preloadAudio.preload = 'metadata';
      preloadAudio.addEventListener('canplaythrough', () => {
        console.log(`iPhone: ${currentSong.filename} ready`);
      });
      preloadAudio.addEventListener('error', (e) => {
        console.warn(`iPhone: Failed to preload ${currentSong.filename}`, e);
      });
    }
  }

  private loadRandomSong(autoPlay: boolean = false): void {
    const randomIndex = Math.floor(Math.random() * this.songs.length);
    const selectedSong = this.songs[randomIndex];
    console.log(
      `🎲 Loading random song: ${selectedSong.filename} (${randomIndex + 1}/${
        this.songs.length
      })`
    );

    this.currentSongSubject.next(selectedSong);
    this.errorSubject.next(null);

    if (this.audio) {
      console.log('🗑️ Cleaning up previous audio element');
      this.audio.pause();
      this.audio = null;
    }

    console.log(`🎧 Creating new audio element for: ${selectedSong.filename}`);
    this.audio = new Audio();

    // iPhone and PWA optimizations
    const isIPhone = /iPhone/.test(navigator.userAgent);
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Build base path from environment
    const basePath = (environment as any).audioBasePath || 'assets/music';
    const url = `${basePath}/${selectedSong.filename}`;
    // Use absolute URL in PWA to avoid base href issues
    this.audio.src = isPWA ? `${window.location.origin}/${url}` : url;
    console.log(`🎼 Audio src set to: ${this.audio.src}`);

    // Cross-Origin settings for PWA
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = isIPhone ? 'metadata' : 'auto';

    console.log(
      `🔧 Audio element configured: src=${this.audio.src}, preload=${this.audio.preload}, crossOrigin=${this.audio.crossOrigin}`
    );

    if (isIPhone) {
      console.log('iPhone: Using metadata preload for faster loading');
    }

    this.audio.addEventListener('loadstart', () => {
      this.isLoadingSubject.next(true);
      console.log(`📡 LOADSTART: Started loading ${selectedSong.filename}`);
      console.log(
        `📊 Network state: ${this.audio?.networkState}, Ready state: ${this.audio?.readyState}`
      );
    });

    this.audio.addEventListener('progress', () => {
      if (this.audio && this.audio.buffered.length > 0 && this.audio.duration) {
        const buffered = Math.round(
          (this.audio.buffered.end(0) / this.audio.duration) * 100
        );
        console.log(
          `📈 PROGRESS: ${selectedSong.filename} buffered ${buffered || 0}%`
        );
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      console.log(
        `📋 METADATA: Loaded for ${selectedSong.filename} - Duration: ${this.audio?.duration}s`
      );
      console.log(
        `📊 Network state: ${this.audio?.networkState}, Ready state: ${this.audio?.readyState}`
      );

      if (isIPhone && this.isLoadingSubject.value) {
        // For iPhone, metadata loaded is enough to consider it ready
        this.isLoadingSubject.next(false);
        console.log(`🍎 iPhone: Using metadata loaded as ready signal`);
      }
    });

    this.audio.addEventListener('loadeddata', () => {
      console.log(`💿 DATA: First frame loaded for ${selectedSong.filename}`);
      console.log(
        `📊 Network state: ${this.audio?.networkState}, Ready state: ${this.audio?.readyState}`
      );
    });

    this.audio.addEventListener('canplay', () => {
      console.log(`▶️ CANPLAY: ${selectedSong.filename} can start playing`);
      console.log(
        `📊 Network state: ${this.audio?.networkState}, Ready state: ${this.audio?.readyState}`
      );

      if (this.isLoadingSubject.value) {
        this.isLoadingSubject.next(false);
        console.log(`✅ Ready state set to false (canplay fallback)`);
      }
      // Auto-play if requested (e.g., after previous song ended)
      if (autoPlay) {
        this.play();
      }
    });

    // Multiple event listeners for better iPhone compatibility
    this.audio.addEventListener('canplaythrough', () => {
      console.log(
        `🚀 CANPLAYTHROUGH: ${selectedSong.filename} can play through completely`
      );
      console.log(
        `📊 Network state: ${this.audio?.networkState}, Ready state: ${this.audio?.readyState}`
      );

      this.isLoadingSubject.next(false);
      console.log(`✅ Ready state set to false (canplaythrough)`);
      // Fallback auto-play trigger as well
      if (autoPlay) {
        this.play();
      }
    });

    this.audio.addEventListener('suspend', () => {
      console.log(`⏸️ SUSPEND: Loading suspended for ${selectedSong.filename}`);
    });

    this.audio.addEventListener('abort', () => {
      console.log(`🛑 ABORT: Loading aborted for ${selectedSong.filename}`);
    });

    this.audio.addEventListener('stalled', () => {
      console.log(`🐌 STALLED: Loading stalled for ${selectedSong.filename}`);
    });

    this.audio.addEventListener('waiting', () => {
      console.log(`⏳ WAITING: Waiting for data for ${selectedSong.filename}`);
    });

    // Shorter timeout for iPhone since it's more likely to get stuck
    const timeoutDuration = isIPhone ? 3000 : 10000;
    setTimeout(() => {
      if (this.isLoadingSubject.value) {
        console.log(
          `${
            isIPhone ? 'iPhone' : 'Device'
          }: Loading timeout (${timeoutDuration}ms) reached, forcing ready state`
        );
        this.isLoadingSubject.next(false);
      }
    }, timeoutDuration);

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
      // Load and play next random song when current song ends
      this.loadRandomSong(true);
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      this.isLoadingSubject.next(false);
      this.isPlayingSubject.next(false);
    });

    // iPhone specific: Force load attempt after a delay
    if (isIPhone) {
      setTimeout(() => {
        try {
          if (this.audio && this.isLoadingSubject.value) {
            console.log('iPhone: Attempting to force audio load');
            this.audio.load(); // Force reload
            // If still loading after force reload, consider it ready
            setTimeout(() => {
              if (this.isLoadingSubject.value) {
                console.log('iPhone: Force loading complete');
                this.isLoadingSubject.next(false);
              }
            }, 1000);
          }
        } catch (error) {
          console.error('iPhone: Force load failed:', error);
          this.isLoadingSubject.next(false);
        }
      }, 2000);
    }
  }

  public async play(): Promise<void> {
    const currentSong = this.currentSongSubject.value;
    console.log(`🎵 PLAY: Attempting to play ${currentSong?.filename}`);
    console.log(
      `📊 Audio state: loading=${
        this.isLoadingSubject.value
      }, audio exists=${!!this.audio}`
    );

    if (this.audio && !this.isLoadingSubject.value) {
      // Check if audio is served from cache
      if ('caches' in window) {
        try {
          const cache = await caches.open('music-cache-v1');
          const cachedResponse = await cache.match(this.audio.src);
          console.log(
            `💾 Cache check: ${cachedResponse ? 'HIT' : 'MISS'} for ${
              this.audio.src
            }`
          );
        } catch (error) {
          console.warn('Cache check failed:', error);
        }
      }

      console.log(`🎮 Calling audio.play() for ${currentSong?.filename}`);
      console.log(
        `📊 Before play - Network: ${this.audio.networkState}, Ready: ${this.audio.readyState}, Current time: ${this.audio.currentTime}`
      );

      this.audio
        .play()
        .then(() => {
          console.log(
            `✅ PLAY SUCCESS: ${currentSong?.filename} started successfully`
          );
          console.log(
            `📊 After play - Network: ${this.audio?.networkState}, Ready: ${this.audio?.readyState}, Paused: ${this.audio?.paused}`
          );
          this.isPlayingSubject.next(true);
          this.errorSubject.next(null);
        })
        .catch((error) => {
          console.error(
            `❌ PLAY ERROR: Failed to play ${currentSong?.filename}:`,
            error
          );
          console.log(
            `📊 Error state - Network: ${this.audio?.networkState}, Ready: ${this.audio?.readyState}`
          );
          this.isPlayingSubject.next(false);

          const isPWA =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

          if (error.name === 'NotAllowedError') {
            this.errorSubject.next(
              'Audio playback requires user interaction. Click the play button to start.'
            );
            console.log(
              '🔒 Audio play blocked by browser policy - user interaction required'
            );
          } else if (error.name === 'NotSupportedError' && isPWA) {
            console.log(
              '🚨 PWA: NotSupportedError detected - attempting audio reload fix'
            );
            this.errorSubject.next(
              'PWA audio error detected. Trying to reload...'
            );
            // Try to reload the audio with a slight delay
            setTimeout(() => {
              this.reloadAudioForPWA();
            }, 1000);
          } else {
            this.errorSubject.next(
              'Error playing audio. Please check if the audio file is valid.'
            );
          }
        });
    } else if (this.isLoadingSubject.value) {
      console.log(
        `⏳ PLAY BLOCKED: ${currentSong?.filename} still loading, please wait...`
      );
    } else {
      console.log(`🚫 PLAY BLOCKED: No audio loaded`);
    }
  }

  public pause(): void {
    const currentSong = this.currentSongSubject.value;
    console.log(`⏸️ PAUSE: Pausing ${currentSong?.filename}`);

    if (this.audio) {
      this.audio.pause();
      this.isPlayingSubject.next(false);
      console.log(
        `✅ PAUSE SUCCESS: ${currentSong?.filename} paused at ${this.audio.currentTime}s`
      );
    } else {
      console.log(`🚫 PAUSE BLOCKED: No audio element to pause`);
    }
  }

  public togglePlayPause(): void {
    const currentSong = this.currentSongSubject.value;
    const isPlaying = this.isPlayingSubject.value;
    console.log(
      `🔄 TOGGLE: Currently playing: ${isPlaying}, Song: ${currentSong?.filename}`
    );

    if (isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public loadNewRandomSong(): void {
    this.loadRandomSong();
  }

  public forceReload(): void {
    console.log('AudioService: Force reload requested');
    this.isLoadingSubject.next(false);
    // Force reload current song
    const currentSong = this.currentSongSubject.value;
    if (currentSong) {
      console.log('AudioService: Reloading current song');
      this.loadRandomSong();
    }
  }

  private reloadAudioForPWA(): void {
    console.log('🔄 PWA: Attempting to fix NotSupportedError');
    const currentSong = this.currentSongSubject.value;

    if (this.audio && currentSong) {
      // Try different approaches for PWA
      console.log('🔧 PWA: Recreating audio element with different settings');

      // Clean up current audio
      this.audio.pause();
      this.audio = null;

      // Create new audio with different settings
      this.audio = new Audio();
      this.audio.crossOrigin = null; // Remove crossOrigin
      this.audio.preload = 'none'; // Minimal preload for PWA

      // Try relative path first in PWA
      const basePath = (environment as any).audioBasePath || 'assets/music';
      this.audio.src = `./${basePath}/${currentSong.filename}`;
      console.log(`🔧 PWA: Using relative path: ${this.audio.src}`);

      // Add minimal event listeners
      this.audio.addEventListener('canplay', () => {
        console.log('🎵 PWA: Audio ready after reload fix');
        this.isLoadingSubject.next(false);
        this.errorSubject.next(null);
      });

      this.audio.addEventListener('error', (e) => {
        console.error('🚨 PWA: Audio still failing after reload:', e);
        // Try absolute URL as final fallback
        if (this.audio && !this.audio.src.includes('://')) {
          console.log('🔧 PWA: Trying absolute URL as final fallback');
          const basePath = (environment as any).audioBasePath || 'assets/music';
          this.audio.src = `${window.location.origin}/${basePath}/${currentSong.filename}`;
        }
      });

      // Force load
      this.audio.load();
    }
  }
}
