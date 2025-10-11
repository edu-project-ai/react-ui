import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export const CTASection: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30 rounded-3xl blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="relative bg-gradient-to-br from-primary via-accent to-secondary rounded-3xl p-12 sm:p-16 text-white overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Decorative circles */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            <div className="relative z-10 text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                  ✨ Start Learning Today
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Your Path to{" "}
                  <span className="relative inline-block">
                    Success
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 rounded-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    />
                  </span>
                  <br />
                  Starts Here
                </h2>

                <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Join the community of developers and start learning with
                  personalized AI roadmaps
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-12 h-16 font-semibold shadow-xl"
                  >
                    Get Started Free
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </motion.svg>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-12 h-16 font-semibold border-2 border-white/30 text-black hover:text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 pt-8 text-white/80 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <span>Free to Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <span>Cancel Anytime</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
