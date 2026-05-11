import Link from "next/link";
import { notFound } from "next/navigation";
import DogForm from "@/components/DogForm";
import { prisma } from "@/lib/db";
import { updateDog, deleteDog } from "../../actions";
import DeleteButton from "./DeleteButton";

export default async function EditDogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) notFound();

  const dog = await prisma.dog.findUnique({ where: { id } });
  if (!dog) notFound();

  const updateAction = updateDog.bind(null, id);
  const deleteAction = deleteDog.bind(null, id);

  return (
    <div>
      <div className="mb-4">
        <Link href="/dogs" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-2">Editar cachorro</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <DogForm dog={dog} action={updateAction} submitLabel="Salvar alterações" />
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-red-100 p-4">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Zona de perigo</h2>
        <form action={deleteAction}>
          <DeleteButton dogName={dog.name} />
        </form>
      </div>
    </div>
  );
}
