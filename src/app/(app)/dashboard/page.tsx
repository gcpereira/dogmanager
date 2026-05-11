import { prisma } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [appointments, dogs] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { startsAt: "asc" },
      include: { dog: { select: { id: true, name: true } } },
    }),
    prisma.dog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <DashboardClient appointments={appointments} dogs={dogs} />;
}
