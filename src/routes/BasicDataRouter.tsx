import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "../components/Root";
import { PublicLayout } from "../components/layout/PublicLayout/PublicLayout";
import NotFound from "../components/layout/NotFound/NotFound";
import { PrivateLayout } from "../components/layout/PrivateLayout/PrivateLayout";
import {
  HomePage,
  AboutPage,
  ContactPage,
  FeaturesInfoPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  CallbackPage,
  EmailConfirmationPage,
  OnboardingWizard,
  SettingsPage,
  LearningPathsPage,
  CreateLearningPathPage,
  LearningPathDetailPage,
  CheckpointPage,
  TaskDetailPage,
  ResourceDetailPage,
  ProgressPage,
  ResourcesPage,
  IdePage,
  AiMentorPage,
} from "@/features";

const BasicDataRouter = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" Component={Root}>
        <Route path="/" Component={PublicLayout}>
          <Route path="/" Component={HomePage} />
          <Route path="/about" Component={AboutPage} />
          <Route path="/features" Component={FeaturesInfoPage} />
          <Route path="/contact" Component={ContactPage} />
        </Route>
        <Route path="/login" Component={LoginPage} />
        <Route path="/register" Component={RegisterPage} />
        <Route path="/confirm-email" Component={EmailConfirmationPage} />
        <Route path="/auth/callback" Component={CallbackPage} />

        {/* Onboarding Wizard - Single entry point */}
        <Route path="/onboarding" Component={OnboardingWizard} />

        {/* Standalone IDE workspace — full-screen, no sidebar/header */}
        <Route path="/workspace/:learningPathId/:itemId" Component={IdePage} />

        {/* Private routes */}
        <Route path="/" Component={PrivateLayout}>
          <Route path="/dashboard" Component={DashboardPage} />
          <Route path="/progress" Component={ProgressPage} />
          <Route path="/settings" Component={SettingsPage} />
          
          {/* Learning Paths routes */}
          <Route path="/learning-paths" Component={LearningPathsPage} />
          <Route path="/create-roadmap" Component={CreateLearningPathPage} />
          <Route path="/learning-paths/:id" Component={LearningPathDetailPage} />
          <Route path="/learning-paths/:id/checkpoints/:checkpointId" Component={CheckpointPage} />
          <Route path="/learning-paths/:id/checkpoints/:checkpointId/tasks/:taskId" Component={TaskDetailPage} />
          <Route path="/learning-paths/:id/tasks/:taskId" Component={TaskDetailPage} />
          <Route path="/learning-paths/:id/resources/:resourceId" Component={ResourceDetailPage} />
          <Route path="/resources/:resourceId" Component={ResourceDetailPage} />
          <Route path="/resources" Component={ResourcesPage} />

          {/* AI Mentor */}
          <Route path="/ai-mentor" Component={AiMentorPage} />
        </Route>
    
        <Route path="*" Component={NotFound} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};


export default BasicDataRouter;
