import { describe, it, expect } from "vitest";
import { prismaMock } from "../../../../test/setup";
import {
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  deleteAppointment,
  completeAppointment,
} from "./actions";

function formOf(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const validAppt = {
  dogId: "5",
  date: "2026-06-01",
  time: "14:30",
  durationMin: "60",
  service: "Banho",
};

describe("createAppointment", () => {
  it("erro sem dogId", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, dogId: "" }),
    );
    expect(res).toEqual({ error: "Selecione um cachorro." });
  });

  it("erro com dogId não numérico", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, dogId: "abc" }),
    );
    expect(res).toEqual({ error: "Selecione um cachorro." });
  });

  it("erro sem data", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, date: "" }),
    );
    expect(res).toEqual({ error: "Data é obrigatória." });
  });

  it("erro sem hora", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, time: "" }),
    );
    expect(res).toEqual({ error: "Hora é obrigatória." });
  });

  it("erro com duração zero", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, durationMin: "0" }),
    );
    expect(res).toEqual({ error: "Duração inválida." });
  });

  it("erro com duração negativa", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, durationMin: "-15" }),
    );
    expect(res).toEqual({ error: "Duração inválida." });
  });

  it("erro com duração vazia", async () => {
    const res = await createAppointment(
      undefined,
      formOf({ ...validAppt, durationMin: "" }),
    );
    expect(res).toEqual({ error: "Duração inválida." });
  });

  it("cria appointment montando startsAt no fuso local", async () => {
    prismaMock.appointment.create.mockResolvedValue({} as never);
    const res = await createAppointment(undefined, formOf(validAppt));

    expect(res).toEqual({ ok: true });
    expect(prismaMock.appointment.create).toHaveBeenCalledWith({
      data: {
        dogId: 5,
        startsAt: new Date("2026-06-01T14:30:00"),
        durationMin: 60,
        service: "Banho",
      },
    });
  });

  it("service vazio vira null", async () => {
    prismaMock.appointment.create.mockResolvedValue({} as never);
    await createAppointment(
      undefined,
      formOf({ ...validAppt, service: "" }),
    );
    expect(prismaMock.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ service: null }),
    });
  });
});

describe("updateAppointment", () => {
  it("propaga erro de validação", async () => {
    const res = await updateAppointment(
      9,
      undefined,
      formOf({ ...validAppt, dogId: "" }),
    );
    expect(res).toEqual({ error: "Selecione um cachorro." });
    expect(prismaMock.appointment.update).not.toHaveBeenCalled();
  });

  it("atualiza com id correto", async () => {
    prismaMock.appointment.update.mockResolvedValue({} as never);
    const res = await updateAppointment(9, undefined, formOf(validAppt));
    expect(res).toEqual({ ok: true });
    expect(prismaMock.appointment.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: expect.objectContaining({ dogId: 5, durationMin: 60 }),
    });
  });
});

describe("rescheduleAppointment", () => {
  it("erro com ISO inválido", async () => {
    const res = await rescheduleAppointment(1, "não-é-data");
    expect(res).toEqual({ error: "Data inválida." });
    expect(prismaMock.appointment.update).not.toHaveBeenCalled();
  });

  it("atualiza só o startsAt", async () => {
    prismaMock.appointment.update.mockResolvedValue({} as never);
    const iso = "2026-07-10T10:00:00.000Z";
    const res = await rescheduleAppointment(7, iso);
    expect(res).toEqual({ ok: true });
    expect(prismaMock.appointment.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { startsAt: new Date(iso) },
    });
  });
});

describe("deleteAppointment", () => {
  it("deleta pelo id", async () => {
    prismaMock.appointment.delete.mockResolvedValue({} as never);
    await deleteAppointment(3);
    expect(prismaMock.appointment.delete).toHaveBeenCalledWith({
      where: { id: 3 },
    });
  });
});

describe("completeAppointment", () => {
  it("erro com valor inválido", async () => {
    const res = await completeAppointment(
      1,
      undefined,
      formOf({ value: "abc", notes: "" }),
    );
    expect(res).toEqual({ error: "Valor inválido." });
  });

  it("erro quando appointment não existe", async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(null);
    const res = await completeAppointment(
      99,
      undefined,
      formOf({ value: "10", notes: "" }),
    );
    expect(res).toEqual({ error: "Marcação não encontrada." });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("happy path: cria visita e roda transação", async () => {
    const appt = {
      id: 5,
      dogId: 8,
      startsAt: new Date("2026-04-10T11:00:00"),
      durationMin: 60,
      service: "Banho",
      createdAt: new Date(),
    };
    prismaMock.appointment.findUnique.mockResolvedValue(appt);
    prismaMock.$transaction.mockResolvedValue([] as never);

    const res = await completeAppointment(
      5,
      undefined,
      formOf({ value: "30,00", notes: "tudo ok" }),
    );

    expect(res).toEqual({ ok: true });
    expect(prismaMock.visit.create).toHaveBeenCalledWith({
      data: {
        dogId: 8,
        date: appt.startsAt,
        valueCents: 3000,
        notes: "tudo ok",
      },
    });
    expect(prismaMock.appointment.delete).toHaveBeenCalledWith({
      where: { id: 5 },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });

  it("usa service como notes quando notes está vazio", async () => {
    const appt = {
      id: 6,
      dogId: 9,
      startsAt: new Date("2026-04-11T11:00:00"),
      durationMin: 60,
      service: "Tosa",
      createdAt: new Date(),
    };
    prismaMock.appointment.findUnique.mockResolvedValue(appt);
    prismaMock.$transaction.mockResolvedValue([] as never);

    await completeAppointment(
      6,
      undefined,
      formOf({ value: "20", notes: "" }),
    );

    expect(prismaMock.visit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ notes: "Tosa" }),
    });
  });
});
