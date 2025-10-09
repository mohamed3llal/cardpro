import { IUserRepository } from "@domain/interfaces/IUserRepository";
import { IAuthService } from "@domain/interfaces/IAuthServices";
import { User, UserRole } from "@domain/entities/User";
import { AppError } from "@shared/errors/AppError";
import { OAuth2Client } from "google-auth-library";
import { AuthService } from "../../../infrastructure/services/AuthService";

export interface GoogleAuthDTO {
  token: string; // Google ID token from client
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
    private AuthService: IAuthService,
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

      // Try multiple audience variations like in the old version
      try {
        ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          audience: this.clientId,
        });
      } catch (firstError: any) {
        try {
          ticket = await this.googleClient.verifyIdToken({
            idToken: token,
            audience: [
              this.clientId,
              `${this.clientId.split("-")[0]}-${
                this.clientId.split("-")[1]
              }.apps.googleusercontent.com`,
            ],
          });
        } catch (secondError: any) {
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
      // Enhanced error handling from old version
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
      // Verify Google token using enhanced method
      const googlePayload = await this.verifyGoogleToken(data.token);

      const { email, given_name, family_name, picture } = googlePayload;

      // Check if user exists
      let user = await this.userRepository.findByEmail(email);
      let isNewUser = false;

      if (!user) {
        // Create new user from Google data
        // Ensure lastName meets validation requirements (minimum 2 characters)
        // If family_name is empty or too short, use a default value
        let lastName = family_name?.trim() || "";

        const firstName = given_name?.trim() || "User";

        user = new User({
          email: email,
          firstName: firstName,
          lastName: lastName,
          avatar: picture || undefined,
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        user = await this.userRepository.create(user);
        isNewUser = true;
      } else {
        // Update user info if needed
        if (picture && picture !== user.avatar) {
          user.updateAvatar(picture);
        }

        // Update last login
        user.updateLastLogin();
        await this.userRepository.update(user.id!, user);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError("Your account has been deactivated", 403);
      }

      // Generate tokens
      const accessToken = this.AuthService.generateToken(
        user.id!,
        user.role,
        user.email
      );
      const refreshToken = this.AuthService.generateRefreshToken(
        user.id!,
        user.role,
        user.email
      );

      return {
        accessToken,
        refreshToken,
        user: user,
        isNewUser,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Google authentication error:", error);
      throw new AppError("Google authentication failed", 401);
    }
  }
}
