"use client";

import { useActionState } from "react";
import Link from "next/link";

type Dog = {
  id?: number;
  name?: string;
  age?: number | null;
  gender?: string;
  tutorName?: string;
  tutorPhone?: string;
  allergies?: string | null;
  behaviorNotes?: string | null;
};

type Action = (
  prev: { error?: string } | undefined,
  formData: FormData,
) => Promise<{ error?: string } | undefined>;

export default function DogForm({
  dog,
  action,
  submitLabel,
}: {
  dog?: Dog;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Nome" required>
        <input
          name="name"
          required
          defaultValue={dog?.name ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Idade (anos)">
          <input
            name="age"
            type="number"
            min={0}
            max={40}
            inputMode="numeric"
            defaultValue={dog?.age ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Gênero" required>
          <select
            name="gender"
            required
            defaultValue={dog?.gender ?? ""}
            className={inputClass}
          >
            <option value="" disabled>Selecione</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </Field>
      </div>

      <Field label="Nome do tutor" required>
        <input
          name="tutorName"
          required
          defaultValue={dog?.tutorName ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Telefone do tutor" required>
        <input
          name="tutorPhone"
          type="tel"
          required
          inputMode="tel"
          placeholder="(11) 99999-9999"
          defaultValue={dog?.tutorPhone ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Alergias">
        <textarea
          name="allergies"
          rows={2}
          defaultValue={dog?.allergies ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Observações sobre comportamento">
        <textarea
          name="behaviorNotes"
          rows={3}
          defaultValue={dog?.behaviorNotes ?? ""}
          className={inputClass}
        />
      </Field>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
        <Link
          href="/dogs"
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancelar
        </Link>
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
