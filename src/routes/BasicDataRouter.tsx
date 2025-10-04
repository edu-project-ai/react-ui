import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "../components/Root";
import { PublicLayout } from "../components/layout";
import { HomePage } from "@/pages/Home";
import { AboutPage } from "@/pages/About";
import { FeaturesPage } from "@/pages/Features";
import { ContactPage } from "@/pages/Contact";
import { NotFound } from "@/pages/NotFound";

const BasicDataRouter = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" Component={Root}>
        <Route path="/" Component={PublicLayout}>
          <Route path="/" Component={HomePage} />
          <Route path="/about" Component={AboutPage} />
          <Route path="/features" Component={FeaturesPage} />
          <Route path="/contact" Component={ContactPage} />
        </Route>
        <Route path="*" Component={NotFound} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default BasicDataRouter;
