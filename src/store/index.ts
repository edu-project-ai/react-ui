import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { apiSlice } from "./api/apiSlice";
import { ideProxyApi } from "@/features/ide/api/ideProxyApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, ideProxyApi.middleware),
});
