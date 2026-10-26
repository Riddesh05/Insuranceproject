
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  KycDetails,
  KycDocument,
    KycVerificationHistory
} from '../models/kyc.model';

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/kyc`;

  getAllKyc(): Observable<KycDetails[]> {
    return this.http.get<KycDetails[]>(this.apiUrl);
  }

  getKycById(kycId: number): Observable<KycDetails> {
    return this.http.get<KycDetails>(
      `${this.apiUrl}/${kycId}`
    );
  }

  getDocumentById(documentId: number): Observable<KycDocument> {
    return this.http.get<KycDocument>(
      `${this.apiUrl}/documents/${documentId}`
    );
  }

  

downloadDocument(documentId: number): string {
  return `${this.apiUrl}/documents/${documentId}/file`;
}

getDocumentsByKycId(kycId: number): Observable<KycDocument[]> {
  return this.http.get<KycDocument[]>(
    `${this.apiUrl}/${kycId}/documents`
  );
}


  verifyDocument(documentId: number): Observable<KycDocument> {
    return this.http.put<KycDocument>(
      `${this.apiUrl}/documents/${documentId}/verify`,
      {}
    );
  }

getVerificationHistory(
  kycId: number
): Observable<KycVerificationHistory[]> {
  return this.http.get<KycVerificationHistory[]>(
    `${this.apiUrl}/${kycId}/verification-history`
  );
}

  rejectDocument(documentId: number): Observable<KycDocument> {
    return this.http.put<KycDocument>(
      `${this.apiUrl}/documents/${documentId}/reject`,
      {}
    );
  }

  approveKyc(kycId: number): Observable<KycDetails> {
    return this.http.put<KycDetails>(
      `${this.apiUrl}/${kycId}/approve`,
      {}
    );
  }

  rejectKyc(
    kycId: number,
    remarks: string
  ): Observable<KycDetails> {
    return this.http.put<KycDetails>(
      `${this.apiUrl}/${kycId}/reject`,
      { remarks }
    );
  }


  
  resubmitKyc(kycId: number): Observable<KycDetails> {
    return this.http.put<KycDetails>(
      `${this.apiUrl}/${kycId}/resubmit`,
      {}
    );
  }
}
