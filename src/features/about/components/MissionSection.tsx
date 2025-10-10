import MissionItem from "./MissionItem";

export default function MissionSection() {
  const missions = [
    {
      title: "Тестування",
      description: "оцінка поточного рівня користувача",
    },
    {
      title: "Читанки",
      description: "структуровані навчальні матеріали",
    },
    {
      title: "Практичні завдання",
      description: "безпечне виконання коду в контейнерах",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Наша Місія</h2>
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <p className="text-lg text-foreground/80 mb-6">
            Ми створюємо інтелектуальну платформу, що генерує персоналізовані
            навчальні роутмапи на основі:
          </p>
          <ul className="space-y-4 mb-8">
            {missions.map((mission, idx) => (
              <MissionItem
                key={idx}
                title={mission.title}
                description={mission.description}
              />
            ))}
          </ul>
          <p className="text-lg text-foreground/80">
            Наша мета — зробити навчання програмуванню більш ефективним та
            доступним для кожного, незалежно від початкового рівня знань.
          </p>
        </div>
      </div>
    </section>
  );
}
