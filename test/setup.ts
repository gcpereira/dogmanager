import { beforeEach, vi } from "vitest";
import {
  mockDeep,
  mockReset,
  type DeepMockProxy,
} from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

type MutableSession = {
  userId: number | undefined;
  username: string | undefined;
  save: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
};

export const sessionMock: MutableSession = {
  userId: undefined,
  username: undefined,
  save: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(async () => sessionMock),
}));

// Imported AFTER the mock so the value is the deep-mocked client.
import { prisma } from "@/lib/db";

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  sessionMock.userId = undefined;
  sessionMock.username = undefined;
  sessionMock.save.mockClear();
  sessionMock.destroy.mockClear();
});
