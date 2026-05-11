"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl mb-3">
            🐶
          </div>
          <h1 className="text-xl font-semibold text-gray-800">DogManager</h1>
          <p className="text-sm text-gray-500">Acesse sua conta</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
