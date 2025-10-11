import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { VerificationError } from "./SubmitDomainVerification";

export class ApproveUserVerification {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, notes?: string): Promise<any> {
    // Get user
    const user: any = await this.userRepository.findById(userId);
    if (!user) {
      throw new VerificationError("User not found", "USER_NOT_FOUND");
    }

    // Check if has pending verification
    if (user.verificationStatus !== "pending") {
      throw new VerificationError(
        "No pending verification found for this user",
        "VERIFICATION_NOT_FOUND"
      );
    }

    // Approve verification
    const updatedUser: any = await this.userRepository.update(userId, {
      verificationStatus: "approved",
      domainVerified: true,
      verificationNotes: notes || "Verification approved",
    });

    return {
      id: updatedUser._id,
      verificationStatus: updatedUser.verificationStatus,
      domainVerified: updatedUser.domainVerified,
      verificationNotes: updatedUser.verificationNotes,
    };
  }
}
