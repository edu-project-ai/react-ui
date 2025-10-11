import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Надішліть нам повідомлення</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Ім'я
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="Ваше ім'я"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Тема
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            placeholder="Тема повідомлення"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Повідомлення
          </label>
          <textarea
            id="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
            placeholder="Ваше повідомлення..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg hover:opacity-90 transition-all"
        >
          Надіслати повідомлення
        </button>
      </form>
    </div>
  );
}
