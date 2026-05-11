"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const links = [
  { href: "/dogs", label: "Cachorros", icon: "🐶" },
  { href: "/dashboard", label: "Agenda", icon: "📅" },
];

export default function Nav({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dogs" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center">
              🐶
            </div>
            <span className="font-semibold text-gray-800">DogManager</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">
              Olá, {username}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-brand-600"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="max-w-3xl mx-auto px-4 flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 sm:flex-none sm:px-6 py-3 text-center text-sm font-medium border-b-2 transition ${
                  active
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-1.5">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
