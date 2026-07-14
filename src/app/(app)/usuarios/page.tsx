import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { UserDialog } from "@/components/users/user-dialog";
import { ToggleActiveSwitch } from "@/components/users/toggle-active-switch";
import { auth } from "@/lib/auth";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quem tem acesso ao sistema Prime Wash.
          </p>
        </div>
        <UserDialog mode="create" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-foreground">
                {user.name}
                {user.id === session?.user.id && (
                  <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "accent" : "secondary"}>
                  {user.role === "ADMIN" ? "Administrador" : "Usuário comum"}
                </Badge>
              </TableCell>
              <TableCell>
                <ToggleActiveSwitch userId={user.id} active={user.active} />
              </TableCell>
              <TableCell className="text-right">
                <UserDialog mode="edit" user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
