"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type DogInput = {
  name: string;
  age: number | null;
  gender: string;
  tutorName: string;
  tutorPhone: string;
  allergies: string | null;
  behaviorNotes: string | null;
};

function parseForm(formData: FormData): { data?: DogInput; error?: string } {
  const name = String(formData.get("name") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const tutorName = String(formData.get("tutorName") ?? "").trim();
  const tutorPhone = String(formData.get("tutorPhone") ?? "").trim();
  const allergies = String(formData.get("allergies") ?? "").trim();
  const behaviorNotes = String(formData.get("behaviorNotes") ?? "").trim();

  if (!name) return { error: "Nome é obrigatório." };
  if (!gender) return { error: "Gênero é obrigatório." };
  if (!tutorName) return { error: "Nome do tutor é obrigatório." };
  if (!tutorPhone) return { error: "Telefone do tutor é obrigatório." };

  const age = ageRaw ? Number.parseInt(ageRaw, 10) : null;
  if (ageRaw && Number.isNaN(age!)) {
    return { error: "Idade inválida." };
  }

  return {
    data: {
      name,
      age,
      gender,
      tutorName,
      tutorPhone,
      allergies: allergies || null,
      behaviorNotes: behaviorNotes || null,
    },
  };
}

export async function createDog(_prev: { error?: string } | undefined, formData: FormData) {
  const parsed = parseForm(formData);
  if (parsed.error) return { error: parsed.error };

  await prisma.dog.create({ data: parsed.data! });
  revalidatePath("/dogs");
  redirect("/dogs");
}

export async function updateDog(
  id: number,
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const parsed = parseForm(formData);
  if (parsed.error) return { error: parsed.error };

  await prisma.dog.update({ where: { id }, data: parsed.data! });
  revalidatePath("/dogs");
  revalidatePath(`/dogs/${id}/edit`);
  redirect("/dogs");
}

export async function deleteDog(id: number) {
  await prisma.dog.delete({ where: { id } });
  revalidatePath("/dogs");
  redirect("/dogs");
}
