import React from "react";
import { Link } from "react-router-dom";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Про Roadly
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Інтелектуальна платформа для створення персоналізованих навчальних
            роутмап у програмуванні
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Наша Місія</h2>
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <p className="text-lg text-foreground/80 mb-6">
              Ми створюємо інтелектуальну платформу, що генерує персоналізовані
              навчальні роутмапи на основі:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <strong className="text-foreground">Тестування</strong>
                  <span className="text-foreground/70">
                    {" "}
                    — оцінка поточного рівня користувача
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <strong className="text-foreground">Читанки</strong>
                  <span className="text-foreground/70">
                    {" "}
                    — структуровані навчальні матеріали
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <strong className="text-foreground">
                    Практичні завдання
                  </strong>
                  <span className="text-foreground/70">
                    {" "}
                    — безпечне виконання коду в контейнерах
                  </span>
                </div>
              </li>
            </ul>
            <p className="text-lg text-foreground/80">
              Наша мета — зробити навчання програмуванню більш ефективним та
              доступним для кожного, незалежно від початкового рівня знань.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Ключові Особливості
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                AI-генерація планів
              </h3>
              <p className="text-foreground/70">
                Штучний інтелект аналізує ваші знання та цілі, створюючи
                персоналізований навчальний шлях з оптимальною послідовністю тем
                та завдань.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Безпечне виконання коду
              </h3>
              <p className="text-foreground/70">
                Використовуємо ізольовані Docker-контейнери для безпечного
                виконання вашого коду з обмеженнями ресурсів та часу виконання.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Real-time моніторинг
              </h3>
              <p className="text-foreground/70">
                Відстежуйте свій прогрес у реальному часі, отримуйте миттєвий
                фідбек від системи та бачте результати виконання кожного
                завдання.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Адаптивне навчання</h3>
              <p className="text-foreground/70">
                Система автоматично адаптує складність завдань та рекомендації
                на основі вашого прогресу та результатів виконання попередніх
                завдань.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Технологічний Стек
          </h2>
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-primary">Frontend</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>• React 19 + TypeScript</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui</li>
                  <li>• Monaco Editor</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-primary">Backend</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>• .NET 9 Web API</li>
                  <li>• Python FastAPI</li>
                  <li>• PostgreSQL</li>
                  <li>• Redis</li>
                  <li>• RabbitMQ</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-primary">
                  AI & Infrastructure
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>• LangChain</li>
                  <li>• Google Gemini</li>
                  <li>• Docker</li>
                  <li>• Kubernetes</li>
                  <li>• Auth0</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Готові почати свій шлях у програмуванні?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Приєднуйтесь до тисяч розробників, які вже обрали Roadly для
            навчання
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-white text-primary px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Почати безкоштовно
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
