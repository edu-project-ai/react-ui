import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/lib/token-provider";

/**
 * API Slice for RTK Query
 * Separated to avoid circular dependency with store
 * 
 * Automatically adds AWS Cognito JWT token to all requests
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await getAuthToken();
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ["LearningPath"],
  endpoints: (builder) => ({
    getByPath: builder.query<unknown, string>({
      query: (path) => path,
    }),
  }),
});

export const { useGetByPathQuery } = apiSlice;
