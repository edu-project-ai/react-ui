import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useReduxHooks";
import { getAuthToken } from "@/lib/token-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useUpdateUserMutation,
  useUpdateProgrammingLevelMutation,
  useUpdatePreferredTechnologiesMutation,
  useUploadProfilePhotoMutation,
} from "@/features/authorization";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  BACKEND_TO_TECHNOLOGY_MAP,
  TECHNOLOGY_TO_BACKEND_MAP,
  TECHNOLOGY_OPTIONS_GROUPED,
  type Technology,
} from "@/features/onboarding";

const PROGRAMMING_LEVELS = ["beginner", "intermediate", "advanced"] as const;

type SettingsTab = "user" | "programming" | "devtools";

const tabs: { key: SettingsTab; label: string }[] = [
  { key: "user", label: "User Data" },
  { key: "programming", label: "Programming" },
  { key: "devtools", label: "Devtools" },
];

export const SettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.user.currentUser);
  const [activeTab, setActiveTab] = useState<SettingsTab>("user");

  // User data form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Programming form
  const [programmingLevel, setProgrammingLevel] = useState<string>("beginner");
  const [technologies, setTechnologies] = useState<Technology[]>([]);

  // Photo upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Devtools
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateLevel, { isLoading: isUpdatingLevel }] = useUpdateProgrammingLevelMutation();
  const [updateTech, { isLoading: isUpdatingTech }] = useUpdatePreferredTechnologiesMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize form from user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDisplayName(user.displayName || "");
      setProgrammingLevel(user.programmingLevel || "beginner");
      // Convert backend slugs → Technology keys, skip unknown slugs
      const techKeys = (user.programmingTechnologies || [])
        .map((slug) => BACKEND_TO_TECHNOLOGY_MAP[slug])
        .filter((t): t is Technology => t !== undefined);
      setTechnologies(techKeys);
      // Initialize photo preview from photoPath
      if (user.photoPath) {
        setPhotoPreview(user.photoPath);
      }
    }
  }, [user]);

  // Fetch token for devtools
  useEffect(() => {
    if (activeTab === "devtools") {
      getAuthToken().then((t) => {
        if (t) setToken(t);
      });
    }
  }, [activeTab]);

  const showSuccess = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleSaveUserData = async () => {
    if (!user?.id) return;
    try {
      await updateUser({
        id: user.id,
        data: { firstName, lastName, displayName },
      }).unwrap();
      showSuccess("Profile updated successfully");
    } catch {
      // error handled by RTK Query
    }
  };

  const handleSaveProgramming = async () => {
    if (!user?.id) return;
    try {
      await updateLevel({
        id: user.id,
        data: { programmingLevel },
      }).unwrap();
      await updateTech({
        id: user.id,
        data: {
          programmingTechnologies: technologies.map(
            (t) => TECHNOLOGY_TO_BACKEND_MAP[t]
          ),
        },
      }).unwrap();
      showSuccess("Programming settings updated");
    } catch {
      // error handled by RTK Query
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoSelect = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handlePhotoSelect(file);
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePhotoDragLeave = () => {
    setIsDragging(false);
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePhotoSelect(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoPreview || !user?.id) return;
    try {
      // If photoPreview is not a data URL, it means it's already uploaded
      if (photoPreview.startsWith("data:")) {
        // Convert data URL to File
        const response = await fetch(photoPreview);
        const blob = await response.blob();
        const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
        await uploadPhoto(file).unwrap();
      }
      showSuccess("Profile photo updated successfully");
    } catch {
      // error handled by RTK Query
    }
  };

  const handlePhotoRemove = () => {
    setPhotoPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm font-medium">
          {saveSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* User Data Tab */}
      {activeTab === "user" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>

          {/* Photo Upload Section */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-3">
              Profile Photo
            </label>
            <div className="flex gap-6 items-start">
              {/* Photo Preview */}
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary shadow-md">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handlePhotoRemove}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                      aria-label="Remove photo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div
                  onDragOver={handlePhotoDragOver}
                  onDragLeave={handlePhotoDragLeave}
                  onDrop={handlePhotoDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-input"
                  />
                  <label htmlFor="photo-input" className="cursor-pointer">
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop your photo here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to select (JPG, PNG, etc.)
                    </p>
                  </label>
                </div>

                {photoPreview && photoPreview.startsWith("data:") && (
                  <Button
                    onClick={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="w-full"
                  >
                    {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* User Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <div className="p-3 bg-muted/50 rounded-md font-medium text-muted-foreground">
                {user?.email || "Not set"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveUserData} disabled={isUpdatingUser}>
              {isUpdatingUser ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Programming Tab */}
      {activeTab === "programming" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold">Programming Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Experience Level
              </label>
              <div className="flex gap-3">
                {PROGRAMMING_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setProgrammingLevel(level)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border",
                      programmingLevel === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-accent/10"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Technologies
              </label>
              <MultiSelect
                options={TECHNOLOGY_OPTIONS_GROUPED}
                defaultValue={technologies}
                onValueChange={(vals) => setTechnologies(vals as Technology[])}
                placeholder="Select technologies..."
                maxCount={5}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProgramming}
              disabled={isUpdatingLevel || isUpdatingTech}
            >
              {isUpdatingLevel || isUpdatingTech ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Devtools Tab */}
      {activeTab === "devtools" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Authentication Token</h2>
            <Button onClick={handleCopyToken} variant="outline" size="sm">
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
      )}
    </div>
  );
};
