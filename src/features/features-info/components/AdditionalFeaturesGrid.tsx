interface AdditionalFeature {
  icon: string;
  title: string;
  desc: string;
}

export default function AdditionalFeaturesGrid() {
  const features: AdditionalFeature[] = [
    {
      icon: "📚",
      title: "Бібліотека Ресурсів",
      desc: "Структуровані матеріали, відео та статті",
    },
    {
      icon: "🎯",
      title: "Тестування Знань",
      desc: "Квізи та практичні тести для перевірки",
    },
    {
      icon: "🤝",
      title: "AI-Асистент",
      desc: "Допомога та підказки в складних моментах",
    },
    {
      icon: "🏆",
      title: "Досягнення",
      desc: "Мотивація через систему нагород",
    },
    {
      icon: "📊",
      title: "Детальна Аналітика",
      desc: "Інсайти про ваш стиль навчання",
    },
    {
      icon: "🔄",
      title: "Адаптивність",
      desc: "Автоматична підстройка під вас",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Додаткові Можливості
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
