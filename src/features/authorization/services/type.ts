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
  preferredLanguages: string[]; // ["Python", "JavaScript"]
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
  preferredLanguages?: string[];
}
