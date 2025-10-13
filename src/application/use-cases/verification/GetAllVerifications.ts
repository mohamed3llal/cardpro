import { IUserRepository } from "@domain/interfaces/IUserRepository";
import {
  UserVerificationDTO,
  VerificationStatus,
} from "@application/dtos/VerificationDTO";

export class GetAllVerifications {
  constructor(private userRepository: IUserRepository) {}

  async execute(status?: VerificationStatus): Promise<UserVerificationDTO[]> {
    let users;

    if (status) {
      users = await this.userRepository.findByVerificationStatus(status);
    } else {
      // Get all users with any verification status (pending, approved, rejected)
      users = await this.userRepository.findWithVerification();
    }

    return users.map((user: any) => ({
      user_id: user.id,
      user_name: `${user.firstName} ${user.lastName}`,
      user_email: user.email,
      domain_key: user.domainKey || "",
      subcategory_key: user.subcategoryKey || "",
      document_url: user.domainDocumentUrl || "",
      document_type: this.getDocumentType(user.domainDocumentUrl),
      verification_status: user.verificationStatus || "none",
      domain_verified: user.domainVerified || false,
      submitted_at: user.createdAt?.toISOString() || new Date().toISOString(),
      reviewed_at: user.updatedAt?.toISOString(),
      verification_notes: user.verificationNotes,
    }));
  }

  private getDocumentType(url?: string): string {
    if (!url) return "unknown";
    if (url.includes(".pdf")) return "application/pdf";
    if (url.includes(".jpg") || url.includes(".jpeg")) return "image/jpeg";
    if (url.includes(".png")) return "image/png";
    if (url.includes(".webp")) return "image/webp";
    return "unknown";
  }
}
