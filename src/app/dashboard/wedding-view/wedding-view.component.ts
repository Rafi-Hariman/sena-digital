import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DashboardService, DashboardServiceType } from 'src/app/dashboard.service';
import { WeddingDataService, WeddingData } from '../../services/wedding-data.service';
import { QRCodeModalComponent } from '../../shared/modal/qr-code-modal/qr-code-modal.component';
import { SeoService } from '../../services/seo.service';

// Attendance interface for type safety
interface AttendanceRequest {
  user_id: number;
  nama: string;
  kehadiran: 'hadir' | 'tidak_hadir' | 'mungkin';
  pesan: string;
}

interface AttendanceResponse {
  message: string;
  data?: {
    id: number;
    user_id: number;
    nama: string;
    kehadiran: string;
    pesan: string;
    created_at: string;
  };
  errors?: any;
  error?: string;
}

// Settings response interface for domain extraction
interface SettingsResponse {
  message: string;
  setting: {
    id: number;
    user_id: number;
    domain: string;
    token: string | null;
    musik: string;
    salam_pembuka: string;
    salam_atas: string;
    salam_bawah: string;
    created_at: string;
    updated_at: string;
  };
  filter_undangan: any;
}

declare var bootstrap: any;
enum ContentView {
  MAIN = 'main',
  COUPLE = 'couple',
  MESSAGE = 'message',
  CALENDAR = 'calendar',
  BIRTHDAY = 'birthday',
  CHAT = 'chat',
  GALLERY = 'gallery',
  PROFILE = 'profile',
  GIFT = 'gift'
}

@Component({
  selector: 'wc-wedding-view',
  templateUrl: './wedding-view.component.html',
  styleUrls: ['./wedding-view.component.scss']
})
export class WeddingViewComponent implements OnInit, AfterViewInit, OnDestroy {

  ContentView = ContentView;

  isPlaying: boolean = false;
  isMuted: boolean = false;
  sideIconsVisible: boolean = false;
  invitationOpened: boolean = false;

  currentView: ContentView = ContentView.MAIN;

  // Wedding data properties
  weddingData: WeddingData | null = null;
  domain: string | null = null; // Changed from coupleName to domain
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Audio management properties
  private audioElement: HTMLAudioElement | null = null;
  private audioInitialized: boolean = false;
  private autoplayRequested: boolean = false;
  isAudioLoading: boolean = false;
  audioError: string | null = null;
  currentVolume: number = 0.7; // Default volume (70%)

  // Subscriptions
  private subscriptions = new Subscription();

  // QR Code Modal
  private qrModalRef?: BsModalRef;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private weddingDataService: WeddingDataService,
    private modalService: BsModalService,
    private seoService: SeoService
  ) { }

  ngOnInit() {
    this.injectRippleStyles();
    this.setSeoTags();
    this.initializeWeddingData();
    console.log(this.weddingData);

  }

  /**
   * Set SEO meta tags for wedding view page
   */
  private setSeoTags(): void {
    // Set generic wedding invitation meta tags
    this.seoService.setMetaTags({
      title: 'Undangan Pernikahan Digital - Sena Digital Wedding Invitation',
      description: 'Undangan pernikahan digital dengan desain elegan. Lihat detail acara, RSVP, kirim ucapan, dan berikan hadiah digital.',
      keywords: 'undangan pernikahan digital, undangan nikah, wedding invitation, RSVP online, amplop digital',
      url: `https://sena-digital.com/wedding${this.domain ? '/' + this.domain : ''}`,
      image: 'https://sena-digital.com/assets/images/sena-digital-og-image.jpg',
      type: 'website'
    });

    // Add Event structured data for wedding
    this.seoService.addStructuredData(this.seoService.getWeddingEventSchema());
  }

  ngAfterViewInit() {
    this.initializeBootstrapTooltips();
    this.addClickFunctionality();
    this.addTouchSupport();
    this.addSideIconClickFunctionality();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cleanupAudio();
    if (this.qrModalRef) {
      this.qrModalRef.hide();
    }
  }

  /**
   * Get session storage key with domain scope
   */
  private getStorageKey(key: string): string {
    return this.domain ? `wedding_${this.domain}_${key}` : `wedding_${key}`;
  }

  /**
   * Save invitation opened state to session storage
   */
  private saveInvitationState(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.getStorageKey('invitationOpened'), 'true');
    }
  }

  /**
   * Save current view to session storage
   */
  private saveCurrentView(view: ContentView): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.getStorageKey('currentView'), view);
    }
  }

  /**
   * Restore session state from storage
   */
  private restoreSessionState(): void {
    if (typeof sessionStorage === 'undefined' || !this.domain) {
      return;
    }

    const invitationOpenedStr = sessionStorage.getItem(this.getStorageKey('invitationOpened'));
    const savedView = sessionStorage.getItem(this.getStorageKey('currentView'));

    if (invitationOpenedStr === 'true') {
      this.invitationOpened = true;
      this.initializeAudio();

      if (savedView && Object.values(ContentView).includes(savedView as ContentView)) {
        this.currentView = savedView as ContentView;
      } else {
        this.currentView = ContentView.COUPLE;
      }
    }
  }













  /**
   * Initialize wedding data using domain-based approach
   * New implementation: Always gets domain first from SETTINGS_GET_FILTER or route params
   */
  private initializeWeddingData(): void {

    // Get route params first (check if domain is passed via route)
    const routeSubscription = this.route.params.subscribe(params => {
      const routeDomain = params['coupleName'] || params['domain'] || null;

      if (routeDomain) {
        this.domain = routeDomain;
        this.restoreSessionState();
        this.loadWeddingDataFromAPI(this.domain!);
      } else if (this.domain) {
        this.restoreSessionState();
        if (this.weddingData) {
          this.updateWeddingContent(this.weddingData);
          this.loadWeddingDataFromAPI(this.domain!, true);
        } else {
          this.loadWeddingDataFromAPI(this.domain!);
        }
      } else {
        this.loadDomainFromSettings();
      }
    });

    this.subscriptions.add(routeSubscription);
  }

  /**
   * Load domain from SETTINGS_GET_FILTER API
   * New method to get domain when not available from route or localStorage
   */
  private loadDomainFromSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const settingsSubscription = this.dashboardService.list(DashboardServiceType.SETTINGS_GET_FILTER).subscribe({
      next: (response: SettingsResponse) => {

        try {
          const domain = response?.setting?.domain;

          if (!domain) {
            console.warn('Domain not found in settings response:', response);
            this.handleDataNotFound('Domain not found in user settings');
            return;
          }

          this.domain = domain;
          this.restoreSessionState();

          this.loadWeddingDataFromAPI(domain);

        } catch (error) {
          this.handleDataNotFound('Error processing domain from settings');
        }
      },
      error: (error) => {
        this.handleAPIError(error);
      }
    });

    this.subscriptions.add(settingsSubscription);
  }

  /**
   * Load wedding data from API using domain
   * Updated to use domain parameter instead of coupleName
   * @param domain - Domain for API call (e.g., 'domainkuasna')
   * @param isBackgroundUpdate - Whether this is a background update (don't show loading)
   */
  private loadWeddingDataFromAPI(domain: string, isBackgroundUpdate: boolean = false): void {
    if (!isBackgroundUpdate) {
      this.isLoading = true;
      this.errorMessage = null;
    }

    const apiSubscription = this.dashboardService.getParam(DashboardServiceType.WEDDING_VIEW_COUPLE, `/${domain}`).subscribe({
      next: (response) => {

        if (response && response.data) {

          this.weddingData = response.data;
          this.weddingDataService.setWeddingData(response.data);

          this.updateWeddingContent(response.data);


        } else {
          if (!isBackgroundUpdate) {
            this.handleDataNotFound('No data returned from API');
          }
        }
      },
      error: (error) => {
        if (!isBackgroundUpdate) {
          // Enhanced error handling for domain-based requests
          if (error.status === 404) {
            this.handleDataNotFound(`Wedding invitation not found for domain: ${domain}`);
          } else {
            this.handleAPIError(error);
          }
        }
      },
      complete: () => {
        if (!isBackgroundUpdate) {
          this.isLoading = false;
        }
      }
    });

    this.subscriptions.add(apiSubscription);
  }

  /**
   * Load wedding data from service (fallback)
   */
  private loadWeddingDataFromService(): void {
    const serviceSubscription = this.weddingDataService.getWeddingData().subscribe(data => {
      if (data) {
        this.weddingData = data;
        this.updateWeddingContent(data);
      } else {
        this.handleDataNotFound('No data available in service');
      }
    });

    this.subscriptions.add(serviceSubscription);
  }

  /**
   * Handle case when wedding data is not found
   * @param reason - Reason for data not being found
   */
  private handleDataNotFound(reason: string): void {
    this.errorMessage = `Wedding invitation not found. ${reason}`;
    this.isLoading = false;

    console.warn('Wedding data not found:', reason);

    // Clear localStorage if data is not found


    // Optional: Redirect to home after 5 seconds
    setTimeout(() => {
      if (!this.weddingData) {
        this.router.navigate(['/']);
      }
    }, 5000);
  }

  /**
   * Handle API errors
   * @param error - Error that occurred during API call
   */
  private handleAPIError(error: any): void {
    this.isLoading = false;

    let errorMsg = 'Unable to load wedding invitation.';

    if (error.status === 401) {
      errorMsg = 'Authentication required to access this wedding invitation.';
    } else if (error.status === 404) {
      errorMsg = 'Wedding invitation not found. Please check the domain.';
    } else if (error.status === 500) {
      errorMsg = 'Server error occurred. Please try again later.';
    }

    this.errorMessage = errorMsg;
  }

  /**
   * Update wedding content based on received data
   * @param data - Wedding data from API
   */
  private updateWeddingContent(data: WeddingData): void {
    try {
      this.weddingData = data;
      this.weddingDataService.setWeddingData(data);

      // Initialize audio when wedding data is updated
      this.initializeAudio();

    } catch (error) {
      this.errorMessage = 'Error displaying wedding content';
    }
  }

  /**
   * Retry loading wedding data - always fetch fresh from API
   */
  retryLoadData(): void {
    this.errorMessage = null;

    if (this.domain) {
      this.loadWeddingDataFromAPI(this.domain);
    } else {
      // Try to get domain from settings first
      this.loadDomainFromSettings();
    }
  }

  /**
   * Refresh wedding data - fetch fresh data from API
   */
  refreshWeddingData(): void {
    if (this.domain) {
      this.loadWeddingDataFromAPI(this.domain);
    } else {
      this.loadDomainFromSettings();
    }
  }

  /**
   * Check if wedding data is available
   * @returns boolean - Whether wedding data is loaded
   */
  hasWeddingData(): boolean {
    return this.weddingData !== null;
  }

  /**
   * Get couple display name for UI
   * @returns string - Formatted couple name for display
   */
  getCoupleDisplayName(): string {
    if (!this.weddingData?.mempelai) {
      return this.domain?.replace('-', ' & ') || 'Wedding Invitation';
    }

    const groom = this.weddingData.mempelai.pria?.nama_panggilan ||
      this.weddingData.mempelai.pria?.nama_lengkap || 'Groom';
    const bride = this.weddingData.mempelai.wanita?.nama_panggilan ||
      this.weddingData.mempelai.wanita?.nama_lengkap || 'Bride';

    return `${groom} & ${bride}`;
  }

  /**
   * Get wedding URL for sharing using domain
   * @returns string - Wedding URL with domain
   */
  getWeddingUrl(): string {
    const baseUrl = window.location.origin;
    return this.domain ? `${baseUrl}/wedding/${this.domain}` : `${baseUrl}/wedding`;
  }

  /**
   * Get cover photo URL
   * @returns string - Cover photo URL or default
   */
  getCoverPhotoUrl(): string {
    return this.weddingData?.mempelai?.cover_photo || 'assets/default-cover.jpg';
  }

  /**
   * Get groom photo URL
   * @returns string - Groom photo URL or default
   */
  getGroomPhotoUrl(): string {
    return this.weddingData?.mempelai?.pria?.photo || 'assets/default-groom.jpg';
  }

  /**
   * Get bride photo URL
   * @returns string - Bride photo URL or default
   */
  getBridePhotoUrl(): string {
    return this.weddingData?.mempelai?.wanita?.photo || 'assets/default-bride.jpg';
  }

  /**
   * Initialize audio system with wedding music settings
   * Sets up HTML5 Audio element with proper event listeners
   * @param autoplay - Whether to attempt autoplay when audio is ready
   */
  private initializeAudio(autoplay: boolean = false): void {
    // Don't reinitialize if already done
    if (this.audioInitialized) {
      return;
    }

    if (!this.weddingData?.settings) {
      console.warn('No wedding settings available for audio initialization');
      return;
    }

    // Store autoplay request
    this.autoplayRequested = autoplay;

    // Try to get music URL - prefer stream URL, fallback to direct musik URL
    const musicUrl = this.weddingData.settings.music_stream_url || this.weddingData.settings.musik;

    if (!musicUrl) {
      console.warn('No music URL available in wedding settings');
      return;
    }

    try {
      this.isAudioLoading = true;
      this.audioError = null;

      // Create new audio element
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.loop = true; // Loop the wedding music
      this.audioElement.volume = this.currentVolume;
      this.audioElement.muted = this.isMuted;
      this.audioElement.crossOrigin = 'anonymous'; // Handle CORS if needed

      // Set the audio source
      this.audioElement.src = musicUrl;

      // Add event listeners for audio management
      this.setupAudioEventListeners();

      // Mark as initialized
      this.audioInitialized = true;

      console.log('Audio initialized', { musicUrl, autoplay });

    } catch (error) {
      this.audioError = 'Failed to initialize audio system';
      this.isAudioLoading = false;
      console.error('Audio initialization error:', error);
    }
  }

  /**
   * Setup event listeners for audio element
   * Manages audio state and error handling
   */
  private setupAudioEventListeners(): void {
    if (!this.audioElement) return;

    // Audio loaded and ready to play
    this.audioElement.addEventListener('canplay', () => {
      this.isAudioLoading = false;
      this.audioError = null;

      // Attempt autoplay if requested
      if (this.autoplayRequested) {
        this.autoplayRequested = false; // Reset flag to prevent repeated attempts
        this.attemptAutoplay();
      }
    });

    // Audio is playing
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
    });

    // Audio is paused
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
    });

    // Audio loading started
    this.audioElement.addEventListener('loadstart', () => {
      this.isAudioLoading = true;
    });

    // Audio metadata loaded
    this.audioElement.addEventListener('loadedmetadata', () => {
    });

    // Audio loading error
    this.audioElement.addEventListener('error', (event) => {
      const error = this.audioElement?.error;

      let errorMessage = 'Audio loading failed';
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
        }
      }

      this.audioError = errorMessage;
      this.isAudioLoading = false;
      this.isPlaying = false;
    });

    // Audio volume changed
    this.audioElement.addEventListener('volumechange', () => {
      if (this.audioElement) {
        this.currentVolume = this.audioElement.volume;
        this.isMuted = this.audioElement.muted;
      }
    });

    // Audio ended (shouldn't happen with loop=true)
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
    });

    // Audio stalled
    this.audioElement.addEventListener('stalled', () => {
      console.warn('Audio loading stalled');
    });

    // Audio waiting for data
    this.audioElement.addEventListener('waiting', () => {
      this.isAudioLoading = true;
    });

    // Audio can play through
    this.audioElement.addEventListener('canplaythrough', () => {
      this.isAudioLoading = false;
    });
  }

  /**
   * Cleanup audio resources
   * Called in ngOnDestroy
   */
  private cleanupAudio(): void {
    if (this.audioElement) {

      // Pause and reset
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      // Remove event listeners
      this.audioElement.removeEventListener('canplay', () => {});
      this.audioElement.removeEventListener('play', () => {});
      this.audioElement.removeEventListener('pause', () => {});
      this.audioElement.removeEventListener('error', () => {});
      this.audioElement.removeEventListener('volumechange', () => {});
      this.audioElement.removeEventListener('ended', () => {});

      // Clear source and element
      this.audioElement.src = '';
      this.audioElement.load(); // Force cleanup
      this.audioElement = null;

      this.audioInitialized = false;
      this.isPlaying = false;
      this.isAudioLoading = false;
    }
  }

  /**
   * Initialize audio specifically for mobile devices within user gesture
   * This ensures audio context is unlocked properly on mobile browsers
   */
  private initializeAudioForMobile(): void {
    if (!this.weddingData?.settings) {
      console.warn('No wedding settings available for mobile audio initialization');
      return;
    }

    const musicUrl = this.weddingData.settings.music_stream_url || this.weddingData.settings.musik;

    if (!musicUrl) {
      console.warn('No music URL available');
      return;
    }

    try {
      // Create audio element synchronously in user gesture
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.loop = true;
      this.audioElement.volume = this.currentVolume;
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.src = musicUrl;

      // Setup listeners
      this.setupAudioEventListeners();
      this.audioInitialized = true;

      // Load and play immediately while still in user gesture context
      this.audioElement.load();

      // Try to play immediately
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Mobile audio initialized and playing');
            this.isPlaying = true;
            this.audioError = null;
          })
          .catch(error => {
            console.error('Mobile audio play failed:', error);
            // Don't show error - user can try again
            this.isPlaying = false;
          });
      }

    } catch (error) {
      console.error('Mobile audio initialization error:', error);
      this.audioError = 'Gagal menginisialisasi audio';
    }
  }

  /**
   * Attempt to autoplay audio with fallback to muted playback
   * Handles browser autoplay restrictions gracefully
   * NOTE: On mobile, this often fails. Use initializeAudioForMobile() instead.
   */
  private attemptAutoplay(): void {
    if (!this.audioElement) {
      console.warn('Cannot autoplay: audio element not available');
      return;
    }

    console.log('Attempting autoplay...');

    // First attempt: play with sound
    this.audioElement.play()
      .then(() => {
        console.log('Autoplay successful');
        this.isPlaying = true;
        this.isMuted = false;
      })
      .catch((error) => {
        console.warn('Autoplay blocked:', error);

        // Fallback: mute and try again
        if (this.audioElement) {
          this.audioElement.muted = true;
          this.isMuted = true;

          this.audioElement.play()
            .then(() => {
              console.log('Muted autoplay successful - user can unmute manually');
              this.isPlaying = true;
            })
            .catch((mutedError) => {
              console.error('Muted autoplay also failed:', mutedError);
              // Don't set error - user can manually click play button
              this.isPlaying = false;
            });
        }
      });
  }

  /**
   * Set audio volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (volume < 0 || volume > 1) {
      console.warn('Volume must be between 0 and 1');
      return;
    }

    this.currentVolume = volume;

    if (this.audioElement) {
      this.audioElement.volume = volume;
    }

  }

  /**
   * Get current audio time
   * @returns number - Current playback time in seconds
   */
  getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  /**
   * Get audio duration
   * @returns number - Total audio duration in seconds
   */
  getDuration(): number {
    return this.audioElement?.duration || 0;
  }

  /**
   * Check if audio is ready to play
   * @returns boolean - Whether audio is ready
   */
  isAudioReady(): boolean {
    return this.audioInitialized && !this.isAudioLoading && !this.audioError;
  }

  /**
   * Get music information from wedding settings
   * @returns object with music info or null
   */
  getMusicInfo(): any {
    return this.weddingData?.settings?.music_info || null;
  }

  /**
   * Check if music streaming is supported
   * @returns boolean - Whether music streaming is supported
   */
  isMusicStreamingSupported(): boolean {
    const musicInfo = this.getMusicInfo();
    return musicInfo?.supports_streaming === true;
  }

  /**
   * Get available music formats
   * @returns string[] - Array of supported formats
   */
  getSupportedFormats(): string[] {
    const musicInfo = this.getMusicInfo();
    return musicInfo?.format_support || [];
  }

  togglePlay(): void {
    // Mobile audio unlock - ensure we create/initialize audio directly in user gesture
    if (!this.audioElement) {
      console.log('Audio not initialized, initializing now with user interaction');
      this.initializeAudioForMobile();
      return;
    }

    if (this.isAudioLoading) {
      console.warn('Audio is still loading, please wait');
      return;
    }

    try {
      if (this.isPlaying) {
        this.audioElement.pause();
        this.isPlaying = false;
      } else {
        // Critical: Unmute first on mobile to ensure playback
        if (this.audioElement.muted) {
          this.audioElement.muted = false;
          this.isMuted = false;
        }

        // IMPORTANT: Call play() directly in user gesture, not in promise chain
        const playPromise = this.audioElement.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started successfully');
              this.isPlaying = true;
              this.audioError = null;
            })
            .catch(error => {
              console.error('Playback failed:', error);

              // Try muted playback as fallback
              if (this.audioElement && !this.audioElement.muted) {
                console.log('Attempting muted playback...');
                this.audioElement.muted = true;
                this.isMuted = true;

                this.audioElement.play()
                  .then(() => {
                    console.log('Muted playback successful - unmute manually');
                    this.isPlaying = true;
                    this.audioError = null;
                  })
                  .catch(mutedError => {
                    console.error('Muted playback also failed:', mutedError);
                    this.audioError = 'Tidak dapat memutar audio. Silakan coba lagi.';
                    this.isPlaying = false;
                  });
              }
            });
        }
      }
    } catch (error) {
      console.error('Toggle play error:', error);
      this.audioError = 'Terjadi kesalahan saat memutar audio';
      this.isPlaying = false;
    }
  }

  toggleMute(): void {
    if (!this.audioElement) {
      console.warn('Audio not initialized, cannot toggle mute');
      // Try to initialize for mobile
      this.initializeAudioForMobile();
      return;
    }

    try {
      const newMutedState = !this.audioElement.muted;
      this.audioElement.muted = newMutedState;
      this.isMuted = newMutedState;

      // If unmuting and audio is not playing, try to start it
      if (!newMutedState && !this.isPlaying) {
        const playPromise = this.audioElement.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started after unmute');
              this.isPlaying = true;
            })
            .catch(error => {
              console.error('Failed to start audio after unmute:', error);
              // Re-mute if play failed
              this.audioElement!.muted = true;
              this.isMuted = true;
            });
        }
      }

      console.log('Audio muted state:', newMutedState);
    } catch (error) {
      console.error('Toggle mute error:', error);
    }
  }

  toggleSideIcons(): void {
    this.sideIconsVisible = !this.sideIconsVisible;
  }

  openInvitation(): void {
    const wasAlreadyOpened = this.invitationOpened;
    this.invitationOpened = true;
    this.setCurrentView(ContentView.COUPLE);
    this.saveInvitationState();

    // Critical: Try to initialize and play audio directly in this user gesture
    // This is the best chance for mobile browsers to allow audio playback
    if (!this.audioInitialized && this.weddingData?.settings) {
      const musicUrl = this.weddingData.settings.music_stream_url || this.weddingData.settings.musik;

      if (musicUrl) {
        try {
          // Initialize audio synchronously within user gesture
          this.audioElement = new Audio();
          this.audioElement.preload = 'auto';
          this.audioElement.loop = true;
          this.audioElement.volume = this.currentVolume;
          this.audioElement.crossOrigin = 'anonymous';
          this.audioElement.src = musicUrl;

          // Setup event listeners
          this.setupAudioEventListeners();
          this.audioInitialized = true;

          // Load the audio
          this.audioElement.load();

          // Try to play immediately (best chance on mobile)
          this.audioElement.play()
            .then(() => {
              console.log('Audio started on invitation open');
              this.isPlaying = true;
              this.isMuted = false;
            })
            .catch(error => {
              console.warn('Autoplay blocked on invitation open:', error);

              // Try muted playback
              if (this.audioElement) {
                this.audioElement.muted = true;
                this.isMuted = true;

                this.audioElement.play()
                  .then(() => {
                    console.log('Muted audio started - user can unmute');
                    this.isPlaying = true;
                  })
                  .catch(() => {
                    // Silent fail - user can click play button
                    console.log('Audio will need manual play button click');
                    this.isPlaying = false;
                  });
              }
            });

        } catch (error) {
          console.error('Error initializing audio on invitation open:', error);
        }
      }
    }

    if (!wasAlreadyOpened) {
      this.submitAttendanceView();
    }
  }

  /**
   * Submit attendance record for view tracking
   * Note: This uses the RSVP attendance API with default values for view tracking purposes
   */
  private submitAttendanceView(): void {
    if (!this.weddingData?.user_info?.id) {
      console.warn('Cannot track attendance: user_info.id not available');
      return;
    }

    const attendanceData: AttendanceRequest = {
      user_id: this.weddingData.user_info.id,
      nama: 'Viewer', // Default name for view tracking
      kehadiran: 'hadir', // Default status for view tracking
      pesan: `Undangan ${this.domain} telah dilihat` // Include domain in tracking message
    };


    const attendanceSubscription = this.dashboardService.create(
      DashboardServiceType.ATTENDANCE,
      attendanceData
    ).subscribe({
      next: (response: AttendanceResponse) => {
        if (response.data) {
        }
      },
      error: (error) => {

        // Log specific error details without blocking the user experience
        if (error.status === 422) {
        } else if (error.status === 500) {
        }

        // Don't show error to user since this is background tracking
        // The invitation should still open normally
      },
      complete: () => {
      }
    });

    this.subscriptions.add(attendanceSubscription);
  }

  setCurrentView(view: ContentView): void {
    this.currentView = view;
    this.saveCurrentView(view);
  }

  showMessages(): void {
    this.setCurrentView(ContentView.MESSAGE);
  }

  toggleFavorite(event: MouseEvent): void {
    this.currentView = this.currentView === ContentView.COUPLE ? ContentView.MAIN : ContentView.COUPLE;
  }

  showCalendar(): void {
    this.setCurrentView(ContentView.CALENDAR);
  }

  showBirthday(): void {
    this.setCurrentView(ContentView.BIRTHDAY);
  }

  showChat(): void {
    this.setCurrentView(ContentView.CHAT);
  }

  showGallery(): void {
    this.setCurrentView(ContentView.GALLERY);
  }

  showProfile(): void {
    this.setCurrentView(ContentView.PROFILE);
  }

  showGifts(): void {
    this.setCurrentView(ContentView.GIFT);
  }

  isCurrentView(view: ContentView): boolean {
    return this.currentView === view;
  }

  /**
   * Open QR Code modal for sharing wedding URL
   */
  openQRCodeModal(): void {

    if (!this.domain) {
      alert('No domain available for QR code generation');
      return;
    }

    const weddingUrl = this.getWeddingUrl();
    const coupleNames = this.getCoupleDisplayName();


    const initialState = {
      url: weddingUrl,
      title: `Share ${coupleNames}'s Wedding`,
      description: 'Scan this QR code to view our wedding invitation'
    };


    try {
      this.qrModalRef = this.modalService.show(QRCodeModalComponent, {
        initialState,
        class: 'modal-lg',
        backdrop: true,
        keyboard: true,
        animated: true
      });


      // Handle modal close event
      this.qrModalRef.onHide?.subscribe(() => {
        this.qrModalRef = undefined;
      });

    } catch (error) {
      alert('Error opening QR modal: ' + error);
    }
  }

  /**
   * Test modal opening for debugging
   */
  testModal(): void {

    try {
      const testModalRef = this.modalService.show(QRCodeModalComponent, {
        initialState: {
          url: 'https://test.example.com',
          title: 'Test Modal',
          description: 'This is a test modal'
        },
        class: 'modal-lg'
      });

    } catch (error) {
      alert('Test modal error: ' + error);
    }
  }

  /**
   * Check if messages page should be visible based on filter_undangan.halaman_ucapan
   */
  isMessagesVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_ucapan) === "1";
  }

  /**
   * Check if calendar page should be visible based on filter_undangan.halaman_acara
   */
  isCalendarVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_acara) === "1";
  }

  /**
   * Check if birthday/events page should be visible based on filter_undangan.halaman_acara
   */
  isBirthdayVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_acara) === "1";
  }

  /**
   * Check if chat/stories page should be visible based on filter_undangan.halaman_cerita
   */
  isChatVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_cerita) === "1";
  }

  /**
   * Check if gallery page should be visible based on filter_undangan.halaman_galery
   */
  isGalleryVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_galery) === "1";
  }

  /**
   * Check if profile/location page should be visible based on filter_undangan.halaman_lokasi
   */
  isProfileVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_lokasi) === "1";
  }

  /**
   * Check if gifts page should be visible based on filter_undangan.halaman_send_gift
   */
  isGiftsVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_send_gift) === "1";
  }

  /**
   * Check if favorite button should be visible based on filter_undangan.halaman_sampul
   */
  isFavoriteVisible(): boolean {
    return String(this.weddingData?.filter_undangan?.halaman_sampul) === "1";
  }

  private initializeBootstrapTooltips(): void {
    const tooltipTriggerList = Array.from(
      this.elementRef.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  private addClickFunctionality(): void {
    const navItems = this.elementRef.nativeElement.querySelectorAll('.nav-item');

    navItems.forEach((item: HTMLElement, index: number) => {
      this.renderer.listen(item, 'click', () => {
        navItems.forEach((nav: HTMLElement) => {
          this.renderer.setStyle(nav, 'background', 'transparent');
          this.renderer.removeClass(nav, 'active');
        });

        this.renderer.setStyle(item, 'background', 'rgba(44, 85, 48, 0.15)');
        this.renderer.addClass(item, 'active');

        this.createRippleEffect(item);
      });
    });
  }

  private createRippleEffect(element: HTMLElement): void {
    const ripple = this.renderer.createElement('span');

    const rippleStyles = `
      position: absolute;
      border-radius: 50%;
      background: rgba(44, 85, 48, 0.3);
      width: 20px;
      height: 20px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    this.renderer.setAttribute(ripple, 'style', rippleStyles);
    this.renderer.appendChild(element, ripple);

    setTimeout(() => {
      this.renderer.removeChild(element, ripple);
    }, 600);
  }

  private addTouchSupport(): void {
    const navItems = this.elementRef.nativeElement.querySelectorAll('.nav-item');

    navItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'touchstart', () => {
        this.renderer.setStyle(item, 'transform', 'translateY(-2px) scale(1.02)');
      });

      this.renderer.listen(item, 'touchend', () => {
        this.renderer.setStyle(item, 'transform', '');
      });
    });
  }

  private addSideIconClickFunctionality(): void {
    const sideIcons = this.elementRef.nativeElement.querySelectorAll('.side-icon-btn');

    sideIcons.forEach((icon: HTMLElement) => {
      this.renderer.listen(icon, 'click', () => {
        this.renderer.setStyle(icon, 'transform', 'scale(0.95)');
        setTimeout(() => {
          this.renderer.setStyle(icon, 'transform', '');
        }, 150);
      });
    });
  }

  private injectRippleStyles(): void {
    const style = this.renderer.createElement('style');
    const styleContent = `
      @keyframes ripple {
        to {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }

      .wedding-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        padding: 2rem;
        text-align: center;
      }

      .loading-spinner {
        font-size: 3rem;
        margin-bottom: 1rem;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }

      .wedding-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        padding: 2rem;
        text-align: center;
      }

      .error-message {
        color: #dc3545;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        max-width: 400px;
      }

      .retry-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .retry-button:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }

      .error-links {
        margin-top: 1rem;
        color: #666;
        font-size: 0.9rem;
      }

      .error-links a {
        color: #007bff;
        text-decoration: none;
      }

      .error-links a:hover {
        text-decoration: underline;
      }
    `;

    this.renderer.setProperty(style, 'textContent', styleContent);
    this.renderer.appendChild(document.head, style);
  }
}
