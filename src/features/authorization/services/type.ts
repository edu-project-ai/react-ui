/**
 * AWS Cognito User attributes
 */
export interface CognitoUser {
  userId: string; // Cognito Sub
  username: string;
  email: string;
  email_verified?: boolean;
}

/**
 * User model (mapped from backend API + Cognito)
 */
export interface User {
  id: string; // UUID from DB
  email: string;
  cognitoSub: string; // AWS Cognito Subject ID
  firstName: string;
  lastName: string;
  displayName: string;
  photoPath?: string;
  programmingLevel: "beginner" | "intermediate" | "advanced";
  programmingTechnologies: string[]; // Slug format: ["python", "javascript", "csharp"]
  currentLearningPathId?: string;
  accountStatus: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User with JWT token
 */
export interface UserWithToken extends User {
  token: string;
}

/**
 * Sign up request
 */
export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string; // Displayed name for the user
}

/**
 * Sign in request
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Update user profile request
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoPath?: string;
  programmingLevel?: "beginner" | "intermediate" | "advanced";
  programmingTechnologies?: string[]; // Slug format: ["python", "javascript", "csharp"]
}

/**
 * Cognito error types
 */
export type CognitoErrorType =
  | "NOT_CONFIRMED"
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "TOO_MANY_ATTEMPTS"
  | "INVALID_CODE"
  | "EXPIRED_CODE"
  | "WEAK_PASSWORD"
  | "USER_EXISTS"
  | "NETWORK_ERROR"
  | "UNKNOWN";

/**
 * Sign up response from service (matches what UserService.signUp returns)
 */
export interface SignUpResponse {
  userId: string;
  isConfirmed: boolean;
  nextStep: string;
  userConfirmed: boolean;
}

/**
 * Sign in result
 */
export interface SignInResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
  needsConfirmation?: boolean;
  errorType?: CognitoErrorType;
}

/**
 * Sign up result
 */
export interface SignUpResult {
  success: boolean;
  data?: SignUpResponse;
  error?: string;
  errorType?: CognitoErrorType;
}

/**
 * Confirm sign up result
 */
export interface ConfirmSignUpResult {
  success: boolean;
  data?: void;
  error?: string;
}

/**
 * Resend code result
 */
export interface ResendCodeResult {
  success: boolean;
  error?: string;
}

/**
 * Auto sign in result
 */
export interface AutoSignInResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

/**
 * Sign out result
 */
export interface SignOutResult {
  success: boolean;
  error?: string;
}

/**
 * Get profile result
 */
export interface GetProfileResult {
  success: boolean;
  data?: User;
  error?: string;
}

/**
 * Update profile result
 */
export interface UpdateProfileResult {
  success: boolean;
  data?: User;
  error?: string;
};