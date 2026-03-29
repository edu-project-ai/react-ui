import { apiSlice } from "@/store/api/apiSlice";
import type {
  UserStatistics,
  ActivityCalendarData,
  LearningPathProgress,
} from "../types";

export const statisticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserStatistics: builder.query<UserStatistics, void>({
      query: () => "/api/statistics/overview",
      providesTags: ["Statistics"],
    }),

    getActivityCalendar: builder.query<ActivityCalendarData[], number | void>({
      query: (days = 180) => `/api/statistics/activity-calendar?days=${days}`,
      providesTags: ["Statistics"],
    }),

    getLearningPathsProgress: builder.query<LearningPathProgress[], void>({
      query: () => "/api/statistics/learning-paths",
      providesTags: ["Statistics"],
    }),
  }),
});

export const {
  useGetUserStatisticsQuery,
  useGetActivityCalendarQuery,
  useGetLearningPathsProgressQuery,
} = statisticsApi;
