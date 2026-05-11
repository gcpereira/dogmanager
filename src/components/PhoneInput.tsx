"use client";

import { useMemo, useState } from "react";

type Country = { code: string; name: string; dial: string; flag: string };

const COUNTRIES: Country[] = [
  { code: "ES", name: "Espanha", dial: "+34", flag: "🇪🇸" },
  { code: "AT", name: "Áustria", dial: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Bélgica", dial: "+32", flag: "🇧🇪" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "BG", name: "Bulgária", dial: "+359", flag: "🇧🇬" },
  { code: "CY", name: "Chipre", dial: "+357", flag: "🇨🇾" },
  { code: "HR", name: "Croácia", dial: "+385", flag: "🇭🇷" },
  { code: "DK", name: "Dinamarca", dial: "+45", flag: "🇩🇰" },
  { code: "SK", name: "Eslováquia", dial: "+421", flag: "🇸🇰" },
  { code: "SI", name: "Eslovênia", dial: "+386", flag: "🇸🇮" },
  { code: "EE", name: "Estônia", dial: "+372", flag: "🇪🇪" },
  { code: "US", name: "EUA", dial: "+1", flag: "🇺🇸" },
  { code: "FI", name: "Finlândia", dial: "+358", flag: "🇫🇮" },
  { code: "FR", name: "França", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", dial: "+49", flag: "🇩🇪" },
  { code: "GR", name: "Grécia", dial: "+30", flag: "🇬🇷" },
  { code: "NL", name: "Holanda", dial: "+31", flag: "🇳🇱" },
  { code: "HU", name: "Hungria", dial: "+36", flag: "🇭🇺" },
  { code: "IE", name: "Irlanda", dial: "+353", flag: "🇮🇪" },
  { code: "IT", name: "Itália", dial: "+39", flag: "🇮🇹" },
  { code: "LV", name: "Letônia", dial: "+371", flag: "🇱🇻" },
  { code: "LT", name: "Lituânia", dial: "+370", flag: "🇱🇹" },
  { code: "LU", name: "Luxemburgo", dial: "+352", flag: "🇱🇺" },
  { code: "MT", name: "Malta", dial: "+356", flag: "🇲🇹" },
  { code: "NO", name: "Noruega", dial: "+47", flag: "🇳🇴" },
  { code: "PL", name: "Polônia", dial: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧" },
  { code: "CZ", name: "Tchéquia", dial: "+420", flag: "🇨🇿" },
  { code: "RO", name: "Romênia", dial: "+40", flag: "🇷🇴" },
  { code: "SE", name: "Suécia", dial: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Suíça", dial: "+41", flag: "🇨🇭" },
];

function parseInitial(value: string | null | undefined) {
  if (!value) return { code: "ES", number: "" };
  const trimmed = value.trim();
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (trimmed.startsWith(c.dial)) {
      return { code: c.code, number: trimmed.slice(c.dial.length).trim() };
    }
  }
  return { code: "ES", number: trimmed };
}

export default function PhoneInput({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const initial = useMemo(() => parseInitial(defaultValue), [defaultValue]);
  const [code, setCode] = useState(initial.code);
  const [number, setNumber] = useState(initial.number);

  const selected = COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
  const trimmed = number.trim();
  const combined = trimmed ? `${selected.dial} ${trimmed}` : "";

  return (
    <div className="flex">
      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-label="País"
        className="rounded-l-lg border border-r-0 border-gray-200 bg-white pl-2 pr-1 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:z-10 outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required={required}
        placeholder="612 345 678"
        aria-label="Número"
        className="flex-1 min-w-0 rounded-r-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:z-10 outline-none"
      />
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
