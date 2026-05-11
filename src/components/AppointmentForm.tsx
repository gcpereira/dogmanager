"use client";

import { useActionState, useEffect } from "react";
import { SERVICES } from "@/lib/services";
import {
  createAppointment,
  updateAppointment,
} from "@/app/(app)/dashboard/actions";

type Dog = { id: number; name: string };

export type AppointmentInitial = {
  id?: number;
  dogId?: number;
  date?: string; // yyyy-mm-dd
  time?: string; // HH:mm
  durationMin?: number;
  service?: string | null;
};

export default function AppointmentForm({
  dogs,
  initial,
  onSuccess,
  onCancel,
}: {
  dogs: Dog[];
  initial?: AppointmentInitial;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const editingId = initial?.id;
  const action = editingId
    ? updateAppointment.bind(null, editingId)
    : createAppointment;

  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Cachorro" required>
        <select
          name="dogId"
          required
          defaultValue={initial?.dogId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione
          </option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" required>
          <input
            type="date"
            name="date"
            required
            defaultValue={initial?.date ?? todayISO()}
            className={inputClass}
          />
        </Field>

        <Field label="Hora" required>
          <input
            type="time"
            name="time"
            required
            defaultValue={initial?.time ?? "10:00"}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Duração (min)" required>
          <input
            type="number"
            name="durationMin"
            required
            min={15}
            step={15}
            inputMode="numeric"
            defaultValue={initial?.durationMin ?? 60}
            className={inputClass}
          />
        </Field>

        <Field label="Serviço">
          <select
            name="service"
            defaultValue={initial?.service ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
        >
          {pending ? "Salvando..." : editingId ? "Salvar" : "Criar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
