import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-2xl bg-card/80 backdrop-blur-md border border-border rounded-2xl p-8 md:p-12 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold mb-4 text-primary">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
          Page not found
        </h2>

        <p className="text-sm md:text-base text-foreground/70 mb-6">
          The page you're looking for doesn't exist or has been moved. Check the
          URL or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2 text-sm font-medium shadow hover:opacity-95 transition"
          >
            Go back home
          </Link>

          <a
            href="mailto:support@example.com"
            className="inline-flex items-center justify-center rounded-md border border-border bg-transparent text-foreground px-5 py-2 text-sm font-medium hover:bg-muted/5 transition"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
