
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://16.176.134.53:8085/api/v1/kyc';

export interface CustomerKyc {
  rejectionRemarks: string | null;
  kycId: number;
  customerId: number;
  kycNumber: string;
  kycDate: string;
  verificationStatus: string;
  remarks: string | null;
  verifiedBy: number | null;
  verifiedDate: string | null;
}


export interface CustomerKycDocument {
  documentId: number;
  kycId: number;
  documentType: string;
  documentNumber: string | null;
  filePath: string | null;
  uploadDate: string;
  verificationStatus: string;
  rejectionRemarks?: string | null;
}


export interface KycHistory {
  logId?: number;
  action?: string;
  remarks?: string | null;
  createdAt?: string;
  timestamp?: string;
  verificationDate?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CustomerKycService {
  private readonly http = inject(HttpClient);

  createKyc(customerId: number): Observable<CustomerKyc> {
    return this.http.post<CustomerKyc>(API_URL, { customerId });
  }

  getKyc(kycId: number): Observable<CustomerKyc> {
    return this.http.get<CustomerKyc>(`${API_URL}/${kycId}`);
  }

  getDocuments(kycId: number): Observable<CustomerKycDocument[]> {
    return this.http.get<CustomerKycDocument[]>(
      `${API_URL}/${kycId}/documents`
    );
  }

  uploadDocument(
    kycId: number,
    documentType: string,
    documentNumber: string,
    file: File
  ): Observable<CustomerKycDocument> {
    const data = new FormData();
    data.append('kycId', String(kycId));
    data.append('documentType', documentType);
    data.append('documentNumber', documentNumber);
    data.append('file', file);

    return this.http.post<CustomerKycDocument>(
      `${API_URL}/documents`,
      data
    );
  }

  resubmitKyc(kycId: number): Observable<CustomerKyc> {
    return this.http.put<CustomerKyc>(
      `${API_URL}/${kycId}/resubmit`,
      {}
    );
  }


getKycByCustomerId(customerId: number): Observable<CustomerKyc> {
  return this.http.get<CustomerKyc>(
    `${API_URL}/customer/${customerId}`
  );
}

  getHistory(kycId: number): Observable<KycHistory[]> {
    return this.http.get<KycHistory[]>(
      `${API_URL}/${kycId}/verification-history`
    );
  }
}
