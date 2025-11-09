import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp,
  resendSignUpCode,
  autoSignIn,
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

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoPath: string | null;
  programmingLevel: string;
  programmingTechnologies: string[];
}

export interface UpdateProgrammingLevelDto {
  programmingLevel: string;
}

export interface UpdatePreferredTechnologiesDto {
  programmingTechnologies: string[];
}

export interface UpdateRoleDto {
  roleId: string;
}

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
          throw new CognitoError(
            "SMSMFAException",
            "SMS MFA code required"
          );
        }

        if (nextStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
          throw new CognitoError(
            "TOTPMFAException",
            "TOTP MFA code required"
          );
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

  async getCurrentCognitoUser(): Promise<CognitoUser> {
    const { userId, username, signInDetails } = await getCurrentUser();

    return {
      userId,
      username,
      email: signInDetails?.loginId || username,
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

  async createUserProfile(data: CreateUserDto): Promise<User> {
    return await this.httpClient.post<User, CreateUserDto>("/api/users", data);
  }

  async getUserProfile(): Promise<User | null> {
    try {
      const response = await this.httpClient.get<User>(
        "/api/users/get-by-auth"
      );
      return response;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    return await this.httpClient.get<User>(`/api/users/${id}`);
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.httpClient.get<User>(`/api/users/by-email/${email}`);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.httpClient.get<User[]>("/api/users");
  }

  async updateUserProfile(id: string, data: UpdateUserRequest): Promise<User> {
    return await this.httpClient.put<User, UpdateUserRequest>(
      `/api/users/${id}`,
      data
    );
  }

  async updateProgrammingLevel(
    id: string,
    data: UpdateProgrammingLevelDto
  ): Promise<User> {
    return await this.httpClient.put<User, UpdateProgrammingLevelDto>(
      `/api/users/${id}/programming-level`,
      data
    );
  }

  async updatePreferredTechnologies(
    id: string,
    data: UpdatePreferredTechnologiesDto
  ): Promise<User> {
    return await this.httpClient.put<User, UpdatePreferredTechnologiesDto>(
      `/api/users/${id}/preferred-technologies`,
      data
    );
  }

  async updateUserRole(id: string, data: UpdateRoleDto): Promise<User> {
    return await this.httpClient.put<User, UpdateRoleDto>(
      `/api/users/${id}/role`,
      data
    );
  }

  async deleteUser(id: string): Promise<void> {
    return await this.httpClient.delete<void>(`/api/users/${id}`);
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await this.httpClient.post<
      { photoPath: string },
      FormData
    >("/api/users/profile-photo", formData);

    return response.photoPath;
  }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    return await this.httpClient.put<User>("/api/users/profile", data);
  }
}

export const createUserService = (signal?: AbortSignal) => {
  return new UserService(signal);
};