

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CustomerKyc,
  CustomerKycDocument,
  CustomerKycService,
  KycHistory
} from '../../services/customer-kyc.service';




@Component({
  selector: 'app-customer-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-kyc.html',
  styleUrl: './customer-kyc.scss'
})
export class CustomerKycPage implements OnInit {
  historyLoaded = false;
historyError = '';
  private readonly kycService = inject(CustomerKycService);

  customerId: number | null = null;
  kycId: number | null = null;

  kyc: CustomerKyc | null = null;
  documents: CustomerKycDocument[] = [];
  history: KycHistory[] = [];

  documentType = 'AADHAAR';
  documentNumber = '';
  selectedFile: File | null = null;

  loading = false;
  uploading = false;
  historyLoading = false;

  errorMessage = '';
  successMessage = '';

  readonly documentTypes = [
  'Aadhaar',
  'PAN',
  'Passport',
  'Driving_License',
  'Voter_ID',
  'Address_Proof'
];

  ngOnInit(): void {
    // Temporary local-testing approach:
    // restore the KYC record created/opened previously in this browser.
    const savedKycId = localStorage.getItem('customerKycId');
    const savedCustomerId = localStorage.getItem('customerKycCustomerId');

    if (savedCustomerId) {
      this.customerId = Number(savedCustomerId);
    }

    if (savedKycId && Number(savedKycId) > 0) {
      this.kycId = Number(savedKycId);
      this.loadKyc();
    }
  }

  createKyc(): void {
    this.clearMessages();

    if (
      this.customerId == null ||
      !Number.isInteger(this.customerId) ||
      this.customerId <= 0
    ) {
      this.errorMessage = 'Enter a valid Customer ID.';
      return;
    }

    this.loading = true;

    this.kycService.createKyc(this.customerId).subscribe({
      next: record => {
        this.kyc = record;
        this.kycId = record.kycId;

        localStorage.setItem('customerKycId', String(record.kycId));
        localStorage.setItem(
          'customerKycCustomerId',
          String(this.customerId)
        );

        this.successMessage = 'KYC request created successfully.';
        this.loading = false;
        this.loadDocuments();
      },
      error: error => {
        this.errorMessage =
          error.error?.message ||
          'Unable to create KYC. Check whether an active request already exists.';
        this.loading = false;
      }
    });
  }

  loadKyc(): void {
    if (!this.kycId) return;

    this.clearMessages();
    this.loading = true;

    this.kycService.getKyc(this.kycId).subscribe({
      next: record => {
        this.kyc = record;
        this.customerId = record.customerId;
        this.loading = false;

        localStorage.setItem('customerKycId', String(record.kycId));
        localStorage.setItem(
          'customerKycCustomerId',
          String(record.customerId)
        );

        this.loadDocuments();
      },
      error: error => {
        this.errorMessage =
          error.error?.message || 'Unable to load KYC details.';
        this.loading = false;
      }
    });
  }

  loadDocuments(): void {
    if (!this.kycId) return;

    this.kycService.getDocuments(this.kycId).subscribe({
      next: documents => this.documents = documents,
      error: () => this.documents = []
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDocument(): void {
    this.clearMessages();

    if (!this.kycId) {
      this.errorMessage = 'Create or load a KYC request first.';
      return;
    }

    if (!this.documentType || !this.documentNumber.trim()) {
      this.errorMessage = 'Select a document type and enter its number.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please select a document file.';
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.errorMessage = 'Only PDF, JPG and PNG files are allowed.';
      return;
    }

    this.uploading = true;

    this.kycService.uploadDocument(
      this.kycId,
      this.documentType,
      this.documentNumber.trim(),
      this.selectedFile
    ).subscribe({
      next: () => {
        this.successMessage = 'Document uploaded successfully.';
        this.documentNumber = '';
        this.selectedFile = null;
        this.uploading = false;
        this.loadDocuments();
        this.loadKyc();
      },
      error: error => {
        this.errorMessage =
          error.error?.message || 'Unable to upload document.';
        this.uploading = false;
      }
    });
  }

  resubmitKyc(): void {
    this.clearMessages();

    if (!this.kycId) return;

    if (!this.documents.length) {
      this.errorMessage = 'Upload the required documents before resubmitting.';
      return;
    }

    this.loading = true;

    this.kycService.resubmitKyc(this.kycId).subscribe({
      next: record => {
        this.kyc = record;
        this.successMessage = 'KYC resubmitted successfully.';
        this.loading = false;
        this.loadDocuments();
      },
      error: error => {
        this.errorMessage =
          error.error?.message || 'Unable to resubmit KYC.';
        this.loading = false;
      }
    });
  }

loadHistory(): void {
  if (!this.kycId) {
    this.errorMessage = 'Load a KYC request first.';
    return;
  }

  this.historyLoading = true;
  this.history = [];
  this.historyLoaded = false;
  this.historyError = '';

  this.kycService.getHistory(this.kycId).subscribe({
    next: records => {
      this.history = records ?? [];
      this.historyLoaded = true;
      this.historyLoading = false;
    },
    error: error => {
      this.historyLoading = false;
      this.historyLoaded = false;
      this.historyError =
        error.error?.message ||
        'Unable to load verification history. Please try again.';
    }
  });
}


  get status(): string {
    return (this.kyc?.verificationStatus || 'NOT_CREATED')
      .toUpperCase()
      .replaceAll('_', ' ');
  }

  get isRejected(): boolean {
    return (this.kyc?.verificationStatus || '').toUpperCase() === 'REJECTED';
  }

  get canUpload(): boolean {
    const status = (this.kyc?.verificationStatus || '').toUpperCase();
    return !!this.kyc && (
      status === 'PENDING' ||
      status === 'REJECTED' ||
      status === 'RE_SUBMITTED' ||
      status === 'RESUBMITTED'
    );
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }



  findKycByCustomerId(): void {
  this.clearMessages();

  if (
    this.customerId == null ||
    !Number.isInteger(this.customerId) ||
    this.customerId <= 0
  ) {
    this.errorMessage = 'Please enter a valid Customer ID.';
    return;
  }

  this.loading = true;

  this.kycService.getKycByCustomerId(this.customerId).subscribe({
    next: record => {
      this.kyc = record;
      this.kycId = record.kycId;

      localStorage.setItem('customerKycId', String(record.kycId));
      localStorage.setItem(
        'customerKycCustomerId',
        String(record.customerId)
      );

      this.loading = false;
      this.successMessage = 'Existing KYC loaded successfully.';

      this.loadDocuments();
    },
    error: error => {
      this.loading = false;
      this.errorMessage =
        error.error?.message || 'No KYC record found for this customer.';
    }
  });
}
}
