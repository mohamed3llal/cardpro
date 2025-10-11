// src/application/dtos/VerificationDTO.ts

export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface SubmitDomainVerificationDTO {
  domain_key: string;
  subcategory_key: string;
  document_url: string;
  document_type: string;
}

export interface UserVerificationDTO {
  user_id: string;
  user_name: string;
  user_email: string;
  domain_key: string;
  subcategory_key: string;
  document_url: string;
  document_type: string;
  verification_status: VerificationStatus;
  domain_verified: boolean;
  submitted_at: string;
  reviewed_at?: string;
  verification_notes?: string;
}

export interface ApproveVerificationDTO {
  notes?: string;
}

export interface RejectVerificationDTO {
  notes: string;
}

export interface UpdateProfileDomainDTO {
  domain_key: string;
  subcategory_key: string;
}
