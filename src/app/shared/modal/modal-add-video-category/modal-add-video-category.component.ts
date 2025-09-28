import { Component, Input, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { VideoCategoryService } from '../../../services/video-category.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notyf } from 'notyf';
import { Subject } from 'rxjs';
import { CategoryCreateRequest } from '../../../interfaces/admin-category.interfaces';

@Component({
  selector: 'wc-modal-add-video-category',
  templateUrl: './modal-add-video-category.component.html',
  styleUrls: ['./modal-add-video-category.component.scss']
})
export class ModalAddVideoCategoryComponent implements OnInit {

  @Input() initialState: any;
  categoryForm!: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  uploading: boolean = false;
  private notyf: Notyf;
  onClose!: Subject<boolean>;

  constructor(
    private modalSvc: BsModalService,
    private videoCategoryService: VideoCategoryService,
    private formSvc: FormBuilder
  ) {
    this.notyf = new Notyf({
      duration: 3000,
      position: { x: 'right', y: 'top' }
    });
  }

  ngOnInit() {
    this.categoryForm = this.formSvc.group({
      nama_kategori: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]],
      slug: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
        Validators.pattern(/^[a-z0-9-]+$/)
      ]],
      is_active: [true]
    });
    this.onClose = new Subject();

    // Auto-generate slug from nama_kategori
    this.categoryForm.get('nama_kategori')?.valueChanges.subscribe(value => {
      if (value) {
        let slug = value.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Remove leading/trailing hyphens
        slug = slug.replace(/^-+|-+$/g, '');

        // Ensure minimum length for slug
        if (slug.length < 3 && value.length >= 3) {
          slug = value.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        }
        this.categoryForm.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  closeModal() {
    this.modalSvc.hide();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        this.notyf.error('Please select a valid image file (JPEG, PNG, JPG, or GIF)');
        return;
      }

      if (file.size > maxSize) {
        this.notyf.error('Image size must be less than 2MB');
        return;
      }

      this.selectedImage = file;

      // Generate preview
      this.videoCategoryService.generateImagePreview(file)
        .then(preview => {
          this.imagePreview = preview;
        })
        .catch(error => {
          console.error('Error generating preview:', error);
          this.notyf.error('Error generating image preview');
        });
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onAddCategory() {
    // Force validation check
    this.categoryForm.markAllAsTouched();

    if (this.categoryForm.invalid) {
      // Show specific validation errors
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        if (control && control.invalid) {
          const errorMessage = this.getFieldError(key);
          if (errorMessage) {
            this.notyf.error(errorMessage);
          }
        }
      });
      return;
    }

    // Additional frontend validation
    const namaKategori = this.categoryForm.value.nama_kategori?.trim();
    const slug = this.categoryForm.value.slug?.trim();

    if (!namaKategori || namaKategori.length < 3) {
      this.notyf.error('Nama kategori minimal 3 karakter');
      return;
    }

    if (!slug || slug.length < 3) {
      this.notyf.error('Slug minimal 3 karakter');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      this.notyf.error('Slug hanya boleh mengandung huruf kecil, angka, dan tanda strip');
      return;
    }

    this.uploading = true;

    const formData: CategoryCreateRequest = {
      nama_kategori: namaKategori,
      slug: slug,
      is_active: this.categoryForm.value.is_active ? 1 : 0  // Convert to 1/0
    };

    if (this.selectedImage) {
      formData.image = this.selectedImage;
    }

    this.videoCategoryService.createCategory(formData)
      .subscribe({
        next: (result) => {
          this.uploading = false;
          if (result.success) {
            this.notyf.success('Video category created successfully!');
            this.modalSvc.hide();
            this.onClose.next(true);
          } else {
            this.notyf.error(result.error || 'Failed to create category');
          }
        },
        error: (error) => {
          this.uploading = false;
          console.error('Error creating category:', error);

          if (error.validationErrors) {
            // Handle validation errors
            Object.keys(error.validationErrors).forEach(field => {
              const messages = error.validationErrors[field];
              messages.forEach((message: string) => {
                this.notyf.error(`${field}: ${message}`);
              });
            });
          } else {
            this.notyf.error(error.error || 'Failed to create category');
          }
        }
      });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} wajib diisi`;
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName} minimal ${requiredLength} karakter`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${fieldName} maksimal ${maxLength} karakter`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'slug') {
          return 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda strip (-)';
        }
        return `Format ${fieldName} tidak valid`;
      }
    }
    return '';
  }
}
