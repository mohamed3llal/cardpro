// src/application/use-cases/auth/GoogleAuth.ts - FIXED VERSION

import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { IPackageRepository } from "@domain/interfaces/IPackageRepository";
import { User, UserRole, VerificationStatus } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";
import { OAuth2Client } from "google-auth-library";

export interface GoogleAuthDTO {
  token: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
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
    private packageRepository: IPackageRepository,
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

      try {
        ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          audience: this.clientId,
        });
      } catch (firstError: any) {
        try {
          const alternativeAudience = `${this.clientId.split("-")[0]}-${
            this.clientId.split("-")[1]
          }.apps.googleusercontent.com`;

          ticket = await this.googleClient.verifyIdToken({
            idToken: token,
            audience: [this.clientId, alternativeAudience],
          });
        } catch (secondError: any) {
          ticket = await this.googleClient.verifyIdToken({
            idToken: token,
          });
        }
      }

      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email) {
        throw new AppError("Invalid Google token payload", 401);
      }

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
      const googlePayload = await this.verifyGoogleToken(data.token);
      const { email, given_name, family_name, picture } = googlePayload;

      let user = await this.userRepository.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        // Create new user
        const firstName = given_name?.trim() || "User";
        let lastName = family_name?.trim() || "";

        if (lastName.length < 2) {
          const nameParts = googlePayload.name?.trim().split(" ") || [];
          if (nameParts.length > 1) {
            lastName = nameParts.slice(1).join(" ");
          }
          if (lastName.length < 2) {
            lastName = "User";
          }
        }

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

        user = await this.userRepository.create(newUserData);
        isNewUser = true;

        // ✅ AUTO-SUBSCRIBE TO FREE PLAN (FIXED)
        try {
          // Check if user already has a subscription (race condition protection)
          const existingSubscription =
            await this.packageRepository.getUserActiveSubscription(user.id!);

          if (!existingSubscription) {
            // Find the free package
            const packages = await this.packageRepository.getAllPackages(false);
            const freePlan = packages.find((pkg) => pkg.tier === "free");

            if (freePlan) {
              // ✅ FIX: Create subscription
              const subscription =
                await this.packageRepository.createSubscription({
                  userId: user.id!,
                  packageId: freePlan.id,
                });

              console.log(`✅ Auto-subscribed user ${user.id} to free plan`);

              // ✅ CRITICAL: Create usage tracking
              try {
                await this.packageRepository.createPackageUsage(
                  user.id!,
                  freePlan.id
                );
                console.log(`✅ Package usage created for user ${user.id}`);
              } catch (usageError) {
                console.error(
                  `❌ Failed to create usage for user ${user.id}:`,
                  usageError
                );
                // Rollback subscription if usage creation fails
                await this.packageRepository.cancelSubscription(
                  subscription.id,
                  true
                );
                throw new Error("Failed to initialize user subscription");
              }
            } else {
              console.warn(
                "⚠️ Free plan not found, user created without subscription"
              );
            }
          } else {
            console.log(
              `ℹ️ User ${user.id} already has a subscription, skipping auto-subscribe`
            );
          }
        } catch (subError) {
          console.error("Failed to auto-subscribe user:", subError);
          // Don't fail user creation if subscription fails
        }
      } else {
        // Update existing user
        const updateData: any = {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        };

        if (picture && picture !== user.avatar) {
          updateData.avatar = picture;
        }

        const updatedUser = await this.userRepository.update(
          user.id!,
          updateData
        );
        if (updatedUser) {
          user = updatedUser;
        }
      }

      if (!user.isActive) {
        throw new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        );
      }

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
