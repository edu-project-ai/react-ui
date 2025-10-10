import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import { HttpClient } from "../../../lib/http";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  CognitoUser,
  UpdateUserRequest,
} from "./type";

export class UserService {
  private httpClient: HttpClient;

  constructor(signal?: AbortSignal) {
    this.httpClient = new HttpClient(
      {
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 10000,
      },
      signal
    );
  }

  /**
   * Sign up new user
   * No try-catch needed - errors bubble up to Redux Slice
   */
  async signUp(
    data: SignUpRequest
  ): Promise<{ userId: string; isConfirmed: boolean }> {
    const { isSignUpComplete, userId } = await signUp({
      username: data.email,
      password: data.password,
      options: {
        userAttributes: {
          email: data.email,
          given_name: data.firstName,
          family_name: data.lastName,
          name: data.displayName,
        },
      },
    });

    return {
      userId: userId || "",
      isConfirmed: isSignUpComplete,
    };
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  }

  async resendConfirmationCode(email: string): Promise<void> {
    await resendSignUpCode({
      username: email,
    });
  }

  /**
   * Sign in user
   * try-catch IS needed here because we:
   * 1. Create custom errors (if !isSignedIn, if !idToken)
   * 2. Can add error transformation for better UX in future
   *
   * NOTE: We DON'T manually store tokens - AWS Cognito manages this
   */
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      // 1. Authenticate with Cognito
      const { isSignedIn } = await signIn({
        username: data.email,
        password: data.password,
      });

      // ✅ Custom error for better UX
      if (!isSignedIn) {
        throw new Error("Sign in failed");
      }

      // 2. Get Cognito user and token
      const cognitoUser = await this.getCurrentCognitoUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      // ✅ Another custom error
      if (!idToken) {
        throw new Error("Failed to get ID token");
      }

      // 3. Create user object from Cognito data
      // TODO: Later sync with backend when API is ready
      const user: User = {
        id: cognitoUser.userId,
        email: cognitoUser.email,
        cognitoSub: cognitoUser.userId,
        firstName: "",
        lastName: "",
        displayName: cognitoUser.username,
        programmingLevel: "beginner",
        preferredLanguages: [],
        accountStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // ✅ NO manual token storage - AWS Cognito handles this
      // HttpClient will fetch token dynamically via token-provider

      return {
        user,
        token: idToken,
      };
    } catch (error) {
      // Error bubbles up to Redux Slice
      // TODO: Can add error transformation here (AWS Cognito → user-friendly)
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await signOut();
  }

  async getCurrentCognitoUser(): Promise<CognitoUser> {
    const { userId, username, signInDetails } = await getCurrentUser();

    return {
      userId,
      username,
      email: signInDetails?.loginId || username,
    };
  }

  /**
   * Get current token from AWS Cognito
   * This is for special cases - normally HttpClient gets token automatically
   */
  async getCurrentToken(): Promise<string | undefined> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Sync Cognito user with backend database
   * TODO: Enable when backend API is ready
   */
  // private async syncUserWithBackend(cognitoUser: CognitoUser): Promise<User> {
  //   try {
  //     // Try to get existing user from backend
  //     const user = await this.httpClient.get<User>("/api/users/profile");

  //     // Update last login
  //     await this.httpClient.patch<User>("/api/users/profile", {
  //       lastLoginAt: new Date().toISOString(),
  //     });

  //     return user;
  //   } catch (error: unknown) {
  //     // If user doesn't exist in backend, create it
  //     if (error && typeof error === "object" && "response" in error) {
  //       const axiosError = error as { response?: { status?: number } };
  //       if (axiosError.response?.status === 404) {
  //         return await this.createUserInBackend(cognitoUser);
  //       }
  //     }
  //     throw error;
  //   }
  // }

  /**
   * Create user in backend (for future use)
   * TODO: Enable when backend API is ready
   */
  // private async createUserInBackend(cognitoUser: CognitoUser): Promise<User> {
  //   try {
  //     const newUser = await this.httpClient.post<User>("/api/users", {
  //       email: cognitoUser.email,
  //       cognitoSub: cognitoUser.userId,
  //       firstName: "", // Will be updated from Cognito attributes or profile
  //       lastName: "",
  //       displayName: cognitoUser.username,
  //     });
  //
  //     return newUser;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  /**
   * Get user profile from backend
   * TODO: Enable when backend API is ready
   */
  // async getUserProfile(): Promise<User> {
  //   return await this.httpClient.get<User>("/api/users/profile");
  // }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return await this.httpClient.put<User>("/api/users/profile", data);
  }
}

export const createUserService = (signal?: AbortSignal) => {
  return new UserService(signal);
};
