"use server";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "dogs");

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
  const photos = await prisma.photo.findMany({
    where: { dogId: id },
    select: { filename: true },
  });
  await prisma.dog.delete({ where: { id } });
  await Promise.all(
    photos.map((p) =>
      unlink(path.join(UPLOAD_DIR, p.filename)).catch(() => {}),
    ),
  );
  revalidatePath("/dogs");
  redirect("/dogs");
}

export async function uploadPhoto(
  dogId: number,
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Arquivo inválido." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "Arquivo muito grande (máx 10 MB)." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Formato não suportado." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomBytes(12).toString("hex")}.jpg`;
  await writeFile(
    path.join(UPLOAD_DIR, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  await prisma.photo.create({ data: { dogId, filename } });
  revalidatePath(`/dogs/${dogId}/edit`);
  return { ok: true };
}

export async function deletePhoto(photoId: number, dogId: number) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id: photoId } });
  await unlink(path.join(UPLOAD_DIR, photo.filename)).catch(() => {});
  revalidatePath(`/dogs/${dogId}/edit`);
}

export async function createVisit(
  dogId: number,
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData,
) {
  const dateRaw = String(formData.get("date") ?? "").trim();
  const valueRaw = String(formData.get("value") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!dateRaw) return { error: "Data é obrigatória." };
  const date = new Date(`${dateRaw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { error: "Data inválida." };

  if (!valueRaw) return { error: "Valor é obrigatório." };
  const valueNum = Number.parseFloat(valueRaw.replace(",", "."));
  if (Number.isNaN(valueNum) || valueNum < 0) {
    return { error: "Valor inválido." };
  }
  const valueCents = Math.round(valueNum * 100);

  await prisma.visit.create({
    data: { dogId, date, valueCents, notes: notes || null },
  });
  revalidatePath(`/dogs/${dogId}/edit`);
  return { ok: true };
}

export async function deleteVisit(visitId: number, dogId: number) {
  await prisma.visit.delete({ where: { id: visitId } });
  revalidatePath(`/dogs/${dogId}/edit`);
}
