import type { CognitoErrorType } from "../services/type";

export interface ParsedCognitoError {
  type: CognitoErrorType;
  message: string;
  originalMessage: string;
}

/**
 * Serialize error for Redux
 * Preserves __type field from AWS Cognito errors for proper error handling
 */
export const serializeError = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    if ("__type" in error && typeof error.__type === "string") {
      return JSON.stringify({
        __type: error.__type,
        message: error.message,
      });
    }

    try {
      const parsed = JSON.parse(error.message);
      if (parsed.__type) {
        return JSON.stringify(parsed);
      }
    } catch {
      // Not JSON, continue
    }
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "__type" in error &&
    "message" in error
  ) {
    return JSON.stringify({
      __type: error.__type,
      message: error.message,
    });
  }

  return "An unknown error occurred";
};

export const parseCognitoError = (errorMessage: string): ParsedCognitoError => {
  const lowerMessage = errorMessage.toLowerCase();

  if (
    lowerMessage.includes("usernotconfirmedexception") ||
    lowerMessage.includes("not confirmed") ||
    lowerMessage.includes("confirm_sign_up")
  ) {
    return {
      type: "NOT_CONFIRMED",
      message: "Please confirm your email address",
      originalMessage: errorMessage,
    };
  }

  if (
    lowerMessage.includes("notauthorizedexception") ||
    lowerMessage.includes("incorrect username or password")
  ) {
    return {
      type: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
      originalMessage: errorMessage,
    };
  }

  if (lowerMessage.includes("usernotfoundexception")) {
    return {
      type: "USER_NOT_FOUND",
      message: "No account found with this email",
      originalMessage: errorMessage,
    };
  }

  if (
    lowerMessage.includes("toomanyrequestsexception") ||
    lowerMessage.includes("too many failed attempts")
  ) {
    return {
      type: "TOO_MANY_ATTEMPTS",
      message: "Too many failed attempts. Please try again later",
      originalMessage: errorMessage,
    };
  }

  if (lowerMessage.includes("invalidpasswordexception")) {
    return {
      type: "WEAK_PASSWORD",
      message: "Password does not meet requirements",
      originalMessage: errorMessage,
    };
  }

  if (lowerMessage.includes("usernameexistsexception")) {
    return {
      type: "USER_EXISTS",
      message: "An account with this email already exists",
      originalMessage: errorMessage,
    };
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return {
      type: "NETWORK_ERROR",
      message: "Network error. Please check your connection",
      originalMessage: errorMessage,
    };
  }

  return {
    type: "UNKNOWN",
    message: errorMessage,
    originalMessage: errorMessage,
  };
};
