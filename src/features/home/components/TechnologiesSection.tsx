import React from "react";
import { motion } from "motion/react";

const technologies = [
  { name: "JavaScript", icon: "🟨", desc: "ES6+ і фреймворки" },
  { name: "Python", icon: "🐍", desc: "Data Science & Backend" },
  { name: "React", icon: "⚛️", desc: "Frontend розробка" },
  { name: "TypeScript", icon: "🔷", desc: "Типізований JS" },
  { name: "Node.js", icon: "🟢", desc: "Backend JavaScript" },
  { name: "C#", icon: "🔵", desc: ".NET екосистема" },
  { name: "Java", icon: "☕", desc: "Enterprise розробка" },
  { name: "SQL", icon: "🗄️", desc: "Бази даних" },
  { name: "Docker", icon: "🐳", desc: "Контейнеризація" },
  { name: "Git", icon: "📦", desc: "Версіювання коду" },
  { name: "AWS", icon: "☁️", desc: "Cloud платформа" },
  { name: "MongoDB", icon: "🍃", desc: "NoSQL база даних" },
];

export const TechnologiesSection: React.FC = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Підтримувані технології
          </h2>
          <p className="text-xl text-muted-foreground">
            Вивчайте сучасні мови програмування та технології
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              className="group bg-card border border-border rounded-xl p-4 cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                y: -8,
                scale: 1.05,
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              }}
            >
              <div className="text-center space-y-2">
                <motion.div
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {tech.icon}
                </motion.div>
                <h3 className="font-semibold text-sm">{tech.name}</h3>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
