import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { getAuthToken } from "@/lib/token-provider";
import { Button } from "@/components/ui/button";

export const SettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.user.currentUser);
  const [token, setToken] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const t = await getAuthToken();
      if (t) {
        setToken(t);
      }
    };
    fetchToken();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and view your profile information.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <div className="p-3 bg-accent/10 rounded-md font-medium">
              {user?.displayName || "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <div className="p-3 bg-accent/10 rounded-md font-medium">
              {user?.email || "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              First Name
            </label>
            <div className="p-3 bg-accent/10 rounded-md font-medium">
              {user?.firstName || "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Last Name
            </label>
            <div className="p-3 bg-accent/10 rounded-md font-medium">
              {user?.lastName || "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Programming Level
            </label>
            <div className="p-3 bg-accent/10 rounded-md font-medium">
              {user?.programmingLevel || "Not set"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Authentication Token</h2>
          <Button onClick={handleCopy} variant="outline" size="sm">
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy Token
              </>
            )}
          </Button>
        </div>
        
        <div className="relative">
          <textarea
            readOnly
            value={token}
            className="w-full h-32 p-4 bg-muted/50 rounded-md font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This token is used to authenticate your requests to the API. Keep it secure.
        </p>
      </div>
    </div>
  );
};
