"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseEurToCents } from "@/lib/money";

type Result = { error?: string; ok?: boolean };

function parseAppointmentForm(formData: FormData): {
  data?: {
    dogId: number;
    startsAt: Date;
    durationMin: number;
    service: string | null;
  };
  error?: string;
} {
  const dogIdRaw = String(formData.get("dogId") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "").trim();
  const timeRaw = String(formData.get("time") ?? "").trim();
  const durationRaw = String(formData.get("durationMin") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();

  const dogId = Number.parseInt(dogIdRaw, 10);
  if (!dogIdRaw || Number.isNaN(dogId)) {
    return { error: "Selecione um cachorro." };
  }
  if (!dateRaw) return { error: "Data é obrigatória." };
  if (!timeRaw) return { error: "Hora é obrigatória." };

  const startsAt = new Date(`${dateRaw}T${timeRaw}:00`);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Data ou hora inválida." };
  }

  const durationMin = Number.parseInt(durationRaw, 10);
  if (!durationRaw || Number.isNaN(durationMin) || durationMin <= 0) {
    return { error: "Duração inválida." };
  }

  return {
    data: {
      dogId,
      startsAt,
      durationMin,
      service: service || null,
    },
  };
}

export async function createAppointment(
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const parsed = parseAppointmentForm(formData);
  if (parsed.error) return { error: parsed.error };

  await prisma.appointment.create({ data: parsed.data! });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAppointment(
  id: number,
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const parsed = parseAppointmentForm(formData);
  if (parsed.error) return { error: parsed.error };

  await prisma.appointment.update({ where: { id }, data: parsed.data! });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rescheduleAppointment(
  id: number,
  startsAtISO: string,
): Promise<Result> {
  const startsAt = new Date(startsAtISO);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Data inválida." };
  }
  await prisma.appointment.update({ where: { id }, data: { startsAt } });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAppointment(id: number): Promise<void> {
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function completeAppointment(
  id: number,
  _prev: Result | undefined,
  formData: FormData,
): Promise<Result> {
  const valueCents = parseEurToCents(formData.get("value"));
  if (valueCents === null) return { error: "Valor inválido." };

  const notes = String(formData.get("notes") ?? "").trim();

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return { error: "Marcação não encontrada." };

  await prisma.$transaction([
    prisma.visit.create({
      data: {
        dogId: appt.dogId,
        date: appt.startsAt,
        valueCents,
        notes: notes || appt.service || null,
      },
    }),
    prisma.appointment.delete({ where: { id } }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/dogs/${appt.dogId}/edit`);
  return { ok: true };
}
