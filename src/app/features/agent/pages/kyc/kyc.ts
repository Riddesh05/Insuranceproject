import { CommonModule } from '@angular/common';
import { Component, inject,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

import {
  AgentKycDocument,
  AgentKycRecord,
  AgentKycService
} from '../../services/agent-kyc.service';

@Component({
  selector: 'app-agent-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc.html',
  styleUrl: './kyc.scss'
})
export class AgentKyc  implements OnInit  {
  private kycService = inject(AgentKycService);

  hasUploadedDocument = false;

  customerId: number | null = null;
  kycId: number | null = null;

  kyc: AgentKycRecord | null = null;
  documents: AgentKycDocument[] = [];

  documentType = 'AADHAAR';
  documentNumber = '';
  selectedFile: File | null = null;

  loading = false;
  uploading = false;
  errorMessage = '';
  successMessage = '';

  readonly documentTypes = [
    'AADHAAR',
    'PAN',
    'PASSPORT',
    'DRIVING_LICENSE'
  ];


private customerService = inject(CustomerService);

customers: Customer[] = [];
selectedCustomerId: number | null = null;
customerSearch = '';
customerLoading = false;

  findKyc(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.kyc = null;
    this.hasUploadedDocument = false;
    this.documents = [];

    if (!this.kycId || this.kycId <= 0) {
      this.errorMessage = 'Please enter a valid KYC ID.';
      return;
    }

    this.loading = true;

    this.kycService.getKycById(this.kycId).subscribe({
      next: (record) => {
        this.kyc = record;
        this.customerId = record.customerId;
        this.loadDocuments(record.kycId);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Unable to load KYC details.';
        this.loading = false;
      }
    });
  }

 
createKyc(): void {
  this.errorMessage = '';
  this.successMessage = '';
  this.hasUploadedDocument = false;

  const selectedId = this.selectedCustomerId;

  if (selectedId == null || selectedId <= 0) {
    this.errorMessage = 'Please select a valid customer.';
    return;
  }

  this.loading = true;

  this.kycService.createKyc(selectedId).subscribe({
    next: (record) => {
      this.kyc = record;
      this.kycId = record.kycId;
      this.customerId = selectedId;

      // Check that backend created KYC for the selected customer.
      if (record.customerId !== selectedId) {
        this.errorMessage =
          `Customer mismatch! Selected ID: ${selectedId}, ` +
          `but KYC response returned ID: ${record.customerId}.`;

        this.successMessage = '';
        this.loading = false;
        return;
      }

      this.successMessage = 'KYC request created successfully.';
      this.loadDocuments(record.kycId);
    },
    error: (error) => {
      this.errorMessage =
        error.error?.message || 'Unable to create KYC request.';
      this.loading = false;
    }
  });
}


   resubmitKyc(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (!this.kyc || this.kyc.verificationStatus !== 'Rejected') {
    this.errorMessage = 'Only rejected KYC can be resubmitted.';
    return;
  }

  if (!this.hasUploadedDocument) {
    this.errorMessage = 'Please upload the required document before resubmitting.';
    return;
  }

  this.loading = true;

  this.kycService.resubmitKyc(this.kyc.kycId).subscribe({
    next: (record) => {
      this.kyc = record;
      this.kycId = record.kycId;
      this.hasUploadedDocument = false;
      this.successMessage = 'KYC resubmitted successfully.';
      this.loadDocuments(record.kycId);
    },
    error: (error) => {
      this.errorMessage =
        error.error?.message || 'Unable to resubmit KYC.';
      this.loading = false;
    }
  });
}




  loadDocuments(kycId: number): void {
    this.kycService.getDocuments(kycId).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
      },
      error: (error) => {
        this.documents = [];
        this.errorMessage =
          error.error?.message || 'Unable to load KYC documents.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorMessage = '';
    this.successMessage = '';
    this.selectedFile = null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, JPG, JPEG and PNG files are allowed.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must not exceed 5 MB.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  uploadDocument(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.kyc) {
      this.errorMessage = 'Create or load a KYC request first.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Please select a document file.';
      return;
    }

    if (!this.documentNumber.trim()) {
      this.errorMessage = 'Please enter the document number.';
      return;
    }

    this.uploading = true;

    this.kycService.uploadDocument(
      this.kyc.kycId,
      this.documentType,
      this.documentNumber.trim(),
      this.selectedFile
    ).subscribe({
      next: () => {
        this.successMessage = 'Document uploaded successfully.';
        this.documentNumber = '';
        this.selectedFile = null;
        this.uploading = false;
        this.loadDocuments(this.kyc!.kycId);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Document upload failed.';
        this.uploading = false;
      }
    });
  }


  ngOnInit(): void {
  this.loadCustomers();
}

loadCustomers(): void {
  this.customerLoading = true;

  this.customerService.getAllCustomers().subscribe({
    next: (customers) => {
      this.customers = customers;
      this.customerLoading = false;
    },
    error: (error) => {
      this.errorMessage =
        error.error?.message || 'Unable to load customers.';
      this.customerLoading = false;
    }
  });
}

get filteredCustomers(): Customer[] {
  const search = this.customerSearch.trim().toLowerCase();

  if (!search) {
    return this.customers;
  }

  return this.customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(search) ||
    customer.email?.toLowerCase().includes(search) ||
    customer.mobileNumber?.toLowerCase().includes(search) ||
    String(customer.customerId).includes(search)
  );
}

onCustomerSelected(): void {
  this.customerId = this.selectedCustomerId;
  this.kyc = null;
  this.kycId = null;
  this.documents = [];
  this.errorMessage = '';
  this.successMessage = '';
}
}
