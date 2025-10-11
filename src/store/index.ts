import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
