import { Amplify } from "aws-amplify";

export const configureAmplify = () => {
  const config = {
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || "",
        userPoolClientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || "",
        loginWith: {
          email: true,
          oauth: {
            domain: `${import.meta.env.VITE_AWS_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com`,
            scopes: [
              "openid",
              "email",
              "profile",
              "aws.cognito.signin.user.admin",
            ],
            redirectSignIn: [
              import.meta.env.VITE_REDIRECT_SIGN_IN ||
                "http://localhost:5173/auth/callback",
            ],
            redirectSignOut: [
              import.meta.env.VITE_REDIRECT_SIGN_OUT ||
                "http://localhost:5173/",
            ],
            responseType: "code" as const,
          },
        },
        signUpVerificationMethod: "code" as const,
        userAttributes: {
          email: {
            required: true,
          },
          given_name: {
            required: true,
          },
          family_name: {
            required: true,
          },
        },
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
  };

  Amplify.configure(config);
};
