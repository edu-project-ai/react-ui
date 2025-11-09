import { useEffect, useState, type FC, type ReactNode } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/shared";
import { Spinner } from "@/components/ui";

// --- Логіка Redux ---
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchUserProfile } from "@/features/authorization/store/user.slice";

// --- Ваші утиліти ---
import { isAuthenticated } from "@/lib/token-provider";
import { isEmailVerified } from "@/lib/auth-utils";
import { useUser } from "@/features/authorization";

// Routes that don't require authentication
const routesWithNoAuth = [
  "/",
  "/about",
  "/contact",
  "/features",
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/confirm-email",
  "/onboarding/profile-photo",
  "/onboarding/skill-level",
  "/onboarding/technologies",
];

interface AuthRedirectorProps {
  children: ReactNode;
}

/**
 * Цей компонент керує всією логікою автентифікації,
 * відновленням сесії та редіректами.
 *
 * ВАЖЛИВО: Логіка перевірки email і профілю НЕ викликається для:
 * - /confirm-email (користувач ще не підтвердив email)
 * - /onboarding/* (користувач в процесі створення профілю)
 * Ці сторінки самі керують своїми редіректами!
 */
const AuthRedirector: FC<AuthRedirectorProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { hasProfile: checkHasProfile } = useUser();

  // Отримуємо користувача з Redux
  const currentUser = useAppSelector((state) => state.user.currentUser);

  // Глобальний стан завантаження: "restoring" - відновлюємо сесію після F5
  const [authStatus, setAuthStatus] = useState<
    "restoring" | "authenticated" | "unauthenticated"
  >("restoring");

  // Стан для редіректів
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  // Cache profile check result (ваша оригінальна логіка кешування)
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // Cache email verification to avoid spamming AWS Cognito
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthAndRestoreSession = async () => {
      // Скидаємо редіректи при кожній зміні сторінки
      setRedirectTo(null);

      // Ваша логіка скидання кешу (залишаємо, вона коректна)
      const locationState = location.state as {
        profileCreated?: boolean;
      } | null;
      if (locationState?.profileCreated) {
        setProfileChecked(false);
        setHasProfile(null);
        window.history.replaceState({}, document.title);
      }

      let user = currentUser; // Користувач з Redux
      let sessionIsValid = !!user; // Чи є сесія в Redux?

      // --- КРОК 1: ВІДНОВЛЕННЯ СЕСІЇ (після F5) ---
      if (!user) {
        // Користувача немає в Redux. Перевіримо Cognito (F5 або нова сесія?)
        const cognitoAuthenticated = await isAuthenticated();

        if (cognitoAuthenticated) {
          // Сценарій F5: Сесія в Cognito є, але Redux порожній.
          // НЕОБХІДНО відновити дані користувача в Redux.
          try {
            // Запускаємо thunk, .unwrap() поверне користувача або кине помилку
            user = await dispatch(fetchUserProfile()).unwrap();
            sessionIsValid = true;
          } catch (error) {
            console.error("Failed to restore session:", error);
            sessionIsValid = false;
            user = null;
          }
        } else {
          // Немає в Redux і немає в Cognito. Користувач 100% не залогінений.
          sessionIsValid = false;
          user = null;
        }
      }

      // --- КРОК 2: ЛОГІКА РЕДІРЕКТІВ (на основі відновлених даних) ---

      if (!sessionIsValid || !user) {
        // === КОРИСТУВАЧ НЕ АВТЕНТИФІКОВАНИЙ ===
        setAuthStatus("unauthenticated");

        // Скидаємо весь кеш при logout
        setProfileChecked(false);
        setHasProfile(null);
        setEmailChecked(false);
        setEmailVerified(null);

        // Якщо сторінка захищена, готуємо редірект
        if (!routesWithNoAuth.includes(location.pathname)) {
          setRedirectTo("/login");
        }
        return; // Завершуємо перевірку
      }

      // === КОРИСТУВАЧ АВТЕНТИФІКОВАНИЙ (Redux 100% заповнений) ===
      setAuthStatus("authenticated");

      // Сторінки, які САМІ керують своїми редіректами (не чіпаємо їх!)
      const selfManagedPages = [
        "/confirm-email",
        "/onboarding/profile-photo",
        "/onboarding/skill-level",
        "/onboarding/technologies",
      ];

      if (selfManagedPages.includes(location.pathname)) {
        // Ці сторінки самі знають, що робити - не втручаємось!
        setRedirectTo(null);
        return; // ✅ ВАЖЛИВО: return тут завершує useEffect
      }

      // === ПЕРЕВІРКИ ТІЛЬКИ ДЛЯ ЗАХИЩЕНИХ СТОРІНОК ===
      // (Dashboard, profile, etc. - сторінки, де користувач вже має бути повністю налаштований)

      try {
        // 1. Перевірка підтвердження email (з кешуванням)
        let emailIsVerified = emailVerified;

        if (!emailChecked) {
          emailIsVerified = await isEmailVerified();
          setEmailChecked(true);
          setEmailVerified(emailIsVerified);
        }

        if (!emailIsVerified) {
          setRedirectTo("/confirm-email");
          return;
        }

        // 2. Перевірка профілю (використовуємо hook для правильної архітектури)
        if (!profileChecked) {
          const profileCheck = await checkHasProfile();
          setProfileChecked(true);
          setHasProfile(profileCheck.hasProfile);

          if (!profileCheck.hasProfile) {
            setRedirectTo("/onboarding/profile-photo");
            return;
          }
        } else if (!hasProfile) {
          // Використовуємо кешоване значення
          setRedirectTo("/onboarding/profile-photo");
          return;
        }

        // Все ОК - користувач може бути на цій сторінці
        setRedirectTo(null);
      } catch (error) {
        console.error("Root: Error during auth checks:", error);
        // При помилці перевірки - вважаємо що профілю немає (fail-safe)
        setProfileChecked(true);
        setHasProfile(false);
        setRedirectTo("/onboarding/profile-photo");
      }
    };

    checkAuthAndRestoreSession();
  }, [
    location.pathname,
    location.state,
    currentUser,
    profileChecked,
    hasProfile,
    emailChecked,
    emailVerified,
    dispatch,
    checkHasProfile,
  ]);
  if (authStatus === "restoring") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Редірект з login/register для вже авторизованих користувачів
  if (authStatus === "authenticated") {
    if (location.pathname === "/login" || location.pathname === "/register") {
      // Якщо профіль перевірено і існує - редірект на dashboard
      // Якщо профілю немає - редірект на onboarding
      // Якщо ще не перевірено - не редіректимо (дочекаємось перевірки)
      if (profileChecked) {
        return (
          <Navigate
            to={hasProfile ? "/dashboard" : "/onboarding/profile-photo"}
            replace
          />
        );
      }
    }
  }

  // Захист захищених сторінок від неавторизованих користувачів
  if (authStatus === "unauthenticated") {
    if (!routesWithNoAuth.includes(location.pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

const Root = () => {
  return (
    <AuthRedirector>
      <Toaster />
      <Outlet />
    </AuthRedirector>
  );
};

export default Root;
