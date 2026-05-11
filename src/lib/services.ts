export const SERVICES = [
  "Stripping",
  "Trimming",
  "Deslanado",
  "Escovação",
  "Corte de unha",
  "Banho",
  "Banho e tosa",
  "Arreglo",
  "Banho e higiênica",
] as const;

export type Service = (typeof SERVICES)[number];
