import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { toast } from "react-hot-toast";
import { useUpdateProfileMutation } from "../api/userApi";
import { checkUserProfileExists } from "../utils/profile-checker";
import type { RootState } from "@/store/reducers/index";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  UpdateUserRequest,
  SignInResult,
  SignUpResult,
  ConfirmSignUpResult,
  ResendCodeResult,
  AutoSignInResult,
  SignOutResult,
  UpdateProfileResult,
  SignUpResponse,
  AuthResponse,
} from "../services/type";
import {
  signUp as signUpAction,
  confirmSignUp as confirmSignUpAction,
  resendSignUpCode as resendSignUpCodeAction,
  signIn as signInAction,
  autoSignIn as autoSignInAction,
  signOut as signOutAction,
  setCurrentUser,
  clearError,
  toggleTheme,
  setTheme,
} from "../store/user.slice";
import { parseCognitoError } from "../utils/cognito-errors";

/**
 * useUser Hook - Authorization State Management
 * 
 * WHAT THIS HOOK PROVIDES:
 * - Local state: currentUser (from Cognito), isAuthenticated, theme
 * - Cognito operations: signUp, signIn, signOut, confirmSignUp
 * - Backend mutations: updateProfile (RTK Query)
 * 
 * WHAT THIS HOOK DOES NOT PROVIDE:
 * - ❌ Auto-fetching user profile from backend (use useGetUserProfileQuery directly)
 * - ❌ Backend queries (use RTK Query hooks from userApi.ts directly)
 * 
 * WHY NO AUTO-FETCHING?
 * - Avoids unnecessary 401 errors when user is not authenticated
 * - Components should explicitly call useGetUserProfileQuery when needed
 * - Keeps hook lightweight and focused on actions, not data fetching
 * 
 * EXAMPLE USAGE:
 * ```tsx
 * // For auth state and actions
 * const { user, isAuthenticated, signIn, signOut } = useUser();
 * 
 * // For backend profile data (when needed)
 * const { data: profile, isLoading } = useGetUserProfileQuery();
 * ```
 */
export const useUser = () => {
  const dispatch = useAppDispatch();

  const [updateProfileMutation, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  const user = useAppSelector((state: RootState) => state.user?.currentUser);
  const loading = useAppSelector((state: RootState) => state.user?.loading);
  const error = useAppSelector((state: RootState) => state.user?.error);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user?.isAuthenticated
  );
  const theme = useAppSelector((state: RootState) => state.user?.theme);

  /**
   * Sign up new user
   * @returns Result object with success status
   */
  const signUp = async (data: SignUpRequest): Promise<SignUpResult> => {
    const result = await dispatch(signUpAction(data));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Account created successfully!");
      return {
        success: true,
        data: result.payload as SignUpResponse,
      };
    }

    const errorMessage = (result.payload as string) || "Sign up failed";
    const errorType = parseCognitoError(errorMessage);

    switch (errorType.type) {
      case "USER_EXISTS":
        toast.error("An account with this email already exists");
        return {
          success: false,
          error: errorType.message,
          errorType: "USER_EXISTS",
        };

      case "WEAK_PASSWORD":
        toast.error("Password does not meet requirements");
        return {
          success: false,
          error: errorType.message,
          errorType: "WEAK_PASSWORD",
        };

      default:
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
    }
  };

  /**
   * Confirm sign up with code
   * @returns Result object with success status
   */
  const confirmSignUp = async (
    email: string,
    code: string
  ): Promise<ConfirmSignUpResult> => {
    const result = await dispatch(confirmSignUpAction({ email, code }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Email confirmed successfully!");
      return {
        success: true,
        data: undefined,
      };
    }

    const errorMessage = (result.payload as string) || "Confirmation failed";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  /**
   * Resend sign up code
   * @returns Result object with success status
   */
  const resendSignUpCode = async (email: string): Promise<ResendCodeResult> => {
    const result = await dispatch(resendSignUpCodeAction({ email }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Confirmation code sent!");
      return {
        success: true,
      };
    }

    const errorMessage = (result.payload as string) || "Failed to resend code";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  /**
   * Sign in user
   * @returns Result object with success status
   */
  const signIn = async (data: SignInRequest): Promise<SignInResult> => {
    const result = await dispatch(signInAction(data));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Welcome back!");
      return {
        success: true,
        data: result.payload as AuthResponse,
      };
    }

    const errorMessage = (result.payload as string) || "Sign in failed";
    const errorType = parseCognitoError(errorMessage);

    switch (errorType.type) {
      case "NOT_CONFIRMED":
        return {
          success: false,
          error: errorMessage,
          needsConfirmation: true,
        };

      case "INVALID_CREDENTIALS":
        toast.error("Invalid email or password");
        return {
          success: false,
          error: errorType.message,
          errorType: "INVALID_CREDENTIALS",
        };

      case "TOO_MANY_ATTEMPTS":
        toast.error("Too many failed attempts. Please try again later.");
        return {
          success: false,
          error: errorType.message,
          errorType: "TOO_MANY_ATTEMPTS",
        };

      case "USER_NOT_FOUND":
        toast.error("No account found with this email");
        return {
          success: false,
          error: errorType.message,
          errorType: "USER_NOT_FOUND",
        };

      default:
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
    }
  };

  /**
   * Auto sign in using AWS Cognito (after email confirmation)
   * @returns Result object with success status
   */
  const autoSignIn = async (): Promise<AutoSignInResult> => {
    const result = await dispatch(autoSignInAction());

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload as AuthResponse,
      };
    }

    const errorMessage = (result.payload as string) || "Auto sign-in failed";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  /**
   * Sign out user
   * @returns Result object with success status
   */
  const signOut = async (): Promise<SignOutResult> => {
    const result = await dispatch(signOutAction());

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Signed out successfully");
      return { success: true };
    }

    const errorMessage = (result.payload as string) || "Sign out failed";
    toast.error(errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  };

  /**
   * Update user profile using RTK Query
   * @returns Result object with success status
   */
  const updateProfile = async (
    data: UpdateUserRequest
  ): Promise<UpdateProfileResult> => {
    try {
      const updatedUser = await updateProfileMutation(data).unwrap();
      toast.success("Profile updated successfully!");
      return {
        success: true,
        data: updatedUser,
      };
    } catch (error) {
      const errorMessage = "Failed to update profile";
      toast.error(errorMessage);
      console.error("Update profile error:", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  /**
   * Set current user (sync action)
   */
  const setUser = (user: User | null) => {
    dispatch(setCurrentUser(user));
  };

  /**
   * Clear error message
   */
  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  /**
   * Toggle theme between light and dark
   */
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  /**
   * Set specific theme
   */
  const handleSetTheme = (theme: "light" | "dark") => {
    dispatch(setTheme(theme));
  };

  /**
   * Check if user has completed profile
   */
  const hasProfile = async () => {
    return await checkUserProfileExists();
  };

  return {
    // State from Redux Slice
    user, // Current user from Cognito (minimal data: id, email, username)
    loading: loading || isUpdatingProfile,
    error,
    isAuthenticated,
    theme,
    isUpdatingProfile,

    // Actions
    signUp,
    confirmSignUp,
    resendSignUpCode,
    signIn,
    autoSignIn,
    signOut,
    updateProfile,
    setUser,
    hasProfile,
    clearError: clearErrorMessage,
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };
};
