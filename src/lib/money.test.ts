import { describe, it, expect } from "vitest";
import { parseEurToCents, formatEur } from "./money";

describe("parseEurToCents", () => {
  it("converte inteiros em cents", () => {
    expect(parseEurToCents("10")).toBe(1000);
    expect(parseEurToCents("0")).toBe(0);
  });

  it("aceita ponto como separador decimal", () => {
    expect(parseEurToCents("10.50")).toBe(1050);
  });

  it("aceita vírgula como separador decimal (BR/PT)", () => {
    expect(parseEurToCents("10,50")).toBe(1050);
    expect(parseEurToCents("0,99")).toBe(99);
  });

  it("faz trim de espaços", () => {
    expect(parseEurToCents("  10  ")).toBe(1000);
  });

  it("arredonda fração de cent", () => {
    expect(parseEurToCents("10.005")).toBe(1001);
    expect(parseEurToCents("10.004")).toBe(1000);
  });

  it("retorna null para strings vazias ou inválidas", () => {
    expect(parseEurToCents("")).toBeNull();
    expect(parseEurToCents("   ")).toBeNull();
    expect(parseEurToCents("abc")).toBeNull();
  });

  it("retorna null para valores negativos", () => {
    expect(parseEurToCents("-5")).toBeNull();
    expect(parseEurToCents("-0.01")).toBeNull();
  });

  it("retorna null para tipos não-string", () => {
    expect(parseEurToCents(null)).toBeNull();
    expect(parseEurToCents(undefined)).toBeNull();
    expect(parseEurToCents(10)).toBeNull();
    expect(parseEurToCents({})).toBeNull();
  });
});

describe("formatEur", () => {
  // Intl pode usar U+00A0 (NBSP) entre número e símbolo; normalizamos.
  const norm = (s: string) => s.replace(/ /g, " ");

  it("formata cents em EUR locale es-ES", () => {
    expect(norm(formatEur(1000))).toBe("10,00 €");
  });

  it("formata zero", () => {
    expect(norm(formatEur(0))).toBe("0,00 €");
  });

  it("formata valores < 1 EUR", () => {
    expect(norm(formatEur(99))).toBe("0,99 €");
    expect(norm(formatEur(1))).toBe("0,01 €");
  });

  it("é inverso de parseEurToCents para entradas válidas", () => {
    const cents = parseEurToCents("123,45");
    expect(cents).toBe(12345);
    expect(norm(formatEur(cents!))).toBe("123,45 €");
  });
});
