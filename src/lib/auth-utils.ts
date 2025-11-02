import {
  fetchUserAttributes,
  type FetchUserAttributesOutput,
} from "aws-amplify/auth";

/**
 * Check if user signed in via external provider (Google, Facebook, etc.)
 */
export async function isExternalProvider(): Promise<boolean> {
  try {
    const attributes = await fetchUserAttributes();
    return isExternalProviderFromAttributes(attributes);
  } catch (error) {
    console.error("Error checking external provider:", error);
    return false;
  }
}

/**
 * Check if user signed in via external provider from attributes
 */
export function isExternalProviderFromAttributes(
  attributes: FetchUserAttributesOutput
): boolean {
  // Check if identities attribute exists (indicates federated/social login)
  const identities = attributes.identities;

  if (identities) {
    try {
      // identities is a JSON string like: [{"providerName":"Google","providerType":"Google"}]
      const parsedIdentities =
        typeof identities === "string" ? JSON.parse(identities) : identities;

      return Array.isArray(parsedIdentities) && parsedIdentities.length > 0;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Check if user's email is verified
 * Returns true for external providers (they're auto-verified)
 * Returns true if email_verified attribute is true
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const attributes = await fetchUserAttributes();
    return isEmailVerifiedFromAttributes(attributes);
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
}

/**
 * Check if user's email is verified from attributes
 */
export function isEmailVerifiedFromAttributes(
  attributes: FetchUserAttributesOutput
): boolean {
  // Users from external providers (Google, etc.) are automatically verified
  if (isExternalProviderFromAttributes(attributes)) {
    return true;
  }

  // For regular email/password users, check the email_verified attribute
  const emailVerified = attributes.email_verified;

  if (typeof emailVerified === "boolean") {
    return emailVerified;
  }

  if (typeof emailVerified === "string") {
    return emailVerified === "true";
  }

  return false;
}

/**
 * Check if user account is confirmed
 * This includes both email verification and external provider accounts
 */
export async function isAccountConfirmed(): Promise<boolean> {
  return isEmailVerified();
}
