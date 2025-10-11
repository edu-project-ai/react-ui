import { motion } from "motion/react";
import type { ReactNode } from "react";
import logo from "@/assets/Roadly-logo.png";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <motion.img
              src={logo}
              alt="Roadly"
              className="h-12"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold text-foreground mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-sm text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Secure authentication powered by AWS Cognito
        </motion.p>
      </motion.div>
    </div>
  );
}
