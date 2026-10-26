
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { KycService } from '../../../services/kyc.service';
import {
  KycDetails as KycDetailsModel,
  KycDocument,
  KycVerificationHistory
} from '../../../models/kyc.model';

@Component({
  selector: 'app-kyc-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './kyc-details.html',
  styleUrl: './kyc-details.scss'
})
export class KycDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly kycService = inject(KycService);

  readonly kycId =
    Number(this.route.snapshot.paramMap.get('kycId')) || 1;

  readonly customerId = signal<number | null>(null);
  readonly kycNumber = signal('');
  readonly kycDate = signal('');
  readonly status = signal<KycDetailsModel['verificationStatus']>('Pending');
  readonly remarks = signal<string | null>(null);
  readonly verifiedBy = signal<number | null>(null);
  readonly verifiedDate = signal<string | null>(null);

  readonly documents = signal<KycDocument[]>([]);
  readonly history = signal<KycVerificationHistory[]>([]);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly verifiedDocuments = computed(
    () => this.documents().filter(
      doc => doc.verificationStatus === 'Verified'
    ).length
  );

  readonly allDocumentsVerified = computed(
    () => this.documents().length > 0 &&
      this.documents().every(
        doc => doc.verificationStatus === 'Verified'
      )
  );

  readonly canReview = computed(
    () => this.status() === 'Pending' ||
          this.status() === 'Re_Submitted'
  );

  constructor() {
    this.loadDetails();
  }

  loadDetails(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      kyc: this.kycService.getKycById(this.kycId),
      documents: this.kycService.getDocumentsByKycId(this.kycId),
      history: this.kycService.getVerificationHistory(this.kycId)
    }).subscribe({
      next: ({ kyc, documents, history }) => {
        this.applyKycDetails(kyc);
        this.documents.set(documents);
        this.history.set(history);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load KYC details:', error);
        this.errorMessage.set(
          'Unable to load KYC details. Check the backend and try again.'
        );
        this.isLoading.set(false);
      }
    });
  }

  private applyKycDetails(kyc: KycDetailsModel): void {
    this.customerId.set(kyc.customerId);
    this.kycNumber.set(kyc.kycNumber);
    this.kycDate.set(kyc.kycDate);
    this.status.set(kyc.verificationStatus);
    this.remarks.set(kyc.remarks);
    this.verifiedBy.set(kyc.verifiedBy);
    this.verifiedDate.set(kyc.verifiedDate);
  }

  verifyDocument(documentId: number): void {
    if (!this.canReview() || this.isSaving()) return;

    if (!window.confirm('Verify this document?')) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.kycService.verifyDocument(documentId).subscribe({
      next: updatedDocument => {
        this.documents.update(docs =>
          docs.map(doc =>
            doc.documentId === documentId ? updatedDocument : doc
          )
        );

        this.successMessage.set('Document verified successfully.');
        this.reloadHistory();
        this.isSaving.set(false);
      },
      error: error => this.handleActionError(error)
    });
  }

  rejectDocument(documentId: number): void {
    if (!this.canReview() || this.isSaving()) return;

    const reason = window.prompt(
      'Enter document rejection reason:'
    );

    if (!reason?.trim()) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.kycService.rejectDocument(documentId).subscribe({
      next: updatedDocument => {
        this.documents.update(docs =>
          docs.map(doc =>
            doc.documentId === documentId ? updatedDocument : doc
          )
        );

        this.successMessage.set(
          'Document rejected. Note: the backend currently does not accept a document rejection reason.'
        );
        this.reloadHistory();
        this.isSaving.set(false);
      },
      error: error => this.handleActionError(error)
    });
  }

  approveKyc(): void {
    if (!this.canReview() || this.isSaving()) return;

    if (!this.allDocumentsVerified()) {
      window.alert('Verify all documents before approving this KYC.');
      return;
    }

    if (!window.confirm('Approve this KYC application?')) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.kycService.approveKyc(this.kycId).subscribe({
      next: kyc => {
        this.applyKycDetails(kyc);
        this.successMessage.set('KYC approved successfully.');
        this.reloadHistory();
        this.isSaving.set(false);
      },
      error: error => this.handleActionError(error)
    });
  }

  rejectKyc(): void {
    if (!this.canReview() || this.isSaving()) return;

    const reason = window.prompt('Enter KYC rejection reason:');
    if (!reason?.trim()) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.kycService.rejectKyc(this.kycId, reason.trim()).subscribe({
      next: kyc => {
        this.applyKycDetails(kyc);
        this.successMessage.set('KYC rejected successfully.');
        this.reloadHistory();
        this.isSaving.set(false);
      },
      error: error => this.handleActionError(error)
    });
  }

  resubmitKyc(): void {
    if (this.status() !== 'Rejected' || this.isSaving()) return;

    if (!window.confirm('Resubmit this KYC application?')) return;

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.kycService.resubmitKyc(this.kycId).subscribe({
      next: kyc => {
        this.applyKycDetails(kyc);
        this.successMessage.set('KYC resubmitted successfully.');
        this.loadDocumentsAndHistory();
      },
      error: error => this.handleActionError(error)
    });
  }

  private loadDocumentsAndHistory(): void {
    forkJoin({
      documents: this.kycService.getDocumentsByKycId(this.kycId),
      history: this.kycService.getVerificationHistory(this.kycId)
    }).subscribe({
      next: ({ documents, history }) => {
        this.documents.set(documents);
        this.history.set(history);
        this.isSaving.set(false);
      },
      error: error => this.handleActionError(error)
    });
  }

  private reloadHistory(): void {
    this.kycService.getVerificationHistory(this.kycId).subscribe({
      next: history => this.history.set(history),
      error: error => console.error('Failed to reload history:', error)
    });
  }

  private handleActionError(error: unknown): void {
    console.error('KYC action failed:', error);
    this.errorMessage.set(
      'The action failed. Please check the backend response and try again.'
    );
    this.isSaving.set(false);
  }

  previewDocument(documentId: number): void {
  const url = this.kycService.downloadDocument(documentId);
  window.open(url, '_blank', 'noopener,noreferrer');
}
}
