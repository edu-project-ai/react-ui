import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/lib/token-provider";

/**
 * Base query configuration
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await getAuthToken();
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    return headers;
  },
});

/**
 * Custom base query wrapper that handles 404 responses gracefully
 * even when backend returns non-JSON (plain text) response.
 * 
 * This is critical for registration flow where 404 profile check
 * is a valid business case (new user without profile).
 */
const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Handle 404 as a business signal, not a parsing error
  if (result.error?.status === 404) {
    return {
      error: {
        status: 404,
        data: null,
      },
    };
  }
  
  // Handle PARSING_ERROR on 404 specifically
  if (
    result.error?.status === "PARSING_ERROR" &&
    result.meta?.response?.status === 404
  ) {
    console.warn("⚠️ 404 with non-JSON response, treating as profile not found");
    return {
      error: {
        status: 404,
        data: null,
      },
    };
  }
  
  return result;
};

/**
 * API Slice for RTK Query
 * Separated to avoid circular dependency with store
 * 
 * Automatically adds AWS Cognito JWT token to all requests
 * Handles 404 non-JSON responses gracefully for registration flow
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["LearningPath", "User", "Statistics"],
  endpoints: (builder) => ({
    getByPath: builder.query<unknown, string>({
      query: (path) => path,
    }),
  }),
});

export const { useGetByPathQuery } = apiSlice;
