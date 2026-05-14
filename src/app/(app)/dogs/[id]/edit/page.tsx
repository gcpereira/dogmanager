import Link from "next/link";
import { notFound } from "next/navigation";
import DogForm from "@/components/DogForm";
import VisitsSection from "@/components/VisitsSection";
import PhotosSection from "@/components/PhotosSection";
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

  const dog = await prisma.dog.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { date: "desc" },
        select: { id: true, date: true, valueCents: true, notes: true },
      },
      photos: {
        orderBy: { createdAt: "desc" },
        select: { id: true, url: true },
      },
    },
  });
  if (!dog) notFound();

  const updateAction = updateDog.bind(null, id);
  const deleteAction = deleteDog.bind(null, id);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/dogs" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-2">Editar cachorro</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <DogForm dog={dog} action={updateAction} submitLabel="Salvar alterações" />
      </div>

      <VisitsSection dogId={id} visits={dog.visits} />

      <PhotosSection dogId={id} photos={dog.photos} />

      <div className="bg-white rounded-2xl border border-red-100 p-4">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Zona de perigo</h2>
        <form action={deleteAction}>
          <DeleteButton dogName={dog.name} />
        </form>
      </div>
    </div>
  );
}
