import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalUploadGaleriComponent } from '../modal-upload-galeri/modal-upload-galeri.component';
import { DashboardService, DashboardServiceType } from '../../dashboard.service';
import { StorageService } from '../../services/storage.service';
import { Notyf } from 'notyf';

@Component({
  selector: 'wc-informasi-mempelai',
  templateUrl: './informasi-mempelai.component.html',
  styleUrls: ['./informasi-mempelai.component.scss']
})
export class InformasiMempelaiComponent implements OnInit {
  @Input() formData: any = {};
  @Output() next = new EventEmitter<any>();
  @Output() prev = new EventEmitter<void>();

  formGroup!: FormGroup;
  modalRef?: BsModalRef;
  private notyf: Notyf;


  imagePreviews: { [key: string]: string | null } = {
    photo_pria: null,
    photo_wanita: null,
    cover_photo: null
  };
  userId: any;

  constructor(
    private fb: FormBuilder,
    private modalSvc: BsModalService,
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
      // Get user ID first
      const userID = this.storageService.getUserId();
      if (userID) {
        this.userId = userID;
      } else {
        console.warn('User ID not found in storage');
      }

      // Initialize form with photo fields as optional
      this.formGroup = this.fb.group({
        name_lengkap_pria: ['', Validators.required],
        name_panggilan_pria: ['', Validators.required],
        ayah_pria: ['', Validators.required],
        ibu_pria: ['', Validators.required],
        name_lengkap_wanita: ['', Validators.required],
        name_panggilan_wanita: ['', Validators.required],
        ayah_wanita: ['', Validators.required],
        ibu_wanita: ['', Validators.required],
        user_id: [userID || '', Validators.required],
        status: [1],
        photo_pria: [null],
        photo_wanita: [null],
        cover_photo: [null]
      });

      // Load existing form data
      const existingFormData = this.storageService.getFormData();
      if (existingFormData?.informasiMempelai?.updatedData) {
        const loadedData = existingFormData.informasiMempelai.updatedData;

        // Preserve user_id if not set
        if (!loadedData.user_id && userID) {
          loadedData.user_id = userID;
        }

        this.formGroup.patchValue(loadedData);
      }

      // Load image previews from IndexedDB
      await this.loadImagePreviews(existingFormData?.informasiMempelai?.updatedData);

      // Migrate existing localStorage images if needed
      await this.storageService.migrateExistingImages();
    } catch (error) {
      console.error('Error initializing component:', error);
      this.notyf.error('Gagal memuat data. Silakan refresh halaman.');
    }
  }

  private async loadImagePreviews(updatedData: any): Promise<void> {
    const imageFields = ['photo_pria', 'photo_wanita', 'cover_photo'];

    for (const field of imageFields) {
      try {
        if (updatedData?.[`${field}_stored`]) {
          // Load from IndexedDB
          const storedImage = await this.storageService.getImage(field);
          if (storedImage) {
            this.imagePreviews[field] = `data:image/jpeg;base64,${storedImage}`;
            // Set the form control value with the base64 data for submission
            this.formGroup.patchValue({ [field]: storedImage });
            this.formGroup.get(field)?.markAsTouched();
          }
        } else if (updatedData?.[field]) {
          // Handle legacy base64 data
          this.imagePreviews[field] = `data:image/jpeg;base64,${updatedData[field]}`;
          // Set the form control value with the base64 data
          this.formGroup.patchValue({ [field]: updatedData[field] });
          this.formGroup.get(field)?.markAsTouched();

          // Migrate to IndexedDB
          await this.storageService.setImage(field, updatedData[field]);
        } else {
          this.imagePreviews[field] = null;
        }
      } catch (error) {
        console.error(`Error loading ${field}:`, error);
        this.imagePreviews[field] = null;
      }
    }
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

          // Store the base64 data temporarily in form for submission
          this.formGroup.patchValue({ [controlName]: base64Data });

          // Mark image as stored in control value for validation
          this.formGroup.get(controlName)?.markAsTouched();
          this.formGroup.get(controlName)?.updateValueAndValidity();

          // Update form data without storing the actual image data
          await this.updateFormDataSafely();
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

  private async updateFormDataSafely(): Promise<void> {
    try {
      const formValue = this.formGroup.value;
      const existingFormData = this.storageService.getFormData();

      // Create updated data without large base64 images
      const updatedData = { ...formValue };

      // Mark images as stored in IndexedDB instead of including base64 data
      ['photo_pria', 'photo_wanita', 'cover_photo'].forEach(field => {
        if (updatedData[field] && typeof updatedData[field] === 'string' && updatedData[field].length > 1000) {
          updatedData[`${field}_stored`] = true;
          delete updatedData[field]; // Remove large base64 data
        }
      });

      const updatedFormData = {
        ...existingFormData,
        informasiMempelai: {
          ...existingFormData.informasiMempelai,
          updatedData
        }
      };

      const success = this.storageService.setFormData(updatedFormData);
      if (!success) {
        console.warn('Failed to store form data in localStorage');
      }
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  }


  onNext(): void {
    try {
      this.modalRef = this.modalSvc.show(ModalUploadGaleriComponent, {
        initialState: { formData: { ...this.formGroup.value } },
        class: 'modal-lg'
      });

      this.modalRef.content?.formDataChange.subscribe(async (updatedData: any) => {
        try {
          this.formGroup.patchValue(updatedData);

          const data = {
            updatedData: updatedData,
          };

          // Update storage safely
          const existingFormData = this.storageService.getFormData();
          const updatedFormData = {
            ...existingFormData,
            informasiMempelai: {
              ...existingFormData.informasiMempelai,
              updatedData: {
                ...this.formGroup.value,
                // Mark photos as stored if they exist
                photo_stored: !!updatedData.photo
              }
            },
            step: 3
          };

          const success = this.storageService.setFormData(updatedFormData);
          if (!success) {
            console.warn('Failed to store updated form data');
          }

          this.next.emit(data);
        } catch (error) {
          console.error('Error handling modal data change:', error);
          this.notyf.error('Gagal menyimpan data.');
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
      this.notyf.error('Gagal membuka modal.');
    }
  }

  onBack() {
    this.prev.emit();
  }

  async onNextClicked() {
    // Check if all required fields are filled
    if (this.formGroup.invalid) {
      this.notyf.error('Silakan isi semua data yang diperlukan.');
      return;
    }

    // Validate that all photos are uploaded
    if (!this.imagePreviews['photo_pria'] || !this.imagePreviews['photo_wanita'] || !this.imagePreviews['cover_photo']) {
      this.notyf.error('Silakan upload semua foto (Pria, Wanita, dan Sampul).');
      return;
    }

    // Ensure all image data is loaded in form controls before submission
    const imageFields = ['photo_pria', 'photo_wanita', 'cover_photo'];
    for (const field of imageFields) {
      const currentValue = this.formGroup.get(field)?.value;

      // If form control is empty but preview exists, load from IndexedDB
      if (!currentValue && this.imagePreviews[field]) {
        try {
          const storedImage = await this.storageService.getImage(field);
          if (storedImage) {
            this.formGroup.patchValue({ [field]: storedImage });
          } else {
            this.notyf.error(`Gagal memuat ${field}. Silakan upload ulang.`);
            return;
          }
        } catch (error) {
          console.error(`Error loading ${field} from storage:`, error);
          this.notyf.error(`Gagal memuat ${field}. Silakan coba lagi.`);
          return;
        }
      }
    }

    const payload = new FormData();

    Object.keys(this.formGroup.value).forEach((key) => {
      const value = this.formGroup.get(key)?.value;

      if (key.includes('photo') && typeof value === 'string') {
        try {
          const byteCharacters = atob(value);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          payload.append(key, blob, `${key}.png`);
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          this.notyf.error(`Gagal memproses ${key}.`);
          return;
        }
      } else if (value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });

    this.dashboardSvc.create(DashboardServiceType.MNL_STEP_TWO, payload).subscribe({
      next: (res) => {
        this.notyf.success(res?.message || 'Data berhasil disimpan.');
        setTimeout(() => this.onNext(), 1000);
      },
      error: (err) => {
        this.notyf.error(err?.message || 'Ada kesalahan dalam sistem.');
      }
    });
  }
}
