import React from "react";
import { motion } from "motion/react";

const features = [
  {
    title: "AI-Powered Roadmaps",
    description:
      "Take an intelligent assessment to evaluate your current knowledge level and determine the optimal learning path tailored for you.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M12 2a3 3 0 0 0-3 3c0 1.5.5 2.5 1.5 3.5L9 20l3-1 3 1-1.5-11.5C14.5 7.5 15 6.5 15 5a3 3 0 0 0-3-3Z"></path>
      </svg>
    ),
    gradient: "from-primary to-accent",
    items: ["Adaptive questions", "Skill analysis", "Level recommendations"],
  },
  {
    title: "Personalized Learning",
    description:
      "Get an individual learning plan created by AI based on your goals, level, and available time.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    ),
    gradient: "from-accent to-secondary",
    items: ["Structured stages", "Adaptive updates", "Progress tracking"],
  },
  {
    title: "Safe Code Execution",
    description:
      "Complete practical tasks in isolated Docker containers with real-time feedback and secure environment.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="m7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    gradient: "from-secondary to-primary",
    items: [
      "Container isolation",
      "Real-time results",
      "12+ languages supported",
    ],
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            ✨ Platform Features
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold">
            Everything for Your{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Success
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive approach to learning programming using cutting-edge
            technologies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient.replace(
                  "to",
                  "to-transparent/10 from-transparent/10 to"
                )}/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}
              />

              <motion.div
                className="relative bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/50 transition-colors"
                whileHover={{
                  y: -12,
                  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <motion.div
                    className={`size-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                      >
                        <motion.div
                          className="size-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                          whileHover={{ scale: 1.2, rotate: 90 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M9 12l2 2 4-4"></path>
                          </svg>
                        </motion.div>
                        <span className="font-medium">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
