import { Link } from "react-router";
import ContactInfoItem from "./ContactInfoItem";

export default function ContactInfo() {
  const contactItems = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Email",
      lines: ["support@roadmap.com", "info@roadmap.com"],
      iconBgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: "Адреса",
      lines: ["Україна, Київ", "вул. Прикладна, 123"],
      iconBgColor: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Робочі години",
      lines: ["Пн-Пт: 9:00 - 18:00", "Сб-Нд: Вихідні"],
      iconBgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  const socialLinks = [
    {
      name: "Twitter",
      icon: (
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      ),
    },
    {
      name: "GitHub",
      icon: (
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      ),
    },
    {
      name: "LinkedIn",
      icon: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Контактна інформація</h2>
        <div className="space-y-6">
          {contactItems.map((item, idx) => (
            <ContactInfoItem key={idx} {...item} />
          ))}
        </div>
      </div>

      {/* FAQ Link */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-2">Маєте питання?</h3>
        <p className="text-sm text-foreground/70 mb-4">
          Перегляньте наші часті питання - можливо, ви знайдете відповідь
          швидше!
        </p>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Переглянути FAQ
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="font-semibold mb-4">Соціальні мережі</h3>
        <div className="flex gap-3">
          {socialLinks.map((social, idx) => (
            <a
              key={idx}
              href="#"
              className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label={social.name}
            >
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {social.icon}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
