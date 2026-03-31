/**
 * Utility для маппінгу Cognito користувача в User об'єкт
 * Використовується для уникнення дублювання коду в CallbackPage та інших місцях
 */

import type { AuthUser } from "aws-amplify/auth";
import type { User } from "@/features/authorization/services/type";
import type { AuthSession } from "aws-amplify/auth";

interface CognitoUserAttributes {
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  [key: string]: string | undefined;
}

function getEmailFromToken(session: AuthSession | null): string | null {
  if (!session?.tokens?.idToken) return null;
  
  try {
    const payload = session.tokens.idToken.payload;
    return (payload.email as string) || null;
  } catch (error) {
    console.error("Failed to extract email from token:", error);
    return null;
  }
}

/**
 * Створює User об'єкт з Cognito даних
 * @param cognitoUser - AWS Cognito користувач
 * @param userAttributes - Атрибути користувача з Cognito
 * @param session - Auth session для отримання email з JWT токена
 * @returns User об'єкт для Redux store
 */
export function createUserFromCognito(
  cognitoUser: AuthUser,
  userAttributes: CognitoUserAttributes,
  session: AuthSession | null = null
): User {
  // Пріоритет для email: JWT token > userAttributes > loginId > username
  const emailFromToken = getEmailFromToken(session);
  let email = 
    emailFromToken ||
    userAttributes.email ||
    cognitoUser.signInDetails?.loginId;

  // Якщо email не знайдено, або він не схожий на email
  if (!email || !email.includes('@')) {
    // Перевіряємо username, чи схожий він на email
    if (cognitoUser.username && cognitoUser.username.includes('@')) {
       email = cognitoUser.username;
    }
  }

  // Якщо email все ще немає, і ми маємо справу з Google Auth (починається з google_),
  // то краще залишити поле пустим, ніж записувати туди ID.
  // Але якщо це не Google ID, то можливо це і є username.
  // В даному випадку вимога користувача - прибрати `google_...`
  if (!email && cognitoUser.username && !cognitoUser.username.toLowerCase().startsWith('google_')) {
      email = cognitoUser.username;
  }
  
  // Гарантуємо, що email - це рядок
  email = email || "";

  // Допоміжна функція для очищення частин імені
  const cleanNamePart = (name?: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    // Якщо ім'я складається тільки з розділових знаків (кома, крапка) - повертаємо пустий рядок
    if (/^[.,\s]+$/.test(trimmed)) return "";
    return trimmed;
  };

  // Очищаємо firstName та lastName
  const firstName = cleanNamePart(userAttributes.given_name);
  const lastName = cleanNamePart(userAttributes.family_name);
  
  // Формуємо displayName
  let displayName = (userAttributes.name || "").trim();
  
  // Якщо немає displayName, складаємо з імені та прізвища
  if (!displayName && (firstName || lastName)) {
    displayName = `${firstName} ${lastName}`.trim();
  }
  
  // Якщо все ще пусто - беремо username (за умови що це не Google ID)
  if (!displayName) {
     const isGoogleId = cognitoUser.username.toLowerCase().startsWith('google_');
     displayName = isGoogleId ? "User" : cognitoUser.username;
  }

  // Фінальна очистка displayName від початкових/кінцевих ком та крапок
  displayName = displayName.replace(/^[,.\s]+|[,.\s]+$/g, "").trim();

  return {
    id: cognitoUser.userId,
    email,
    cognitoSub: cognitoUser.userId,
    firstName,
    lastName,
    displayName,
    programmingLevel: "beginner",
    programmingTechnologies: [],
    accountStatus: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
