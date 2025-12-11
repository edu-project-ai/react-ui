import { combineReducers } from "redux";

import { apiSlice } from "../api/apiSlice";
import userReducer from "../../features/authorization/store/user.slice";
import onboardingReducer from "../../features/onboarding/store/onboarding.slice";
import learningPathsReducer from "../../features/learning-paths/store/learningPaths.slice";

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  user: userReducer,
  onboarding: onboardingReducer,
  learningPaths: learningPathsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

