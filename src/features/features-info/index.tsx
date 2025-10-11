import { PageHero, CTABanner } from "@/components/shared";
import { FeatureDetail, AdditionalFeaturesGrid } from "./components";

export const FeaturesInfoPage = () => {
  const features = [
    {
      badge: {
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        text: "AI-Powered",
        color: "primary",
      },
      title: "Персоналізовані Роутмапи",
      description:
        "Штучний інтелект аналізує ваш поточний рівень знань, цілі та стиль навчання, створюючи індивідуальний план розвитку з оптимальною послідовністю тем.",
      checklist: [
        "Адаптація під ваш темп навчання",
        "Автоматичне оновлення на основі прогресу",
        "Рекомендації на основі сильних і слабких сторін",
      ],
      illustration: (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
              {[100, 75, 25].map((width, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${width === 100 || width === 75 ? 'bg-primary/20' : 'bg-muted'} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${width === 100 || width === 75 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`h-2 ${width === 100 || width === 75 ? 'bg-primary' : 'bg-muted'} rounded-full`} style={{ width: `${width}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: {
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
        text: "Code Execution",
        color: "accent",
      },
      title: "Практичні Завдання",
      description:
        "Виконуйте код безпосередньо в браузері з миттєвим фідбеком. Підтримка Python, JavaScript, Java, C# та інших мов програмування.",
      checklist: [
        "Безпечне виконання в ізольованих контейнерах",
        "Автоматична перевірка з детальним фідбеком",
        "Real-time логи та результати виконання",
      ],
      illustration: (
        <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-8 border border-border">
          <div className="bg-card rounded-xl p-6 shadow-lg font-mono text-sm">
            <div className="text-accent mb-2">def fibonacci(n):</div>
            <div className="text-foreground/70 ml-4">if n &lt;= 1:</div>
            <div className="text-foreground/70 ml-8">return n</div>
            <div className="text-foreground/70 ml-4">return fibonacci(n-1) + fibonacci(n-2)</div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-green-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Всі тести пройдені успішно</span>
              </div>
            </div>
          </div>
        </div>
      ),
      reverse: true,
    },
    {
      badge: {
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        text: "Analytics",
        color: "primary",
      },
      title: "Детальний Прогрес",
      description:
        "Відстежуйте свій розвиток з детальною аналітикою: час навчання, складність виконаних завдань, сильні та слабкі сторони.",
      checklist: [
        "Візуалізація прогресу по темах",
        "Статистика виконання завдань",
        "Рекомендації для покращення",
      ],
      illustration: (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
          <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
            {[
              { label: "Завдання виконано", value: "24/30", percent: 80, color: "primary" },
              { label: "Час навчання", value: "48 годин", percent: 65, color: "accent" },
              { label: "Успішність", value: "92%", percent: 92, color: "green-500" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground/70">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-${stat.color} rounded-full`} style={{ width: `${stat.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Можливості Платформи"
        description="Повний набір інструментів для ефективного навчання програмуванню"
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-24">
          {features.map((feature, idx) => (
            <FeatureDetail key={idx} {...feature} />
          ))}
        </div>
      </section>

      <AdditionalFeaturesGrid />

      <CTABanner
        title="Готові спробувати всі можливості?"
        description="Почніть безкоштовно та отримайте доступ до персоналізованого навчання вже сьогодні"
        buttonText="Почати навчання"
        buttonLink="/register"
        gradient={false}
      />
    </div>
  );
};

export default FeaturesInfoPage;
