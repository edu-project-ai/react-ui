import { combineReducers } from "redux";

import { apiSlice } from "../api/apiSlice";
import userReducer from "../../features/authorization/store/user.slice";

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
