import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notyf } from 'notyf';
import { DashboardService, DashboardServiceType } from 'src/app/dashboard.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

interface AcaraEvent {
  id: number | null;
  jenis_acara: 'akad' | 'resepsi';
  nama_acara: string;
  tanggal_acara: string | Date | null;
  start_acara: string;
  end_acara: string;
  alamat: string;
  link_maps: string;
  countdown_id?: number;
}

interface Countdown {
  id: number;
  name_countdown: string;
  created_at?: string;
  updated_at?: string;
}

interface AcaraResponse {
  data: {
    events: {
      akad: AcaraEvent | null;
      resepsi: AcaraEvent | null;
    };
    countdown: Countdown | null;
    available_event_types: { [key: string]: string };
    event_type_options: { [key: string]: string };
  };
  message?: string;
}

type EventType = 'akad' | 'resepsi';

@Component({
  selector: 'wc-acara',
  templateUrl: './acara.component.html',
  styleUrls: ['./acara.component.scss'],
})
export class AcaraComponent implements OnInit {
  countdownForm!: FormGroup;
  akadForm!: FormGroup;
  resepsiForm!: FormGroup;

  bsConfig!: Partial<BsDatepickerConfig>;
  modalRef?: BsModalRef;
  private notyf: Notyf;

  // Event data
  akadEvent: AcaraEvent | null = null;
  resepsiEvent: AcaraEvent | null = null;
  countdownData: Countdown | null = null;

  // UI state
  selectedEventType: EventType | null = null;
  availableEventTypes: { [key: string]: string } = {};
  eventTypeOptions: { [key: string]: string } = {
    akad: 'Akad Nikah',
    resepsi: 'Resepsi'
  };
  showEventForm = false;
  isLoading = false;
  userID: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dashboardSvc: DashboardService,
    private readonly modalSvc: BsModalService
  ) {
    this.notyf = new Notyf({
      duration: 4000,
      position: { x: 'right', y: 'top' },
      types: [
        {
          type: 'success',
          background: '#28a745',
          icon: {
            className: 'fas fa-check',
            tagName: 'span',
            color: '#fff'
          }
        },
        {
          type: 'error',
          background: '#dc3545',
          icon: {
            className: 'fas fa-times',
            tagName: 'span',
            color: '#fff'
          }
        }
      ]
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.fetchInitialData();
  }

  private initForms(): void {
    // Countdown form
    this.countdownForm = this.fb.group({
      name_countdown: ['', [Validators.required, Validators.minLength(1)]],
    });

    // Akad form with specific validation
    this.akadForm = this.fb.group({
      id: [null],
      jenis_acara: ['akad'],
      nama_acara: ['', [Validators.required, Validators.maxLength(255)]],
      tanggal_acara: [null, Validators.required],
      start_acara: ['', [Validators.required, this.timeValidator]],
      end_acara: ['', [Validators.required, this.timeValidator]],
      alamat: ['', Validators.required],
      link_maps: ['', [Validators.required, this.urlValidator]],
    });

    // Resepsi form with specific validation
    this.resepsiForm = this.fb.group({
      id: [null],
      jenis_acara: ['resepsi'],
      nama_acara: ['', [Validators.required, Validators.maxLength(255)]],
      tanggal_acara: [null, Validators.required],
      start_acara: ['', [Validators.required, this.timeValidator]],
      end_acara: ['', [Validators.required, this.timeValidator]],
      alamat: ['', Validators.required],
      link_maps: ['', [Validators.required, this.urlValidator]],
    });

    this.bsConfig = {
      dateInputFormat: 'DD MMMM YYYY',
      showTodayButton: true,
      isAnimated: true,
      containerClass: 'theme-dark-blue',
    };
  }

  // Custom validators
  private timeValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value) ? null : { invalidTime: true };
  }

  private urlValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(value) ? null : { invalidUrl: true };
  }

  // Event type selection
  onEventTypeSelect(eventType: EventType): void {
    if (!this.countdownData) {
      this.notyf.error('Silakan buat countdown terlebih dahulu sebelum menambah acara.');
      return;
    }

    this.selectedEventType = eventType;
    this.showEventForm = true;

    // Check if event already exists
    const existingEvent = eventType === 'akad' ? this.akadEvent : this.resepsiEvent;
    if (existingEvent) {
      this.populateEventForm(eventType, existingEvent);
    }
  }

  private populateEventForm(eventType: EventType, eventData: AcaraEvent): void {
    const form = eventType === 'akad' ? this.akadForm : this.resepsiForm;

    form.patchValue({
      id: eventData.id,
      nama_acara: eventData.nama_acara,
      tanggal_acara: eventData.tanggal_acara ? new Date(eventData.tanggal_acara) : null,
      start_acara: eventData.start_acara,
      end_acara: eventData.end_acara,
      alamat: eventData.alamat,
      link_maps: eventData.link_maps
    });
  }

  deleteEvent(eventType: EventType): void {
    const event = eventType === 'akad' ? this.akadEvent : this.resepsiEvent;

    if (!event?.id) {
      this.notyf.error('Acara tidak ditemukan.');
      return;
    }

    const initialState = {
      message: `Apakah anda ingin menghapus acara "${event.nama_acara}"?`,
      cancelClicked: () => '',
      submitClicked: () => this.confirmDeleteEvent(event.id!, eventType),
      submitMessage: 'Hapus',
    };

    this.showModal(initialState);
  }

  private confirmDeleteEvent(eventId: number, eventType: EventType): void {
    this.isLoading = true;

    const payload = { id: eventId };

    this.dashboardSvc.create(DashboardServiceType.ACARA_SUBMIT_DELETE_DYNAMIC, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.notyf.success(res?.message ?? 'Acara berhasil dihapus.');

        // Clear the deleted event
        if (eventType === 'akad') {
          this.akadEvent = null;
          this.akadForm.reset();
        } else {
          this.resepsiEvent = null;
          this.resepsiForm.reset();
        }

        this.selectedEventType = null;
        this.showEventForm = false;
        this.fetchInitialData();
      },
      error: (err) => {
        this.isLoading = false;
        this.notyf.error(err?.error?.message ?? 'Gagal menghapus acara.');
      }
    });
  }
  fetchInitialData(): void {
    this.isLoading = true;
    this.dashboardSvc.list(DashboardServiceType.ACARA_DATA).subscribe({
      next: (res: AcaraResponse) => {
        this.isLoading = false;

        // Set countdown data
        this.countdownData = res?.data?.countdown ?? null;
        if (this.countdownData) {
          this.countdownForm.patchValue({
            name_countdown: this.countdownData.name_countdown
          });
        }

        // Set event data
        this.akadEvent = res?.data?.events?.akad ?? null;
        this.resepsiEvent = res?.data?.events?.resepsi ?? null;

        // Set available event types for creation
        this.availableEventTypes = res?.data?.available_event_types ?? {};

        // Populate forms if events exist
        if (this.akadEvent) {
          this.populateEventForm('akad', this.akadEvent);
        }
        if (this.resepsiEvent) {
          this.populateEventForm('resepsi', this.resepsiEvent);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notyf.error('Gagal memuat data acara');
        console.error('Error fetching event data:', err);
      },
    });
  }

  cancelEventForm(): void {
    this.selectedEventType = null;
    this.showEventForm = false;

    // Reset forms
    this.akadForm.reset({ jenis_acara: 'akad' });
    this.resepsiForm.reset({ jenis_acara: 'resepsi' });
  }

  onCountdownSubmitClicked(): void {
    if (this.countdownForm.valid) {
      const initialState = {
        message: 'Apakah anda ingin menyimpan countdown ini?',
        cancelClicked: () => '',
        submitClicked: () => this.submitCountdownForm(),
        submitMessage: 'Simpan',
      };

      this.showModal(initialState);
    }
  }

  onEventSubmitClicked(): void {
    if (!this.selectedEventType) {
      this.notyf.error('Silakan pilih jenis acara terlebih dahulu.');
      return;
    }

    const form = this.selectedEventType === 'akad' ? this.akadForm : this.resepsiForm;
    const existingEvent = this.selectedEventType === 'akad' ? this.akadEvent : this.resepsiEvent;

    if (form.valid) {
      const message = existingEvent
        ? `Apakah anda ingin mengubah data ${this.eventTypeOptions[this.selectedEventType]}?`
        : `Apakah anda ingin menyimpan data ${this.eventTypeOptions[this.selectedEventType]}?`;

      const initialState = {
        message,
        cancelClicked: () => '',
        submitClicked: () => this.submitEventForm(),
        submitMessage: 'Simpan',
      };

      this.showModal(initialState);
    } else {
      this.notyf.error('Form tidak valid. Harap periksa data acara.');
      this.markFormGroupTouched(form);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];
      control.markAsTouched();
    });
  }

  onCountdownUpdateClicked(): void {
    if (this.countdownForm.valid) {
      const initialState = {
        message: 'Apakah anda ingin mengubah countdown ini?',
        cancelClicked: () => '',
        submitClicked: () => this.updateCountdownForm(),
        submitMessage: 'Simpan',
      };

      this.showModal(initialState);
    }
  }

  private showModal(initialState: any): void {
    this.modalRef = this.modalSvc.show(ModalComponent, { initialState });

    if (this.modalRef?.content) {
      this.modalRef.content.onClose.subscribe((res: { state: string }) => {
        if (res?.state === 'delete' || res?.state === 'cancel') {
          this.modalRef?.hide();
        }
        this.modalRef?.hide();
      });
    }
  }

  // Form validation helper methods
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} wajib diisi`;
    if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} terlalu panjang`;
    if (field.errors['min']) return `${this.getFieldLabel(fieldName)} harus lebih dari 0`;
    if (field.errors['invalidTime']) return 'Format waktu tidak valid (HH:MM)';
    if (field.errors['invalidUrl']) return 'URL tidak valid';

    return 'Input tidak valid';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nama_acara: 'Nama acara',
      tanggal_acara: 'Tanggal acara',
      start_acara: 'Waktu mulai',
      end_acara: 'Waktu selesai',
      alamat: 'Alamat',
      link_maps: 'Link Google Maps',
      name_countdown: 'Nama countdown'
    };
    return labels[fieldName] || fieldName;
  }

  submitCountdownForm(): void {
    if (this.countdownForm.valid) {
      this.isLoading = true;
      const { name_countdown } = this.countdownForm.value;
      const payload = { name_countdown };

      this.dashboardSvc.create(DashboardServiceType.ACARA_SUBMIT_COUNTDOWN, payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.notyf.success(res?.message ?? 'Countdown berhasil disimpan.');
          this.fetchInitialData();
        },
        error: (err) => {
          this.isLoading = false;
          this.notyf.error(err?.error?.message ?? 'Gagal menyimpan countdown.');
        },
      });
    }
  }

  updateCountdownForm(): void {
    if (this.countdownForm.valid && this.countdownData?.id) {
      this.isLoading = true;
      const { name_countdown } = this.countdownForm.value;
      const payload = { name_countdown };

      this.dashboardSvc
        .update(DashboardServiceType.ACARA_SUBMIT_UPDATE_COUNTDOWN, this.countdownData.id.toString(), payload)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notyf.success(res?.message ?? 'Countdown berhasil diperbarui.');
            this.fetchInitialData();
          },
          error: (err) => {
            this.isLoading = false;
            this.notyf.error(err?.error?.message ?? 'Gagal memperbarui countdown.');
          },
        });
    }
  }

  submitEventForm(): void {
    if (!this.selectedEventType) return;

    const form = this.selectedEventType === 'akad' ? this.akadForm : this.resepsiForm;
    const existingEvent = this.selectedEventType === 'akad' ? this.akadEvent : this.resepsiEvent;

    if (form.valid) {
      this.isLoading = true;
      const formValue = form.value;

      // Prepare payload
      const payload = {
        jenis_acara: this.selectedEventType,
        nama_acara: formValue.nama_acara,
        tanggal_acara: formValue.tanggal_acara instanceof Date
          ? formValue.tanggal_acara.toISOString().split('T')[0]
          : formValue.tanggal_acara,
        start_acara: formValue.start_acara,
        end_acara: formValue.end_acara,
        alamat: formValue.alamat,
        link_maps: formValue.link_maps
      };

      if (existingEvent?.id) {
        // Update existing event
        const updatePayload = { ...payload, id: existingEvent.id };

        this.dashboardSvc.update(DashboardServiceType.ACARA_SUBMIT_UPDATE_DYNAMIC, '', updatePayload).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notyf.success(res?.message ?? `${this.eventTypeOptions[this.selectedEventType!]} berhasil diperbarui.`);
            this.cancelEventForm();
            this.fetchInitialData();
          },
          error: (err) => {
            this.isLoading = false;
            this.notyf.error(err?.error?.message ?? `Gagal memperbarui ${this.eventTypeOptions[this.selectedEventType!].toLowerCase()}.`);
          }
        });
      } else {
        // Create new event
        this.dashboardSvc.create(DashboardServiceType.ACARA_SUBMIT_DYNAMIC, payload).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notyf.success(res?.message ?? `${this.eventTypeOptions[this.selectedEventType!]} berhasil disimpan.`);
            this.cancelEventForm();
            this.fetchInitialData();
          },
          error: (err) => {
            this.isLoading = false;
            this.notyf.error(err?.error?.message ?? `Gagal menyimpan ${this.eventTypeOptions[this.selectedEventType!].toLowerCase()}.`);
          }
        });
      }
    }
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  hasCountdown(): boolean {
    return !!this.countdownData;
  }

  hasEvent(eventType: EventType): boolean {
    return eventType === 'akad' ? !!this.akadEvent : !!this.resepsiEvent;
  }

  getEventTypeLabel(eventType: EventType): string {
    return this.eventTypeOptions[eventType] || eventType;
  }

  isEventTypeAvailable(eventType: EventType): boolean {
    return eventType in this.availableEventTypes;
  }

  getAvailableEventTypes(): { key: EventType; label: string }[] {
    return Object.entries(this.availableEventTypes).map(([key, label]) => ({
      key: key as EventType,
      label
    }));
  }
}
