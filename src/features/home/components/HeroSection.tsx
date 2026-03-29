import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

const techItems = [
  { icon: "⚛️", name: "React", color: "from-cyan-500 to-blue-500" },
  { icon: "🔷", name: "TypeScript", color: "from-blue-600 to-blue-400" },
  { icon: "🐍", name: "Python", color: "from-blue-500 to-yellow-400" },
  { icon: "☕", name: "Java", color: "from-red-600 to-orange-500" },
  { icon: "🔵", name: "C#", color: "from-purple-600 to-blue-500" },
  { icon: "🟢", name: "Node.js", color: "from-green-600 to-green-400" },
  { icon: "🟨", name: "JavaScript", color: "from-yellow-500 to-yellow-300" },
  { icon: "🐳", name: "Docker", color: "from-blue-600 to-cyan-400" },
  { icon: "📦", name: "Git", color: "from-orange-600 to-red-500" },
  { icon: "☁️", name: "AWS", color: "from-orange-500 to-yellow-500" },
  { icon: "🗄️", name: "SQL", color: "from-blue-500 to-indigo-500" },
  { icon: "🍃", name: "MongoDB", color: "from-green-600 to-emerald-500" },
];

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col justify-center py-20">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero Content */}
        <div className="text-center space-y-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Learning Platform
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight mb-6">
              <span className="block mb-2">Master Coding</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  Your Way
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Personalized AI roadmaps, hands-on practice, and secure code
              execution — all in one platform
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register">
                <Button
                  size="lg"
                  className="text-lg px-12 h-16 font-semibold shadow-lg shadow-primary/20"
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
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </motion.svg>
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link to="/features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-12 h-16 font-semibold border-2"
                >
                  View Demo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Tech Conveyor Belt */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="overflow-hidden py-8">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

            {/* Scrolling container */}
            <div
              className="flex gap-6 animate-scroll"
              style={{ width: "200%" }}
            >
              {/* First set */}
              {techItems.map((tech, index) => (
                <motion.div
                  key={`first-${index}`}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-32 h-32 rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group">
                    <div
                      className={`text-5xl transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      {tech.icon}
                    </div>
                    <div className="text-sm font-semibold">{tech.name}</div>
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    ></div>
                  </div>
                </motion.div>
              ))}

              {/* Second set (duplicate for seamless loop) */}
              {techItems.map((tech, index) => (
                <motion.div
                  key={`second-${index}`}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-32 h-32 rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 group">
                    <div
                      className={`text-5xl transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      {tech.icon}
                    </div>
                    <div className="text-sm font-semibold">{tech.name}</div>
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats below conveyor */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { value: "10K+", label: "Students" },
              { value: "500+", label: "Challenges" },
              { value: "12+", label: "Languages" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
