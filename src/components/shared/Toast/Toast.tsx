import { Toaster as HotToaster } from "react-hot-toast";

/**
 * Custom Toast component styled to match project theme
 * Uses react-hot-toast library with custom configuration
 */
export const Toaster = () => {
  return (
    <HotToaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: "",
        duration: 6000,

        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },

        success: {
          duration: 6000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--primary))",
          },
          iconTheme: {
            primary: "hsl(var(--primary))",
            secondary: "hsl(var(--background))",
          },
        },

        error: {
          duration: 10000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--destructive))",
          },
          iconTheme: {
            primary: "hsl(var(--destructive))",
            secondary: "hsl(var(--background))",
          },
        },

        loading: {
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--accent))",
          },
          iconTheme: {
            primary: "hsl(var(--accent))",
            secondary: "hsl(var(--background))",
          },
        },
      }}
    />
  );
};
