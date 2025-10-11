import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Утилітарна функція для об'єднання класів tailwind з правильним розв'язанням конфліктів
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
