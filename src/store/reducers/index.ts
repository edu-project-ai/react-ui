import { combineReducers } from "redux";

import { apiSlice } from "../api/apiSlice";
import userReducer from "../../features/authorization/store/user.slice";
import onboardingReducer from "../../features/onboarding/store/onboarding.slice";

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  user: userReducer,
  onboarding: onboardingReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
