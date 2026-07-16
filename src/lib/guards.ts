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

export async function requireDeletePermission() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    throw new Error("Apenas administradores podem excluir registros.");
  }
  return session;
}

export async function requireReopenPermission() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN" && !session.user.canReopenWorkOrder) {
    throw new Error("Você não tem permissão para reabrir OS concluídas.");
  }
  return session;
}
