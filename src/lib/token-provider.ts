import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Token Provider - bridge between AWS Cognito and HTTP layer
 *
 * This utility provides a clean interface for low-level services (like HttpClient)
 * to get the current auth token WITHOUT knowing about AWS Cognito directly.
 *
 * Architecture:
 * - HttpClient calls getAuthToken() before each request
 * - AWS Cognito manages token lifecycle (refresh, expiration)
 * - No manual localStorage management needed
 */

/**
 * Get current authentication token from AWS Cognito
 *
 * @returns JWT token string or undefined if not authenticated
 *
 * Benefits:
 * - Always fresh token (AWS handles refresh automatically)
 * - No localStorage pollution
 * - Separation of concerns (HTTP layer doesn't know about AWS)
 */
export async function getAuthToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch {
    // Not authenticated or session expired
    return undefined;
  }
}

/**
 * Check if user has valid authentication session
 *
 * @returns true if authenticated, false otherwise
 */
export async function hasValidSession(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();

    const hasSession = !!(
      session.tokens?.idToken && session.tokens?.accessToken
    );

    return hasSession;
  } catch {
    return false;
  }
}

/**
 * Check if user is authenticated (alias for hasValidSession)
 * Provided for backward compatibility
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  return hasValidSession();
}
