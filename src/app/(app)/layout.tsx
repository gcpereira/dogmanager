import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Nav from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav username={session.username ?? ""} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5">{children}</main>
    </div>
  );
}
