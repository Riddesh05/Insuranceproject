import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://16.176.134.53:8085/api/v1/kyc';

export interface AgentKycRecord {
  kycId: number;
  customerId: number;
  kycNumber: string;
  kycDate: string;
  verificationStatus: string;
  remarks: string | null;
  verifiedBy: number | null;
  verifiedDate: string | null;
}

export interface AgentKycDocument {
  documentId: number;
  kycId: number;
  documentType: string;
  documentNumber: string | null;
  filePath: string | null;
  uploadDate: string;
  verificationStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentKycService {
  private http = inject(HttpClient);

  getKycById(kycId: number): Observable<AgentKycRecord> {
    return this.http.get<AgentKycRecord>(`${API_URL}/${kycId}`);
  }

  getDocuments(kycId: number): Observable<AgentKycDocument[]> {
    return this.http.get<AgentKycDocument[]>(
      `${API_URL}/${kycId}/documents`
    );
  }

  createKyc(customerId: number): Observable<AgentKycRecord> {
    return this.http.post<AgentKycRecord>(API_URL, { customerId });
  }



  resubmitKyc(kycId: number): Observable<AgentKycRecord> {
  return this.http.put<AgentKycRecord>(
    `${API_URL}/${kycId}/resubmit`,
    {}
  );
}

  uploadDocument(
    kycId: number,
    documentType: string,
    documentNumber: string,
    file: File
  ): Observable<AgentKycDocument> {
    const formData = new FormData();
    formData.append('kycId', String(kycId));
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber);
    formData.append('file', file);

    return this.http.post<AgentKycDocument>(
      `${API_URL}/documents`,
      formData
    );
  }
}
