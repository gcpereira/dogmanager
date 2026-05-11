import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const dogs = await prisma.dog.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cachorros</h1>
          <p className="text-sm text-gray-500">
            {dogs.length} {dogs.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <Link
          href="/dogs/new"
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          + Novo
        </Link>
      </div>

      {dogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-2">🐶</div>
          <p className="text-gray-600 mb-3">Nenhum cachorro cadastrado ainda.</p>
          <Link
            href="/dogs/new"
            className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
          >
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {dogs.map((dog) => (
            <li key={dog.id}>
              <Link
                href={`/dogs/${dog.id}/edit`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-brand-300 transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 truncate">{dog.name}</h3>
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                        {dog.gender}
                      </span>
                      {dog.age != null && (
                        <span className="text-xs text-gray-500">
                          {dog.age} {dog.age === 1 ? "ano" : "anos"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      Tutor: {dog.tutorName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{dog.tutorPhone}</p>
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
