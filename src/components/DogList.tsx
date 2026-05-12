"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Dog = {
  id: number;
  name: string;
  age: number | null;
  gender: string;
  tutorName: string | null;
  tutorPhone: string | null;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function DogList({ dogs }: { dogs: Dog[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return dogs;
    return dogs.filter(
      (d) =>
        normalize(d.name).includes(q) ||
        normalize(d.tutorName ?? "").includes(q),
    );
  }, [dogs, query]);

  return (
    <div>
      <div className="relative mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cachorro ou tutor..."
          aria-label="Buscar"
          className="w-full rounded-lg border border-gray-200 pl-9 pr-9 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 w-7 h-7 rounded-full flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        {query && ` para "${query}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600">
            {dogs.length === 0
              ? "Nenhum cachorro cadastrado ainda."
              : "Nenhum resultado encontrado."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((dog) => (
            <li key={dog.id}>
              <Link
                href={`/dogs/${dog.id}/edit`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-300 transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {dog.name}
                      </h3>
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                        {dog.gender}
                      </span>
                      {dog.age != null && (
                        <span className="text-xs text-gray-500">
                          {dog.age} {dog.age === 1 ? "ano" : "anos"}
                        </span>
                      )}
                    </div>
                    {dog.tutorName && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        Tutor: {dog.tutorName}
                      </p>
                    )}
                    {dog.tutorPhone && (
                      <p className="text-sm text-gray-500 truncate">
                        {dog.tutorPhone}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-300 text-xl shrink-0">›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
