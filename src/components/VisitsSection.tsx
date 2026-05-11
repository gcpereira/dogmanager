"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createVisit, deleteVisit } from "@/app/(app)/dogs/actions";

type Visit = {
  id: number;
  date: Date;
  valueCents: number;
  notes: string | null;
};

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function VisitsSection({
  dogId,
  visits,
}: {
  dogId: number;
  visits: Visit[];
}) {
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const action = createVisit.bind(null, dogId);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setExpanded(false);
    }
  }, [state]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Histórico de atendimentos
        </h2>
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition"
          >
            + Novo
          </button>
        )}
      </div>

      {expanded && (
        <form
          ref={formRef}
          action={formAction}
          className="bg-gray-50 rounded-xl border border-gray-100 p-3 mb-3 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">
                Data <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                name="date"
                required
                defaultValue={todayISO()}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">
                Valor (€) <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                name="value"
                step="0.01"
                min="0"
                required
                inputMode="decimal"
                placeholder="0,00"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1">
              Observações
            </span>
            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </label>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2 transition"
            >
              {pending ? "Salvando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {visits.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum atendimento registrado ainda.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {visits.map((v) => (
            <li key={v.id} className="py-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="font-medium text-gray-800">
                    {dateFmt.format(new Date(v.date))}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-semibold text-brand-700">
                    {eur.format(v.valueCents / 100)}
                  </span>
                </div>
                {v.notes && (
                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                    {v.notes}
                  </p>
                )}
              </div>
              <form action={deleteVisit.bind(null, v.id, dogId)}>
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Excluir este atendimento?")) {
                      e.preventDefault();
                    }
                  }}
                  aria-label="Excluir atendimento"
                  className="w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-lg transition shrink-0"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
