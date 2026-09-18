import { prisma } from "@/lib/prisma";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CancellationReasonDialog } from "@/components/cancellation-reasons/cancellation-reason-dialog";
import { CancellationReasonActiveSwitch } from "@/components/cancellation-reasons/cancellation-reason-active-switch";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteCancellationReasonAction } from "@/lib/actions/cancellation-reasons";

export default async function CancellationReasonsPage() {
  const reasons = await prisma.cancellationReason.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Motivos de cancelamento</h1>
          <p className="text-sm text-muted-foreground">
            Motivos disponíveis ao cancelar uma OS. Inative um motivo para deixar de oferecê-lo
            sem afetar OS já canceladas com ele.
          </p>
        </div>
        <CancellationReasonDialog mode="create" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reasons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhum motivo cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            reasons.map((reason) => (
              <TableRow key={reason.id}>
                <TableCell className="font-medium text-foreground">{reason.name}</TableCell>
                <TableCell>
                  <CancellationReasonActiveSwitch reasonId={reason.id} active={reason.active} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CancellationReasonDialog mode="edit" reason={reason} />
                    <DeleteButton
                      confirmMessage={`Excluir o motivo "${reason.name}"? OS já canceladas com esse motivo deixam de exibi-lo.`}
                      action={deleteCancellationReasonAction.bind(null, reason.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
