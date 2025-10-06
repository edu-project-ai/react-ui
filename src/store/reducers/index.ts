import { combineReducers } from "redux";

import { apiSlice } from "../../hooks";

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
