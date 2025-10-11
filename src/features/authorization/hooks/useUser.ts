import { useAppDispatch, useAppSelector } from "../../../hooks";
import type {
  User,
  SignUpRequest,
  SignInRequest,
  UpdateUserRequest,
} from "../services/type";
import {
  signUp as signUpAction,
  confirmSignUp as confirmSignUpAction,
  signIn as signInAction,
  signOut as signOutAction,
  fetchUserProfile,
  updateUserProfile,
  setCurrentUser,
  clearError,
  toggleTheme,
  setTheme,
} from "../store/user.slice";

export const useUser = () => {
  const dispatch = useAppDispatch();


  const user = useAppSelector((state) => state.user?.currentUser);
  const loading = useAppSelector((state) => state.user?.loading);
  const error = useAppSelector((state) => state.user?.error);
  const isAuthenticated = useAppSelector(
    (state) => state.user?.isAuthenticated
  );
  const theme = useAppSelector((state) => state.user?.theme);

  /**
   * Sign up new user
   * @returns Result object with success status
   */
  const signUp = async (data: SignUpRequest) => {
    const result = await dispatch(signUpAction(data));

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: (result.payload as string) || "Sign up failed",
    };
  };

  /**
   * Confirm sign up with code
   * @returns Result object with success status
   */
  const confirmSignUp = async (email: string, code: string) => {
    const result = await dispatch(confirmSignUpAction({ email, code }));

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: (result.payload as string) || "Confirmation failed",
    };
  };

  /**
   * Sign in user
   * @returns Result object with success status
   */
  const signIn = async (data: SignInRequest) => {
    const result = await dispatch(signInAction(data));

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: (result.payload as string) || "Sign in failed",
    };
  };

  /**
   * Sign out user
   * @returns Result object with success status
   */
  const signOut = async () => {
    const result = await dispatch(signOutAction());

    if (result.meta.requestStatus === "fulfilled") {
      return { success: true };
    }

    return {
      success: false,
      error: (result.payload as string) || "Sign out failed",
    };
  };

  /**
   * Get current user profile
   * @returns Result object with success status
   */
  const getProfile = async () => {
    const result = await dispatch(fetchUserProfile());

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: (result.payload as string) || "Failed to fetch profile",
    };
  };

  /**
   * Update user profile
   * @returns Result object with success status
   */
  const updateProfile = async (data: UpdateUserRequest) => {
    const result = await dispatch(updateUserProfile(data));

    if (result.meta.requestStatus === "fulfilled") {
      return {
        success: true,
        data: result.payload,
      };
    }

    return {
      success: false,
      error: (result.payload as string) || "Failed to update profile",
    };
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

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    theme,

    // Actions
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    getProfile,
    updateProfile,
    setUser,
    clearError: clearErrorMessage,
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };
};
