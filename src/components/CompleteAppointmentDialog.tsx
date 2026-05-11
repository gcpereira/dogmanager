"use client";

import { useActionState, useEffect } from "react";
import { completeAppointment } from "@/app/(app)/dashboard/actions";

type Appointment = {
  id: number;
  service: string | null;
};

export default function CompleteAppointmentDialog({
  appt,
  onSuccess,
  onCancel,
}: {
  appt: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = completeAppointment.bind(null, appt.id);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-gray-600">
        Será criado um registro no histórico de atendimentos do cachorro.
      </p>

      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-1">
          Valor cobrado (€) <span className="text-red-500">*</span>
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

      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={appt.service ?? ""}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
        >
          {pending ? "Salvando..." : "Concluir e registrar"}
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
