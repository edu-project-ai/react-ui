import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
  autoSignIn,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  AuthResponse,
  CognitoUser,
} from "./type";

/**
 * Custom error class for AWS Cognito errors
 * Preserves the __type field for proper error handling
 */
class CognitoError extends Error {
  public readonly __type: string;
  public readonly originalMessage: string;

  constructor(type: string, message: string) {
    super(message);
    this.__type = type;
    this.originalMessage = message;
    this.name = "CognitoError";
  }

  toJSON() {
    return {
      __type: this.__type,
      message: this.originalMessage,
    };
  }
}

/**
 * Auth Service - AWS Cognito Operations
 * This service handles all AWS Cognito authentication operations.
 * It does NOT make backend API calls - use userApi.ts for that.
 */
export class AuthService {
  async signUp(data: SignUpRequest): Promise<{
    userId: string;
    isConfirmed: boolean;
    nextStep: string;
    userConfirmed: boolean;
  }> {
    const signUpResult = await signUp({
      username: data.email,
      password: data.password,
      options: {
        userAttributes: {
          email: data.email,
          given_name: data.firstName,
          family_name: data.lastName,
          name: data.displayName,
        },
        autoSignIn: true,
      },
    });

    const { isSignUpComplete, userId, nextStep } = signUpResult;

    return {
      userId: userId || "",
      isConfirmed: isSignUpComplete,
      nextStep: nextStep.signUpStep,
      userConfirmed: isSignUpComplete,
    };
  }

  async autoSignIn(): Promise<AuthResponse> {
    const result = await autoSignIn();

    if (!result.isSignedIn) {
      throw new CognitoError(
        "AutoSignInException",
        "Auto sign-in failed. Please sign in manually."
      );
    }

    const cognitoUser = await this.getCurrentCognitoUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      throw new CognitoError("TokenException", "Failed to get ID token");
    }

    const user: User = {
      id: cognitoUser.userId,
      email: cognitoUser.email,
      cognitoSub: cognitoUser.userId,
      firstName: "",
      lastName: "",
      displayName: cognitoUser.username,
      programmingLevel: "beginner",
      programmingTechnologies: [],
      accountStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user,
      token: idToken,
    };
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  }

  async resendSignUpCode(email: string): Promise<void> {
    await resendSignUpCode({
      username: email,
    });
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const signInResult = await signIn({
        username: data.email,
        password: data.password,
      });

      if (!signInResult.isSignedIn) {
        const nextStep = signInResult.nextStep?.signInStep;

        if (nextStep === "CONFIRM_SIGN_UP") {
          throw new CognitoError(
            "UserNotConfirmedException",
            "User is not confirmed."
          );
        }

        if (nextStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE") {
          throw new CognitoError("SMSMFAException", "SMS MFA code required");
        }

        if (nextStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
          throw new CognitoError("TOTPMFAException", "TOTP MFA code required");
        }

        if (nextStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
          throw new CognitoError(
            "PasswordResetRequiredException",
            "Password reset required"
          );
        }

        // Unknown step
        throw new CognitoError(
          "SignInIncompleteException",
          `Sign-in incomplete: ${nextStep || "unknown step"}`
        );
      }

      const cognitoUser = await this.getCurrentCognitoUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new CognitoError("TokenException", "Failed to get ID token");
      }

      const user: User = {
        id: cognitoUser.userId,
        email: cognitoUser.email,
        cognitoSub: cognitoUser.userId,
        firstName: "",
        lastName: "",
        displayName: cognitoUser.username,
        programmingLevel: "beginner",
        programmingTechnologies: [],
        accountStatus: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        user,
        token: idToken,
      };
    } catch (error: unknown) {
      if (error instanceof CognitoError) {
        throw error;
      }
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const errorName = error.name.toLowerCase();
        if (
          errorName.includes("usernotfound") ||
          errorMessage.includes("user does not exist")
        ) {
          throw new CognitoError(
            "UserNotFoundException",
            "User does not exist."
          );
        }
        if (
          errorName.includes("notauthorized") ||
          errorMessage.includes("incorrect username or password")
        ) {
          throw new CognitoError(
            "NotAuthorizedException",
            "Incorrect username or password."
          );
        }
        if (
          errorName.includes("toomanyrequests") ||
          errorMessage.includes("attempt limit exceeded")
        ) {
          throw new CognitoError(
            "TooManyRequestsException",
            "Too many failed attempts. Please try again later."
          );
        }
        if (
          errorName.includes("usernotconfirmed") ||
          errorMessage.includes("not confirmed")
        ) {
          throw new CognitoError(
            "UserNotConfirmedException",
            "User is not confirmed."
          );
        }
        if (
          errorMessage.includes("network") ||
          errorMessage.includes("fetch")
        ) {
          throw new CognitoError(
            "NetworkException",
            "Network error. Please check your connection."
          );
        }
        throw new CognitoError("UnknownException", error.message);
      }
      throw new CognitoError("UnknownException", "An unknown error occurred");
    }
  }

  async signOut(): Promise<void> {
    await signOut();
  }

  async resetPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  }

  async confirmResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
  }

  async getCurrentCognitoUser(): Promise<CognitoUser> {
    const { userId, username, signInDetails } = await getCurrentUser();

    // Try to get email from signInDetails first
    let email = signInDetails?.loginId;

    // If email is not available or looks like a Google ID, try to get it from JWT token
    if (!email || !email.includes('@') || email.toLowerCase().startsWith('google_')) {
      try {
        const session = await fetchAuthSession();
        const tokenEmail = session.tokens?.idToken?.payload?.email as string | undefined;
        if (tokenEmail) {
          email = tokenEmail;
        }
      } catch (error) {
        console.warn("Failed to extract email from JWT token:", error);
      }
    }

    // Fallback to username only if it looks like an email
    if (!email || !email.includes('@')) {
      if (username.includes('@')) {
        email = username;
      }
    }

    return {
      userId,
      username,
      email: email || username, // Final fallback to username if nothing else works
    };
  }

  async getCurrentToken(): Promise<string | undefined> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Get current user and token from Cognito session
   * This is a utility method used after sign-in operations
   */
  async getCurrentAuthResponse(): Promise<AuthResponse> {
    const cognitoUser = await this.getCurrentCognitoUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      throw new CognitoError("TokenException", "Failed to get ID token");
    }

    const user: User = {
      id: cognitoUser.userId,
      email: cognitoUser.email,
      cognitoSub: cognitoUser.userId,
      firstName: "",
      lastName: "",
      displayName: cognitoUser.username,
      programmingLevel: "beginner",
      programmingTechnologies: [],
      accountStatus: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user,
      token: idToken,
    };
  }
}

export const authService = new AuthService();
