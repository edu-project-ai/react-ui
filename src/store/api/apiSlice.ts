import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * API Slice for RTK Query
 * Separated to avoid circular dependency with store
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: [],
  endpoints: (builder) => ({
    getByPath: builder.query<unknown, string>({
      query: (path) => path,
    }),
  }),
});

export const { useGetByPathQuery } = apiSlice;
