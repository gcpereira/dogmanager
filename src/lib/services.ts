export const SERVICES = [
  "Banho",
  "Tosa",
  "Banho + Tosa",
  "Hidratação",
  "Outro",
] as const;

export type Service = (typeof SERVICES)[number];
