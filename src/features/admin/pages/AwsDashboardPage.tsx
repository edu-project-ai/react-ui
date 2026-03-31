import React, { useState } from "react";
import {
  useGetCognitoUsersQuery,
  useGetCognitoUserQuery,
  useGetCognitoGroupsQuery,
  useGetCognitoGroupUsersQuery,
  useDisableCognitoUserMutation,
  useEnableCognitoUserMutation,
} from "../api/adminApi";
import type { CognitoUser } from "../api/adminApi";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "users" | "groups";

export const AwsDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AWS Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage AWS Cognito users, groups, and attributes directly.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {(["users", "groups"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "users" ? "Cognito Users" : "Groups"}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <CognitoUsersTab onSelectUser={setSelectedUsername} />
      )}
      {activeTab === "groups" && (
        <CognitoGroupsTab onSelectGroup={setSelectedGroup} />
      )}

      {/* User Detail Dialog */}
      {selectedUsername && (
        <UserDetailDialog
          username={selectedUsername}
          onClose={() => setSelectedUsername(null)}
        />
      )}

      {/* Group Users Dialog */}
      {selectedGroup && (
        <GroupUsersDialog
          groupName={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};

// --- Cognito Users Tab ---

const CognitoUsersTab: React.FC<{
  onSelectUser: (username: string) => void;
}> = ({ onSelectUser }) => {
  const { data, isLoading, error } = useGetCognitoUsersQuery();
  const [disableUser] = useDisableCognitoUserMutation();
  const [enableUser] = useEnableCognitoUserMutation();

  const handleToggle = async (user: CognitoUser) => {
    try {
      if (user.enabled) {
        await disableUser(user.username).unwrap();
      } else {
        await enableUser(user.username).unwrap();
      }
    } catch (err) {
      console.error("Failed to toggle user:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load Cognito users.</p>
      </div>
    );
  }

  const users = data?.users ?? [];

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Username</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Enabled</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.username}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <button
                    className="font-medium text-primary hover:underline"
                    onClick={() => onSelectUser(user.username)}
                  >
                    {user.username}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      user.userStatus === "CONFIRMED" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {user.userStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={user.enabled ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {user.enabled ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.userCreateDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant={user.enabled ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggle(user)}
                  >
                    {user.enabled ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No Cognito users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- User Detail Dialog ---

const UserDetailDialog: React.FC<{
  username: string;
  onClose: () => void;
}> = ({ username, onClose }) => {
  const { data: user, isLoading } = useGetCognitoUserQuery(username);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User: {username}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {user && (
          <div className="space-y-4 text-sm">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">Email</div>
              <div>{user.email ?? "—"}</div>
              <div className="text-muted-foreground">Sub</div>
              <div className="font-mono text-xs break-all">
                {user.sub ?? "—"}
              </div>
              <div className="text-muted-foreground">Status</div>
              <div>
                <Badge
                  variant={
                    user.userStatus === "CONFIRMED" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {user.userStatus}
                </Badge>
              </div>
              <div className="text-muted-foreground">Enabled</div>
              <div>
                <Badge
                  variant={user.enabled ? "default" : "destructive"}
                  className="text-xs"
                >
                  {user.enabled ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="text-muted-foreground">Created</div>
              <div>{new Date(user.userCreateDate).toLocaleString()}</div>
              <div className="text-muted-foreground">Modified</div>
              <div>{new Date(user.userLastModifiedDate).toLocaleString()}</div>
            </div>

            {/* Groups */}
            {user.groups && user.groups.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Groups</h4>
                <div className="flex flex-wrap gap-1">
                  {user.groups.map((g) => (
                    <Badge key={g} variant="outline" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attributes */}
            <div>
              <h4 className="font-medium mb-2">Attributes</h4>
              <div className="rounded-md border border-border divide-y divide-border">
                {user.attributes.map((attr) => (
                  <div
                    key={attr.name}
                    className="flex justify-between px-3 py-2 text-xs"
                  >
                    <span className="text-muted-foreground font-mono">
                      {attr.name}
                    </span>
                    <span className="break-all text-right max-w-[60%]">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Cognito Groups Tab ---

const CognitoGroupsTab: React.FC<{
  onSelectGroup: (groupName: string) => void;
}> = ({ onSelectGroup }) => {
  const { data: groups, isLoading, error } = useGetCognitoGroupsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load Cognito groups.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Group Name</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Precedence</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups?.map((group) => (
              <tr
                key={group.groupName}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{group.groupName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {group.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {group.precedence ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(group.creationDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectGroup(group.groupName)}
                  >
                    View Users
                  </Button>
                </td>
              </tr>
            ))}
            {(!groups || groups.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No Cognito groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Group Users Dialog ---

const GroupUsersDialog: React.FC<{
  groupName: string;
  onClose: () => void;
}> = ({ groupName, onClose }) => {
  const { data: users, isLoading } = useGetCognitoGroupUsersQuery(groupName);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group: {groupName}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {users && (
          <div className="rounded-md border border-border divide-y divide-border text-sm">
            {users.length === 0 && (
              <div className="px-4 py-6 text-center text-muted-foreground">
                No users in this group.
              </div>
            )}
            {users.map((u) => (
              <div
                key={u.username}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <span className="font-medium">{u.username}</span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    {u.email ?? ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={u.enabled ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {u.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {u.userStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
