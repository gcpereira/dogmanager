import Link from "next/link";
import DogForm from "@/components/DogForm";
import { createDog } from "../actions";

export default function NewDogPage() {
  return (
    <div>
      <div className="mb-4">
        <Link href="/dogs" className="text-sm text-brand-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 mt-2">Novo cachorro</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <DogForm action={createDog} submitLabel="Cadastrar" />
      </div>
    </div>
  );
}
