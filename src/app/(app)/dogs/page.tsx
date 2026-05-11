import Link from "next/link";
import { prisma } from "@/lib/db";
import DogList from "@/components/DogList";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const dogs = await prisma.dog.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Cachorros</h1>
        <Link
          href="/dogs/new"
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          + Novo
        </Link>
      </div>

      <DogList dogs={dogs} />
    </div>
  );
}
