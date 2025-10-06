import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
//import { useGetByPathQuery } from "../hooks";

export const store = configureStore({
    reducer: rootReducer,
    // middleware: (getDefaultMiddleware) =>
    //     getDefaultMiddleware().concat(useGetByPathQuery.middleware),
});