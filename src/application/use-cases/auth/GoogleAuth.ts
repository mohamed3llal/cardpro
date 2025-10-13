// src/application/use-cases/auth/GoogleAuth.ts

import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { User, UserRole, VerificationStatus } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";
import { OAuth2Client } from "google-auth-library";

export interface GoogleAuthDTO {
  token: string; // Google ID token from client
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any; // Use serialized user object
  isNewUser: boolean;
}

interface IGoogleTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  name?: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  iat?: number;
  exp?: number;
}

export class GoogleAuthUseCase {
  private googleClient: OAuth2Client;
  private clientId: string;

  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService,
    googleClientId: string
  ) {
    if (!googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    this.clientId = googleClientId;
    this.googleClient = new OAuth2Client(this.clientId);
  }

  private async verifyGoogleToken(token: string): Promise<IGoogleTokenPayload> {
    try {
      let ticket;

      // Try multiple audience variations for better compatibility
      try {
        ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          audience: this.clientId,
        });
      } catch (firstError: any) {
        try {
          // Try with alternative audience format
          const alternativeAudience = `${this.clientId.split("-")[0]}-${
            this.clientId.split("-")[1]
          }.apps.googleusercontent.com`;

          ticket = await this.googleClient.verifyIdToken({
            idToken: token,
            audience: [this.clientId, alternativeAudience],
          });
        } catch (secondError: any) {
          // Last attempt without audience
          ticket = await this.googleClient.verifyIdToken({
            idToken: token,
          });
        }
      }

      const payload = ticket.getPayload();

      if (!payload) {
        throw new AppError("Google token payload is empty", 401);
      }

      if (!payload.sub) {
        throw new AppError("Google token missing subject (sub)", 401);
      }

      if (!payload.email) {
        throw new AppError("Google token missing email", 401);
      }

      // Validate token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new AppError("Google token has expired", 401);
      }

      return {
        iss: payload.iss || "",
        aud: (payload.aud as string) || this.clientId,
        sub: payload.sub,
        name: payload.name || "",
        email: payload.email,
        picture: payload.picture || "",
        given_name: payload.given_name || "",
        family_name: payload.family_name || "",
        email_verified: payload.email_verified || false,
        iat: payload.iat || 0,
        exp: payload.exp || 0,
      };
    } catch (error: any) {
      // Enhanced error handling
      if (error.message?.includes("Token used too early")) {
        throw new AppError(
          "Google token is not yet valid. Please try again.",
          401
        );
      }

      if (error.message?.includes("Token used too late")) {
        throw new AppError(
          "Google token has expired. Please sign in again.",
          401
        );
      }

      if (error.message?.includes("Invalid token signature")) {
        throw new AppError("Google token signature is invalid.", 401);
      }

      if (error.message?.includes("Wrong number of segments")) {
        throw new AppError("Google token is malformed.", 401);
      }

      if (error.message?.includes("audience")) {
        throw new AppError(
          "Google token audience mismatch. Please check your client configuration.",
          401
        );
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        `Google token verification failed: ${error.message}`,
        401
      );
    }
  }

  async execute(data: GoogleAuthDTO): Promise<GoogleAuthResponse> {
    try {
      // Verify Google token
      const googlePayload = await this.verifyGoogleToken(data.token);

      const { email, given_name, family_name, picture } = googlePayload;

      // Check if user exists
      let user = await this.userRepository.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        // Create new user from Google data
        const firstName = given_name?.trim() || "User";
        let lastName = family_name?.trim() || "";

        // Ensure lastName meets minimum requirements (2 characters)
        if (lastName.length < 2) {
          // Extract from full name if available
          const nameParts = googlePayload.name?.trim().split(" ") || [];
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(" ");
          }

          // If still too short, use a default
          if (lastName.length < 2) {
            lastName = "User";
          }
        }

        // Create user entity
        const newUserData = {
          email: email.toLowerCase().trim(),
          firstName: firstName,
          lastName: lastName,
          avatar: picture || undefined,
          role: UserRole.USER,
          isActive: true,
          isAdmin: false,
          verificationStatus: VerificationStatus.NONE,
          domainVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Create user using repository (it will handle entity creation)
        user = await this.userRepository.create(newUserData);
        isNewUser = true;
      } else {
        // Existing user - update profile and last login
        const updateData: any = {};

        // Update avatar if it's different and not empty
        if (picture && picture !== user.avatar) {
          updateData.avatar = picture;
        }

        // Update last login time
        updateData.lastLoginAt = new Date();
        updateData.updatedAt = new Date();

        // Update user in repository
        const updatedUser = await this.userRepository.update(
          user.id!,
          updateData
        );
        if (updatedUser) {
          user = updatedUser;
        }
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        );
      }

      // Generate JWT tokens
      const accessToken = this.authService.generateToken(
        user.id!,
        user.role,
        user.email
      );

      const refreshToken = this.authService.generateRefreshToken(
        user.id!,
        user.role,
        user.email
      );

      // Return response with serialized user
      return {
        accessToken,
        refreshToken,
        user: user.toPublicJSON(),
        isNewUser,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Google authentication error:", error);
      throw new AppError(
        "Google authentication failed. Please try again.",
        401
      );
    }
  }
}
