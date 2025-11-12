import { Component, OnInit, OnDestroy } from '@angular/core';
import { SeoService } from '../services/seo.service';
import { StorageService, FormStorageData } from '../services/storage.service';
import { Subject, debounceTime } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface InvitationFormData extends FormStorageData {
  registrasi: Record<string, any>;
  informasiMempelai: Record<string, any>;
  cerita: Record<string, any>;
  pembayaran: Record<string, any>;
  step: number;
  image?: string;
  lastModified?: number;
}

@Component({
  selector: 'wc-generate-undangan',
  templateUrl: './generate-undangan.component.html',
  styleUrls: ['./generate-undangan.component.scss'],
})
export class GenerateUndanganComponent implements OnInit, OnDestroy {

  titles: string[] = ['Isi Data Akun', 'Informasi Mempelai', 'Konfirmasi Data', 'Pembayaran'];

  formData: InvitationFormData = {
    registrasi: {},
    informasiMempelai: {},
    cerita: {},
    pembayaran: {},
    step: 1,
  };

  private autoSaveSubject = new Subject<void>();
  private destroy$ = new Subject<void>();
  private imageMap: Map<string, string> = new Map();

  constructor(
    private seoService: SeoService,
    private storageService: StorageService
  ) {
    this.setupAutoSave();
  }

  ngOnInit(): void {
    this.setSeoTags();
    this.loadFormData();
    this.storageService.migrateExistingImages();
    console.log('all formdata:', this.formData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupAutoSave(): void {
    this.autoSaveSubject.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saveFormDataSecurely();
    });
  }

  private loadFormData(): void {
    try {
      const saved = this.storageService.getFormData();

      if (saved && this.isValidFormData(saved)) {
        this.formData = {
          registrasi: (saved as any).registrasi || {},
          informasiMempelai: (saved as any).informasiMempelai || {},
          cerita: (saved as any).cerita || {},
          pembayaran: (saved as any).pembayaran || {},
          step: (saved as any).step || 1,
          lastModified: (saved as any).lastModified,
        };
      } else {
        console.warn('Stored form data is invalid or incomplete. Starting fresh.');
        this.initializeFormData();
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      this.initializeFormData();
    }
  }

  private initializeFormData(): void {
    this.formData = {
      registrasi: {},
      informasiMempelai: {},
      cerita: {},
      pembayaran: {},
      step: 1,
      lastModified: Date.now(),
    };
  }

  private isValidFormData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const hasAtLeastOneField =
      Object.keys(data.registrasi || {}).length > 0 ||
      Object.keys(data.informasiMempelai || {}).length > 0 ||
      Object.keys(data.cerita || {}).length > 0 ||
      Object.keys(data.pembayaran || {}).length > 0;

    const stepIsValid = typeof data.step === 'number' && data.step >= 1 && data.step <= 4;

    return hasAtLeastOneField && stepIsValid;
  }

  private setSeoTags(): void {
    // Set SEO meta tags for generate invitation page
    this.seoService.setMetaTags({
      title: 'Buat Undangan Digital Pernikahan Gratis - Sena Digital',
      description: 'Buat undangan digital pernikahan Anda sendiri dengan mudah dan gratis. Pilih template, customize desain, dan bagikan ke tamu undangan Anda.',
      keywords: 'buat undangan digital, create wedding invitation, undangan gratis, buat undangan pernikahan, undangan online gratis',
      url: 'https://sena-digital.com/buat-undangan',
      image: 'https://sena-digital.com/assets/images/sena-digital-og-image.jpg',
      type: 'website'
    });

    // Add Service structured data
    this.seoService.addStructuredData(this.seoService.getServiceSchema());
  }

  private saveFormDataSecurely(): void {
    try {
      const success = this.storageService.setFormData(this.formData);
      if (!success) {
        console.warn('Failed to save form data. Storage quota may be exceeded.');
      }
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }

  get title(): string {
    return this.titles[this.formData.step - 1] || 'Form';
  }

  get progress(): number {
    return (this.formData.step / this.titles.length) * 100;
  }

  nextStep(data: any): void {
    this.formData = {
      ...this.formData,
      registrasi: data?.formData || this.formData?.registrasi,
    };
    const step = this.formData.step;

    if (step === 1) {
      this.formData.registrasi = data;
    } else if (step === 2) {
      this.formData.informasiMempelai = data;
    } else if (step === 3) {
      this.formData.cerita = data;
    }

    // Increment step
    this.formData.step = step + 1;
    this.formData.lastModified = Date.now();
    this.autoSaveSubject.next();
  }

  prevStep(): void {
    if (this.formData.step > 1) {
      this.formData.step--;
      this.formData.lastModified = Date.now();
      this.autoSaveSubject.next();
    }
  }

  async saveImage(image: File): Promise<void> {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result;
        if (imageData && typeof imageData === 'string') {
          // Generate unique image ID based on timestamp
          const imageId = `image_${Date.now()}`;

          // Store image in IndexedDB
          const stored = await this.storageService.setImage(imageId, imageData, image.type);

          if (stored) {
            // Store reference in form data (not the actual image)
            this.imageMap.set(imageId, imageData);
            this.formData.image = imageId;
            this.formData.lastModified = Date.now();
            this.autoSaveSubject.next();
            console.log('Image stored successfully in IndexedDB');
          } else {
            console.error('Failed to store image in IndexedDB');
          }
        }
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }

  async getStoredImage(): Promise<string | null> {
    try {
      if (!this.formData.image) {
        return null;
      }

      // Try to get from memory cache first
      if (this.imageMap.has(this.formData.image)) {
        return this.imageMap.get(this.formData.image) || null;
      }

      // Otherwise, retrieve from IndexedDB
      const imageData = await this.storageService.getImage(this.formData.image);
      if (imageData) {
        this.imageMap.set(this.formData.image, imageData);
      }
      return imageData;
    } catch (error) {
      console.error('Error retrieving stored image:', error);
      return null;
    }
  }
}
