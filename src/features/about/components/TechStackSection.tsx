interface TechColumn {
  title: string;
  items: string[];
}

export default function TechStackSection() {
  const techColumns: TechColumn[] = [
    {
      title: "Frontend",
      items: [
        "React 19 + TypeScript",
        "Vite",
        "Tailwind CSS",
        "shadcn/ui",
        "Monaco Editor",
      ],
    },
    {
      title: "Backend",
      items: [
        ".NET 9 Web API",
        "Python FastAPI",
        "PostgreSQL",
        "Redis",
        "RabbitMQ",
      ],
    },
    {
      title: "AI & Infrastructure",
      items: ["LangChain", "Google Gemini", "Docker", "Kubernetes", "Auth0"],
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Технологічний Стек
        </h2>
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {techColumns.map((column, idx) => (
              <div key={idx}>
                <h3 className="font-semibold mb-4 text-primary">
                  {column.title}
                </h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  {column.items.map((item, itemIdx) => (
                    <li key={itemIdx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
