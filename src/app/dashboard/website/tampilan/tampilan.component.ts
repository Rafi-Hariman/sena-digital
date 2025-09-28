import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ThemeService,
  PublicCategoriesResponse,
  PublicCategoryWithThemes,
  PublicTheme,
  UserSelectedThemeResponse,
  ThemeSelectionRequest
} from '../../../dashboard.service';
import { ToastService } from '../../../toast.service';

interface ThemeCard {
  id: number;
  label: string;
  title: string;
  name: string;
  image: string;
  demo_url: string;
  price: number;
  isSelected: boolean;
  isLoading?: boolean;
  category_id: number;
}

@Component({
  selector: 'wc-tampilan',
  templateUrl: './tampilan.component.html',
  styleUrls: ['./tampilan.component.scss']
})
export class TampilanComponent implements OnInit, OnDestroy {
  themeCards: ThemeCard[] = [];
  isLoading = false;
  errorMessage = '';
  selectedThemeId: number | null = null;

  private subscriptions = new Subscription();

  constructor(
    private themeService: ThemeService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadThemes();
    this.loadSelectedTheme();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load themes from API
   */
  private loadThemes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const themesSubscription = this.themeService.getPublicCategoriesWithThemes('website').subscribe({
      next: (response: PublicCategoriesResponse) => {
        if (response.status && response.data?.categories) {
          this.processThemeData(response.data.categories);
          console.log('Themes loaded successfully:', response.data.total_themes);
        } else {
          this.handleError('Invalid response format from server');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading themes:', error);
        this.handleError('Failed to load themes. Please try again later.');
        this.isLoading = false;
      }
    });

    this.subscriptions.add(themesSubscription);
  }

  /**
   * Load currently selected theme
   */
  private loadSelectedTheme(): void {
    const selectedSubscription = this.themeService.getSelectedTheme().subscribe({
      next: (response: UserSelectedThemeResponse) => {
        if (response.status && response.data?.theme) {
          this.selectedThemeId = response.data.theme.id;
          this.updateSelectedStatus();
          console.log('Selected theme loaded:', response.data.theme.name);
        }
      },
      error: (error) => {
        // No selected theme or authentication error - this is acceptable
        console.log('No selected theme or authentication required:', error);
      }
    });

    this.subscriptions.add(selectedSubscription);
  }

  /**
   * Process theme data from API into display format
   */
  private processThemeData(categories: PublicCategoryWithThemes[]): void {
    this.themeCards = [];

    categories.forEach(category => {
      if (category.jenis_themas && category.jenis_themas.length > 0) {
        category.jenis_themas.forEach(theme => {
          this.themeCards.push({
            id: theme.id,
            label: this.getCategoryLabel(category.name),
            title: theme.name,
            name: theme.name,
            image: this.getThemeImage(theme),
            demo_url: theme.demo_url || '',
            price: theme.price || 0,
            isSelected: false,
            isLoading: false,
            category_id: category.id
          });
        });
      }
    });

    // Update selected status if we have a selected theme
    if (this.selectedThemeId) {
      this.updateSelectedStatus();
    }
  }

  /**
   * Update selected status for themes
   */
  private updateSelectedStatus(): void {
    this.themeCards.forEach(card => {
      card.isSelected = card.id === this.selectedThemeId;
    });
  }

  /**
   * Get category label for display
   */
  private getCategoryLabel(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes('scroll')) return 'Scroll';
    if (name.includes('slide')) return 'Slide';
    if (name.includes('mobile')) return 'Mobile';
    return 'Website'; // default
  }

  /**
   * Get theme image from API response
   */
  private getThemeImage(theme: PublicTheme): string {
    const baseUrl = 'http://127.0.0.1:8000/storage/';

    // Priority order: preview_image -> thumbnail_image -> image -> preview -> fallback
    if (theme.preview_image) {
      return theme.preview_image.startsWith('http') ? theme.preview_image : `${baseUrl}${theme.preview_image}`;
    }

    if (theme.thumbnail_image) {
      return theme.thumbnail_image.startsWith('http') ? theme.thumbnail_image : `${baseUrl}${theme.thumbnail_image}`;
    }

    if (theme.image) {
      return theme.image.startsWith('http') ? theme.image : `${baseUrl}${theme.image}`;
    }

    if (theme.preview && theme.preview.includes('http')) {
      return theme.preview;
    }

    // Fallback to static assets based on theme name
    const themeName = theme.name.toLowerCase();
    if (themeName.includes('modern')) return 'assets/themas2.png';
    if (themeName.includes('blue')) return 'assets/themas4.png';
    if (themeName.includes('pinky')) return 'assets/themas1.png';
    if (themeName.includes('minimalist')) return 'assets/themas3.png';

    return 'assets/themas2.png'; // default
  }

  /**
   * Handle theme activation/deactivation
   */
  onToggleActivation(theme: ThemeCard): void {
    if (theme.isLoading) return;

    theme.isLoading = true;

    if (theme.isSelected) {
      // Cannot deactivate selected theme - show message
      this.toastService.showToast('This theme is already selected', 'info');
      theme.isLoading = false;
      return;
    }

    const request: ThemeSelectionRequest = {
      theme_id: theme.id
    };

    const selectionSubscription = this.themeService.selectTheme(request).subscribe({
      next: (response) => {
        if (response.status) {
          // Update selected theme
          this.selectedThemeId = theme.id;
          this.updateSelectedStatus();

          this.toastService.showToast(`Theme "${theme.name}" selected successfully!`, 'success');
          console.log('Theme selected:', response.data.theme.name);
        } else {
          this.toastService.showToast('Failed to select theme', 'error');
        }
        theme.isLoading = false;
      },
      error: (error) => {
        console.error('Error selecting theme:', error);
        let errorMessage = 'Failed to select theme';

        if (error.status === 401) {
          errorMessage = 'Please log in to select a theme';
        } else if (error.status === 422) {
          errorMessage = 'Invalid theme selection';
        }

        this.toastService.showToast(errorMessage, 'error');
        theme.isLoading = false;
      }
    });

    this.subscriptions.add(selectionSubscription);
  }

  /**
   * Handle demo button click
   */
  onDemoClick(theme: ThemeCard): void {
    if (!theme.demo_url) {
      this.toastService.showToast('Demo not available for this theme', 'warning');
      return;
    }

    try {
      // Open demo in new window
      window.open(theme.demo_url, '_blank', 'noopener,noreferrer');
      console.log('Opening demo for theme:', theme.name);
    } catch (error) {
      console.error('Error opening demo:', error);
      this.toastService.showToast('Failed to open demo', 'error');
    }
  }

  /**
   * Handle errors
   */
  private handleError(message: string): void {
    this.errorMessage = message;
    this.toastService.showToast(message, 'error');
  }

  /**
   * Retry loading themes
   */
  retryLoadThemes(): void {
    this.errorMessage = '';
    this.loadThemes();
  }

  /**
   * Get background class for theme card
   */
  getBackgroundClass(label: string): string {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('scroll')) return 'bg-scroll';
    if (labelLower.includes('slide')) return 'bg-slide';
    if (labelLower.includes('mobile')) return 'bg-mobile';
    return 'bg-scroll'; // default
  }

  /**
   * Get activation button text
   */
  getActivationButtonText(theme: ThemeCard): string {
    if (theme.isLoading) return 'Loading...';
    return theme.isSelected ? 'Selected' : 'Select';
  }

  /**
   * Get activation button icon
   */
  getActivationButtonIcon(theme: ThemeCard): string {
    if (theme.isLoading) return 'fas fa-spinner fa-spin';
    return theme.isSelected ? 'fas fa-check' : 'fas fa-file-alt';
  }

  /**
   * Check if theme is loading
   */
  isThemeLoading(theme: ThemeCard): boolean {
    return theme.isLoading || false;
  }

  /**
   * Handle image loading errors
   */
  onImageError(event: any, theme: ThemeCard): void {
    console.warn(`Failed to load image for theme ${theme.name}:`, theme.image);
    // Set fallback image
    event.target.src = 'assets/themas2.png';
  }

  /**
   * Track function for ngFor performance
   */
  trackByThemeId(index: number, theme: ThemeCard): number {
    return theme.id;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }
}
