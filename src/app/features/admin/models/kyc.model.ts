
export type KycStatus =
  | 'Pending'
  | 'Verified'
  | 'Rejected'
  | 'Re_Submitted';

export interface KycDetails {
  kycId: number;
  customerId: number;
  kycNumber: string;
  kycDate: string;
  verificationStatus: KycStatus;
  remarks: string | null;
  verifiedBy: number | null;
  verifiedDate: string | null;
}

export type DocumentVerificationStatus =
  | 'Pending'
  | 'Verified'
  | 'Rejected';

export interface KycDocument {
  documentId: number;
  kycId: number;
  documentType: string;
  documentNumber: string | null;
  filePath: string | null;
  uploadDate: string;
  verificationStatus: DocumentVerificationStatus;
}


export interface KycVerificationHistory {
  logId: number;
  kycId: number;
  action: string;
  performedBy: number | null;
  actionDate: string;
  remarks: string | null;
}
