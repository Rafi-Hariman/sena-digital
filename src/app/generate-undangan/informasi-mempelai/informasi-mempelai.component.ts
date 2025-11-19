import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalUploadGaleriComponent } from '../modal-upload-galeri/modal-upload-galeri.component';
import { DashboardService, DashboardServiceType } from '../../dashboard.service';
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

  // Getter to check if form is valid including photo uploads
  get isFormValid(): boolean {
    // Check if all text fields are valid
    const textFieldsValid = this.formGroup?.valid;

    // Check if all required photos are uploaded
    const photosValid = !!(
      this.imagePreviews['photo_pria'] &&
      this.imagePreviews['photo_wanita'] &&
      this.imagePreviews['cover_photo']
    );

    return textFieldsValid && photosValid;
  }

  constructor(
    private fb: FormBuilder,
    private modalSvc: BsModalService,
    private dashboardSvc: DashboardService
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit(): void {
    try {
      // Get user ID from formData input (from previous step)
      const userID = this.formData?.response?.user?.id || this.formData?.user_id;

      if (userID) {
        this.userId = userID;
      } else {
        console.warn('User ID not found in formData');
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
        user_id: [userID || ''],
        status: [1],
        photo_pria: [null],
        photo_wanita: [null],
        cover_photo: [null]
      });

      // Load from input formData if available
      if (this.formData && Object.keys(this.formData).length > 0) {
        this.formGroup.patchValue(this.formData);
      }
    } catch (error) {
      console.error('Error initializing component:', error);
      this.notyf.error('Gagal memuat data. Silakan refresh halaman.');
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
    reader.onload = () => {
      try {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];

        this.imagePreviews[controlName] = base64String;

        // Store the base64 data in form for submission
        this.formGroup.patchValue({ [controlName]: base64Data });

        // Mark image as stored in control value for validation
        this.formGroup.get(controlName)?.markAsTouched();
        this.formGroup.get(controlName)?.updateValueAndValidity();
      } catch (error) {
        console.error('Error processing file:', error);
        this.notyf.error('Gagal memproses gambar.');
      }
    };
    reader.readAsDataURL(file);
  }


  onNext(): void {
    try {
      this.modalRef = this.modalSvc.show(ModalUploadGaleriComponent, {
        initialState: { formData: { ...this.formGroup.value } },
        class: 'modal-lg'
      });

      this.modalRef.content?.formDataChange.subscribe((updatedData: any) => {
        try {
          this.formGroup.patchValue(updatedData);

          const data = {
            updatedData: updatedData,
          };

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

  onNextClicked() {
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

    // Ensure user_id is set
    if (!this.formGroup.get('user_id')?.value) {
      this.notyf.error('User ID tidak ditemukan. Silakan refresh halaman.');
      return;
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
