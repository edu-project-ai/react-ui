import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../authorization";
import { fetchAuthSession } from "aws-amplify/auth";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading, isAuthenticated } = useUser();
  const [token, setToken] = useState<string>("");
  const [tokenCopied, setTokenCopied] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          setToken(idToken);
        }
      } catch {
        // Silent error
      }
    };

    getToken();
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch {
      // Silent error
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.displayName || user?.email}!
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">
                {user?.id}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="text-gray-900 dark:text-white">
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-600 dark:text-gray-400">
                Display Name:
              </span>
              <span className="text-gray-900 dark:text-white">
                {user?.displayName}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <span className="text-gray-600 dark:text-gray-400">
                Account Status:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {user?.accountStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Token Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cognito JWT Token
            </h2>
            <button
              onClick={copyToken}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              {tokenCopied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Token
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
              {token || "Loading token..."}
            </pre>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            💡 This JWT token can be used to authenticate API requests to your
            backend. Check the browser console for more details.
          </p>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Authentication Status
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                ✅ You are authenticated with AWS Cognito. Backend API
                integration is temporarily disabled. The token above can be used
                when the backend is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
