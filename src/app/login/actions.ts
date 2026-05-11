"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Informe usuário e senha." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Usuário ou senha inválidos." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "Usuário ou senha inválidos." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  await session.save();

  redirect("/dogs");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
