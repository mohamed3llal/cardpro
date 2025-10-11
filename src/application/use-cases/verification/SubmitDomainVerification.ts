import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { SubmitDomainVerificationDTO } from "@application/dtos/VerificationDTO";

export class VerificationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "VerificationError";
  }
}

export class SubmitDomainVerification {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    userId: string,
    dto: SubmitDomainVerificationDTO
  ): Promise<any> {
    // Get user
    const user: any = await this.userRepository.findById(userId);
    if (!user) {
      throw new VerificationError("User not found", "USER_NOT_FOUND");
    }

    // Check if domain and subcategory are set in profile
    if (!user.domainKey || !user.subcategoryKey) {
      throw new VerificationError(
        "Please select domain and subcategory in your profile first",
        "VERIFICATION_NO_DOMAIN"
      );
    }

    // Verify domain/subcategory match profile
    if (
      user.domainKey !== dto.domain_key ||
      user.subcategoryKey !== dto.subcategory_key
    ) {
      throw new VerificationError(
        "Domain/subcategory must match your profile selection",
        "VERIFICATION_MISMATCH"
      );
    }

    // Check if already has pending verification
    if (user.verificationStatus === "pending") {
      throw new VerificationError(
        "You already have a pending verification request",
        "VERIFICATION_ALREADY_PENDING"
      );
    }

    // Check if already verified
    if (user.verificationStatus === "approved" && user.domainVerified) {
      throw new VerificationError(
        "Your domain is already verified",
        "VERIFICATION_ALREADY_VERIFIED"
      );
    }

    // Validate document URL (should be Cloudinary URL)
    if (!dto.document_url || !dto.document_url.includes("cloudinary.com")) {
      throw new VerificationError(
        "Invalid document URL. Please upload to Cloudinary first",
        "VERIFICATION_INVALID_DOCUMENT"
      );
    }

    // Update user profile with verification data
    const updatedUser: any = await this.userRepository.update(userId, {
      domainDocumentUrl: dto.document_url,
      verificationStatus: "pending",
      domainVerified: false,
      verificationNotes: null, // Clear any previous rejection notes
    });

    return {
      id: updatedUser._id,
      domainKey: updatedUser.domainKey,
      subcategoryKey: updatedUser.subcategoryKey,
      domainDocumentUrl: updatedUser.domainDocumentUrl,
      verificationStatus: updatedUser.verificationStatus,
      domainVerified: updatedUser.domainVerified,
    };
  }
}
