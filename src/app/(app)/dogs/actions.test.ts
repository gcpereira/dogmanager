import { describe, it, expect } from "vitest";
import { prismaMock } from "../../../../test/setup";
import { createDog, updateDog, createVisit, deleteVisit } from "./actions";

function formOf(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const validDog = {
  name: "Rex",
  gender: "M",
  age: "5",
  tutorName: "Gus",
  tutorPhone: "+34 600 000",
  allergies: "",
  behaviorNotes: "",
};

describe("createDog", () => {
  it("retorna erro sem nome", async () => {
    const res = await createDog(
      undefined,
      formOf({ ...validDog, name: "" }),
    );
    expect(res).toEqual({ error: "Nome é obrigatório." });
    expect(prismaMock.dog.create).not.toHaveBeenCalled();
  });

  it("retorna erro sem gênero", async () => {
    const res = await createDog(
      undefined,
      formOf({ ...validDog, gender: "" }),
    );
    expect(res).toEqual({ error: "Gênero é obrigatório." });
  });

  it("retorna erro com idade não numérica", async () => {
    const res = await createDog(
      undefined,
      formOf({ ...validDog, age: "abc" }),
    );
    expect(res).toEqual({ error: "Idade inválida." });
  });

  it("aceita idade vazia (nulável)", async () => {
    prismaMock.dog.create.mockResolvedValue({} as never);
    await expect(
      createDog(undefined, formOf({ ...validDog, age: "" })),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(prismaMock.dog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ age: null }),
    });
  });

  it("cria dog e redireciona no happy path", async () => {
    prismaMock.dog.create.mockResolvedValue({} as never);
    await expect(
      createDog(undefined, formOf(validDog)),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(prismaMock.dog.create).toHaveBeenCalledWith({
      data: {
        name: "Rex",
        gender: "M",
        age: 5,
        tutorName: "Gus",
        tutorPhone: "+34 600 000",
        allergies: null,
        behaviorNotes: null,
      },
    });
  });

  it("normaliza strings vazias em null", async () => {
    prismaMock.dog.create.mockResolvedValue({} as never);
    await expect(
      createDog(
        undefined,
        formOf({ ...validDog, tutorName: "", tutorPhone: "" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(prismaMock.dog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tutorName: null,
        tutorPhone: null,
      }),
    });
  });

  it("faz trim dos campos", async () => {
    prismaMock.dog.create.mockResolvedValue({} as never);
    await expect(
      createDog(
        undefined,
        formOf({ ...validDog, name: "  Rex  ", tutorName: "  Gus  " }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(prismaMock.dog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "Rex", tutorName: "Gus" }),
    });
  });
});

describe("updateDog", () => {
  it("retorna erro de validação sem chamar Prisma", async () => {
    const res = await updateDog(
      1,
      undefined,
      formOf({ ...validDog, name: "" }),
    );
    expect(res).toEqual({ error: "Nome é obrigatório." });
    expect(prismaMock.dog.update).not.toHaveBeenCalled();
  });

  it("atualiza dog com id correto", async () => {
    prismaMock.dog.update.mockResolvedValue({} as never);
    await expect(
      updateDog(7, undefined, formOf(validDog)),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(prismaMock.dog.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({ name: "Rex", age: 5 }),
    });
  });
});

describe("createVisit", () => {
  it("retorna erro sem data", async () => {
    const res = await createVisit(
      1,
      undefined,
      formOf({ value: "10", notes: "" }),
    );
    expect(res).toEqual({ error: "Data é obrigatória." });
  });

  it("retorna erro com valor inválido", async () => {
    const res = await createVisit(
      1,
      undefined,
      formOf({ date: "2026-01-01", value: "abc", notes: "" }),
    );
    expect(res).toEqual({ error: "Valor inválido." });
  });

  it("cria visita com valueCents convertido", async () => {
    prismaMock.visit.create.mockResolvedValue({} as never);
    const res = await createVisit(
      3,
      undefined,
      formOf({ date: "2026-01-15", value: "25,50", notes: "banho" }),
    );

    expect(res).toEqual({ ok: true });
    expect(prismaMock.visit.create).toHaveBeenCalledWith({
      data: {
        dogId: 3,
        date: new Date("2026-01-15T00:00:00"),
        valueCents: 2550,
        notes: "banho",
      },
    });
  });

  it("salva notes como null quando vazio", async () => {
    prismaMock.visit.create.mockResolvedValue({} as never);
    await createVisit(
      3,
      undefined,
      formOf({ date: "2026-01-15", value: "10", notes: "" }),
    );
    expect(prismaMock.visit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ notes: null }),
    });
  });
});

describe("deleteVisit", () => {
  it("deleta visita pelo id", async () => {
    prismaMock.visit.delete.mockResolvedValue({} as never);
    await deleteVisit(11, 3);
    expect(prismaMock.visit.delete).toHaveBeenCalledWith({
      where: { id: 11 },
    });
  });
});
