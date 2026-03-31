import { apiSlice } from "@/store/api/apiSlice";

// --- Cognito DTOs ---

export interface CognitoAttribute {
  name: string;
  value: string;
}

export interface CognitoUser {
  username: string;
  email: string | null;
  sub: string | null;
  userStatus: string;
  enabled: boolean;
  userCreateDate: string;
  userLastModifiedDate: string;
  attributes: CognitoAttribute[];
  groups: string[] | null;
}

export interface CognitoUsersResponse {
  users: CognitoUser[];
  paginationToken: string | null;
}

export interface CognitoGroup {
  groupName: string;
  description: string | null;
  precedence: number | null;
  creationDate: string;
  lastModifiedDate: string;
}

// --- Role DTO ---

export interface Role {
  id: string;
  title: string;
}

// --- API ---

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Roles
    getRoles: builder.query<Role[], void>({
      query: () => "/api/roles",
      providesTags: ["Role"],
    }),

    // Cognito Users
    getCognitoUsers: builder.query<
      CognitoUsersResponse,
      { paginationToken?: string; limit?: number } | void
    >({
      query: (params) => ({
        url: "/api/admin/cognito/users",
        params: params
          ? {
              paginationToken: params.paginationToken,
              limit: params.limit,
            }
          : undefined,
      }),
      providesTags: [{ type: "CognitoUser", id: "LIST" }],
    }),

    getCognitoUser: builder.query<CognitoUser, string>({
      query: (username) => `/api/admin/cognito/users/${username}`,
      providesTags: (_r, _e, username) => [{ type: "CognitoUser", id: username }],
    }),

    // Cognito Groups
    getCognitoGroups: builder.query<CognitoGroup[], void>({
      query: () => "/api/admin/cognito/groups",
      providesTags: [{ type: "CognitoUser", id: "GROUPS" }],
    }),

    getCognitoGroupUsers: builder.query<CognitoUser[], string>({
      query: (groupName) => `/api/admin/cognito/groups/${groupName}/users`,
      providesTags: (_r, _e, groupName) => [
        { type: "CognitoUser", id: `GROUP_${groupName}` },
      ],
    }),

    // Cognito Actions
    disableCognitoUser: builder.mutation<void, string>({
      query: (username) => ({
        url: `/api/admin/cognito/users/${username}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, username) => [
        { type: "CognitoUser", id: username },
        { type: "CognitoUser", id: "LIST" },
      ],
    }),

    enableCognitoUser: builder.mutation<void, string>({
      query: (username) => ({
        url: `/api/admin/cognito/users/${username}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, username) => [
        { type: "CognitoUser", id: username },
        { type: "CognitoUser", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetCognitoUsersQuery,
  useGetCognitoUserQuery,
  useGetCognitoGroupsQuery,
  useGetCognitoGroupUsersQuery,
  useDisableCognitoUserMutation,
  useEnableCognitoUserMutation,
} = adminApi;
