import "server-only";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem executar esta ação.");
  }
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Não autenticado.");
  }
  return session;
}
