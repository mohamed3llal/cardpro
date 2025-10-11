import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { VerificationError } from "./SubmitDomainVerification";

export class RejectUserVerification {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, notes: string): Promise<any> {
    if (!notes || notes.trim().length === 0) {
      throw new VerificationError(
        "Rejection notes are required",
        "VERIFICATION_NOTES_REQUIRED"
      );
    }

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

    // Reject verification
    const updatedUser: any = await this.userRepository.update(userId, {
      verificationStatus: "rejected",
      domainVerified: false,
      verificationNotes: notes,
    });

    return {
      id: updatedUser._id,
      verificationStatus: updatedUser.verificationStatus,
      domainVerified: updatedUser.domainVerified,
      verificationNotes: updatedUser.verificationNotes,
    };
  }
}
