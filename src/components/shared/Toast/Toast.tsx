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
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },

        success: {
          duration: 6000,
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--primary)",
          },
          iconTheme: {
            primary: "var(--primary)",
            secondary: "var(--popover)",
          },
        },

        error: {
          duration: 10000,
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--destructive)",
          },
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--popover)",
          },
        },

        loading: {
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--accent)",
          },
          iconTheme: {
            primary: "var(--accent)",
            secondary: "var(--popover)",
          },
        },
      }}
    />
  );
};
