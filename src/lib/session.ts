import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  userId?: number;
  username?: string;
};

// iron-session exige >=32 chars; derivamos um hash de 64 chars hex a
// partir do SESSION_PASSWORD pra aceitar senhas curtas. A força real
// continua sendo a entropia da senha bruta — não é segurança extra.
const sessionPassword = crypto
  .createHash("sha256")
  .update(process.env.SESSION_PASSWORD ?? "")
  .digest("hex");

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: "dogmanager_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
