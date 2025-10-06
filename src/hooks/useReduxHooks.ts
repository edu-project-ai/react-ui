import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/reducers";
import { store } from "../store/index";
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

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
