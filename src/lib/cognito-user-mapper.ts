/**
 * Utility для маппінгу Cognito користувача в User об'єкт
 * Використовується для уникнення дублювання коду в CallbackPage та інших місцях
 */

import type { AuthUser } from "aws-amplify/auth";
import type { User } from "@/features/authorization/services/type";

interface CognitoUserAttributes {
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  [key: string]: string | undefined;
}

/**
 * Створює User об'єкт з Cognito даних
 * @param cognitoUser - AWS Cognito користувач
 * @param userAttributes - Атрибути користувача з Cognito
 * @returns User об'єкт для Redux store
 */
export function createUserFromCognito(
  cognitoUser: AuthUser,
  userAttributes: CognitoUserAttributes
): User {
  return {
    id: cognitoUser.userId,
    email:
      userAttributes.email ||
      cognitoUser.signInDetails?.loginId ||
      cognitoUser.username,
    cognitoSub: cognitoUser.userId,
    firstName: userAttributes.given_name || "",
    lastName: userAttributes.family_name || "",
    displayName: userAttributes.name || cognitoUser.username,
    programmingLevel: "beginner",
    programmingTechnologies: [],
    accountStatus: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
