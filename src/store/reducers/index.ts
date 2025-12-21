import { combineReducers } from "redux";

import { apiSlice } from "../api/apiSlice";
import { userReducer } from "@/features/authorization";
import onboardingReducer from "../../features/onboarding/store/onboarding.slice";
import { learningPathsReducer } from "@/features/learning-paths";
import notificationsReducer from "../../features/notifications/store/notifications.slice";

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  user: userReducer,
  onboarding: onboardingReducer,
  learningPaths: learningPathsReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

