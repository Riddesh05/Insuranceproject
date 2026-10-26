
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { KycService } from '../../../services/kyc.service';
import { KycDetails, KycStatus } from '../../../models/kyc.model';

@Component({
  selector: 'app-kyc-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './kyc-list.html',
  styleUrl: './kyc-list.scss'
})
export class KycList {
  private readonly kycService = inject(KycService);

  searchText = signal('');
  selectedStatus = signal('All');

  kycRecords = signal<KycDetails[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loadKycRecords();
  }

  loadKycRecords(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.kycService.getAllKyc().subscribe({
      next: (records) => {
        this.kycRecords.set(records);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading KYC records:', error);

        this.errorMessage.set(
          'Unable to load KYC records. Please check whether the backend is running.'
        );

        this.isLoading.set(false);
      }
    });
  }

  filteredRecords = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.kycRecords().filter(record => {
      const matchesSearch =
        `${record.customerId} ${record.kycId} ${record.kycNumber}`
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'All' || record.verificationStatus === status;

      return matchesSearch && matchesStatus;
    });
  });

  totalCount = computed(() => this.kycRecords().length);

  pendingCount = computed(() =>
    this.kycRecords().filter(
      record => record.verificationStatus === 'Pending'
    ).length
  );

  verifiedCount = computed(() =>
    this.kycRecords().filter(
      record => record.verificationStatus === 'Verified'
    ).length
  );

  rejectedCount = computed(() =>
    this.kycRecords().filter(
      record => record.verificationStatus === 'Rejected'
    ).length
  );
}
