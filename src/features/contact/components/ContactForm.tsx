import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Будь ласка, заповніть обов'язкові поля");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with real backend endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Повідомлення надіслано! Ми зв'яжемося з вами найближчим часом.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Не вдалося надіслати повідомлення. Спробуйте пізніше.");
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Надсилається..." : "Надіслати повідомлення"}
        </button>
      </form>
    </div>
  );
}
