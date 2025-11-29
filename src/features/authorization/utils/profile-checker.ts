import { store } from "@/store";
import { userApi, isProfileNotFoundError } from "../api/userApi";

/**
 * Profile check result type
 * Distinguishes between "profile not found" (404) and "server error"
 */
export type ProfileCheckResult =
  | { status: "found"; hasProfile: true }
  | { status: "not_found"; hasProfile: false } // 404 only - safe to redirect to onboarding
  | { status: "error"; hasProfile: null }; // Server error - DON'T redirect

/**
 * Check if user has completed their profile in the backend
 * 
 * Returns:
 * - status: "found" (200 + User data) → Redirect to dashboard
 * - status: "not_found" (404) → Redirect to onboarding
 * - status: "error" (500, timeout, network) → Don't redirect, show error
 * 
 * @returns Promise<ProfileCheckResult>
 */
export async function checkUserProfileExists(): Promise<ProfileCheckResult> {
  try {
    await store
      .dispatch(
        userApi.endpoints.getUserProfile.initiate(undefined, {
          forceRefetch: true,
        })
      )
      .unwrap();

    return { status: "found", hasProfile: true };
  } catch (error) {
    console.error("⚠️ Profile check exception:", error);

    if (isProfileNotFoundError(error)) {
      console.log("❌ Profile not found (404)");
      return { status: "not_found", hasProfile: false };
    }

    console.error("⚠️ Server error (not 404), not redirecting");
    return { status: "error", hasProfile: null };
  }
}
