import { apiSlice } from "@/store/api/apiSlice";
import type { User, UpdateUserRequest } from "../services/type";

/**
 * DTOs for User API endpoints
 */
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoPath: string | null;
  programmingLevel: string;
  programmingTechnologies: string[];
}

export interface UpdateProgrammingLevelDto {
  programmingLevel: string;
}

export interface UpdatePreferredTechnologiesDto {
  programmingTechnologies: string[];
}

export interface UpdateRoleDto {
  roleId: string;
}

export interface UploadPhotoResponse {
  photoPath: string;
}

/**
 * User API - Backend Data Operations
 * This API handles all backend user-related HTTP requests using RTK Query.
 * For AWS Cognito operations, use auth.service.ts instead.
 */
export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create user profile in backend DB
    createUser: builder.mutation<User, FormData>({
      query: (formData) => ({
        url: "/api/users",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => "/api/users/get-by-auth",
      providesTags: ["User"],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/api/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    getUserByEmail: builder.query<User, string>({
      query: (email) => `/api/users/by-email/${email}`,
      providesTags: (_result, _error, email) => [{ type: "User", id: email }],
    }),

    getAllUsers: builder.query<User[], void>({
      query: () => "/api/users",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    updateProgrammingLevel: builder.mutation<
      User,
      { id: string; data: UpdateProgrammingLevelDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/users/${id}/programming-level`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    updatePreferredTechnologies: builder.mutation<
      User,
      { id: string; data: UpdatePreferredTechnologiesDto }
    >({
      query: ({ id, data }) => ({
        url: `/api/users/${id}/preferred-technologies`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    updateUserRole: builder.mutation<User, { id: string; data: UpdateRoleDto }>(
      {
        query: ({ id, data }) => ({
          url: `/api/users/${id}/role`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "User", id },
          "User",
        ],
      }
    ),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    uploadProfilePhoto: builder.mutation<UploadPhotoResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("photo", file);
        return {
          url: "/api/users/profile-photo",
          method: "POST",
          body: formData,
          // Do NOT set Content-Type - browser will set it with boundary for FormData
        };
      },
      invalidatesTags: ["User"],
    }),

    updateProfile: builder.mutation<User, UpdateUserRequest>({
      query: (data) => ({
        url: "/api/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUserProfileQuery,
  useGetUserByIdQuery,
  useGetUserByEmailQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateProgrammingLevelMutation,
  useUpdatePreferredTechnologiesMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useUploadProfilePhotoMutation,
  useUpdateProfileMutation,
} = userApi;

/**
 * Helper function to check if error is a 404 (profile not found)
 */
export function isProfileNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;


  if ("status" in error && error.status === 404) return true;

  if (
    "error" in error &&
    error.error &&
    typeof error.error === "object" &&
    "status" in error.error &&
    error.error.status === 404
  ) {
    return true;
  }

  return false;
}
