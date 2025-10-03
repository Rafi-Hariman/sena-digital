import {
  Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService, DashboardServiceType } from '../../dashboard.service';
import { StorageService } from '../../services/storage.service';
import { Notyf } from 'notyf';

@Component({
  selector: 'wc-modal-upload-galeri',
  templateUrl: './modal-upload-galeri.component.html',
  styleUrls: ['./modal-upload-galeri.component.scss']
})
export class ModalUploadGaleriComponent implements OnInit {
  @Input() formData: any = {};
  @Output() formDataChange = new EventEmitter<any>();
  @Output() next = new EventEmitter<any>();

  uploadForm!: FormGroup;
  imagePreviews: { [key: string]: string } = {};
  private notyf: Notyf;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private dashboardSvc: DashboardService,
    private storageService: StorageService
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Initialize form first
      this.uploadForm = this.fb.group({
        photo: [''],
        status: [1],
        user_id: ['', Validators.required]
      });

      // Get form data safely
      const existingFormData = this.storageService.getFormData();
      const galeriData = existingFormData?.informasiMempelai?.updatedData || this.formData || {};

      // Get user ID safely
      const userID = this.storageService.getUserId();
      if (userID) {
        this.uploadForm.patchValue({
          user_id: userID
        });
      } else {
        console.warn('User ID not found in storage');
      }

      // Load existing image from IndexedDB if it exists
      if (galeriData.photo_stored) {
        const storedImage = await this.storageService.getImage('photo');
        if (storedImage) {
          this.imagePreviews['photo'] = `data:image/png;base64,${storedImage}`;
          this.uploadForm.patchValue({ photo: storedImage });
        }
      } else if (galeriData.photo) {
        // Handle legacy base64 data
        this.imagePreviews['photo'] = `data:image/png;base64,${galeriData.photo}`;
        this.uploadForm.patchValue({ photo: galeriData.photo });

        // Migrate to IndexedDB
        await this.storageService.setImage('photo', galeriData.photo);
      }

      // Clean up old images
      this.storageService.cleanupOldImages();
    } catch (error) {
      console.error('Error initializing modal:', error);
      this.notyf.error('Gagal memuat data. Silakan coba lagi.');
    }
  }

  closeModal(): void {
    this.bsModalRef.hide();
  }

  browseFiles(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any, controlName: string): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      this.notyf.error('Format gambar tidak didukung. Gunakan PNG atau JPG.');
      return;
    }

    if (file.size > maxSize) {
      this.notyf.error('Ukuran file maksimal 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        // Store image in IndexedDB
        const stored = await this.storageService.setImage(controlName, base64Data, file.type);

        if (stored) {
          this.imagePreviews[controlName] = base64String;
          this.uploadForm.patchValue({ [controlName]: base64Data });
        } else {
          this.notyf.error('Gagal menyimpan gambar. Silakan coba lagi.');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        this.notyf.error('Gagal memproses gambar.');
      }
    };
    reader.readAsDataURL(file);
  }

  onSubmitModal() {
    if (this.uploadForm.valid) {
      const payload = new FormData();

      Object.keys(this.uploadForm.value).forEach((key) => {
        const value = this.uploadForm.get(key)?.value;
        if (key.includes('photo') && typeof value === 'string') {
          const byteCharacters = atob(value);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          payload.append(key, blob, `${key}.png`);
        } else if (key === 'status') {
          payload.append(key, value ? '1' : '0');
        } else {
          payload.append(key, value);
        }
      });

      this.dashboardSvc.create(DashboardServiceType.MNL_STEP_THREE, payload).subscribe({
        next: (res) => {
          this.notyf.success(res?.message || 'Data berhasil disimpan.');
          setTimeout(() => this.nextStep(), 1000);
        },
        error: (err) => {
          this.notyf.error(err?.message || 'Ada kesalahan dalam sistem.');
        }
      });
    } else {
      this.notyf.error('Harap isi foto terlebih dahulu');
    }
  }

  async removePhoto(controlName: string): Promise<void> {
    try {
      delete this.imagePreviews[controlName];
      this.uploadForm.patchValue({ [controlName]: '' });

      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }

      // Remove from IndexedDB
      await this.storageService.deleteImage(controlName);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  }


  nextStep(): void {
    try {
      const updatedData = {
        ...this.formData,
        ...this.uploadForm.value,
        status: this.uploadForm.value.status ? 1 : 0
      };

      // Update form data safely without storing large images
      const existingFormData = this.storageService.getFormData();
      const updatedFormData = {
        ...existingFormData,
        informasiMempelai: {
          ...existingFormData.informasiMempelai,
          updatedData: {
            ...existingFormData.informasiMempelai?.updatedData,
            ...updatedData,
            // Mark that photo is stored in IndexedDB
            photo_stored: !!updatedData.photo
          }
        }
      };

      const success = this.storageService.setFormData(updatedFormData);
      if (!success) {
        console.warn('Failed to store form data');
      }

      this.closeModal();
      this.next.emit(updatedData);
      this.formDataChange.emit(updatedData);
    } catch (error) {
      console.error('Error in nextStep:', error);
      this.notyf.error('Gagal menyimpan data.');
    }
  }
}
