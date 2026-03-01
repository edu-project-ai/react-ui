// Features barrel exports
export * from "./home";
export * from "./dashboard";
export * from "./learning-paths";
export * from "./progress/api/statisticsApi";
export type { UserStatistics, ActivityCalendarData } from "./progress/types";
export type { LearningPathProgress as ProgressLearningPathProgress } from "./progress/types";

// All page components
export { HomePage } from "./home";
export { AboutPage } from "./about";
export { ContactPage } from "./contact";
export { FeaturesInfoPage } from "./features-info";
export { LoginPage } from "./login";
export { RegisterPage } from "./register";
export { DashboardPage } from "./dashboard";
export { CallbackPage } from "./callback";
export { EmailConfirmationPage } from "./email-confirmation";
export {
  ProfilePhotoPage,
  SkillLevelPage,
  TechnologiesPage,
  OnboardingWizard,
} from "./onboarding";
export { SettingsPage } from "./settings";
export {
  LearningPathsPage,
  CreateLearningPathPage,
  LearningPathDetailPage,
  CheckpointPage,
  TaskDetailPage,
} from "./learning-paths";
export { ProgressPage } from "./progress";
export { IdePage } from "./ide";

// Authorization feature
export * from "./authorization";
