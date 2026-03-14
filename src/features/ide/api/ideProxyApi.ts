import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FileNode, SearchResult } from "../types";

export const ideProxyApi = createApi({
  reducerPath: "ideProxy",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_WS_PROXY_URL
        ?.replace("ws://", "http://")
        .replace("wss://", "https://") ?? "http://localhost:8080",
  }),
  endpoints: (builder) => ({
    fetchFileTree: builder.query<FileNode[], string>({
      query: (containerId) => ({ url: "/fs/tree", params: { id: containerId } }),
    }),
    readFile: builder.query<string, { containerId: string; path: string }>({
      query: ({ containerId, path }) => ({
        url: "/fs/file",
        params: { id: containerId, path },
        responseHandler: "text",
      }),
    }),
    writeFile: builder.mutation<void, { containerId: string; path: string; content: string }>({
      query: ({ containerId, path, content }) => ({
        url: "/fs/file",
        method: "POST",
        params: { id: containerId, path },
        body: content,
        headers: { "Content-Type": "text/plain" },
        responseHandler: "text",
      }),
    }),
    searchFiles: builder.query<SearchResult[], { containerId: string; query: string; matchCase?: boolean; matchWord?: boolean }>({
      query: ({ containerId, query, matchCase, matchWord }) => ({
        url: "/fs/search",
        params: { 
          id: containerId, 
          q: query,
          ...(matchCase && { matchCase: 'true' }),
          ...(matchWord && { matchWord: 'true' })
        },
      }),
    }),
  }),
});

export const {
  useFetchFileTreeQuery,
  useLazyFetchFileTreeQuery,
  useReadFileQuery,
  useLazyReadFileQuery,
  useWriteFileMutation,
  useSearchFilesQuery,
  useLazySearchFilesQuery,
} = ideProxyApi;
