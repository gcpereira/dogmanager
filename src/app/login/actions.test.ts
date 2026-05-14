import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, sessionMock } from "../../../test/setup";
import { login, logout } from "./actions";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
  compare: vi.fn(),
}));

import bcrypt from "bcryptjs";

function formOf(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const fakeUser = {
  id: 42,
  username: "gus",
  passwordHash: "hash",
  createdAt: new Date(),
};

describe("login", () => {
  beforeEach(() => {
    vi.mocked(bcrypt.compare).mockReset();
  });

  it("retorna erro quando username está vazio", async () => {
    const res = await login(undefined, formOf({ password: "x" }));
    expect(res).toEqual({ error: "Informe usuário e senha." });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("retorna erro quando password está vazio", async () => {
    const res = await login(undefined, formOf({ username: "gus" }));
    expect(res).toEqual({ error: "Informe usuário e senha." });
  });

  it("retorna erro quando usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await login(
      undefined,
      formOf({ username: "ghost", password: "x" }),
    );
    expect(res).toEqual({ error: "Usuário ou senha inválidos." });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: "ghost" },
    });
  });

  it("retorna erro quando senha não bate", async () => {
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const res = await login(
      undefined,
      formOf({ username: "gus", password: "wrong" }),
    );
    expect(res).toEqual({ error: "Usuário ou senha inválidos." });
  });

  it("loga, popula sessão e redireciona pra /dogs no happy path", async () => {
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      login(undefined, formOf({ username: "gus", password: "ok" })),
    ).rejects.toThrow("NEXT_REDIRECT:/dogs");

    expect(sessionMock.userId).toBe(42);
    expect(sessionMock.username).toBe("gus");
    expect(sessionMock.save).toHaveBeenCalledOnce();
  });

  it("faz trim do username", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await login(
      undefined,
      formOf({ username: "  gus  ", password: "x" }),
    );
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: "gus" },
    });
  });
});

describe("logout", () => {
  it("destroi sessão e redireciona pra /login", async () => {
    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(sessionMock.destroy).toHaveBeenCalledOnce();
  });
});
