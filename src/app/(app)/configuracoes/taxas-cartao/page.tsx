import { prisma } from "@/lib/prisma";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CreditCardFeeTierDialog } from "@/components/credit-card-fees/credit-card-fee-tier-dialog";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteCreditCardFeeTierAction } from "@/lib/actions/credit-card-fee-tiers";

export default async function CreditCardFeeTiersPage() {
  const tiers = await prisma.creditCardFeeTier.findMany({ orderBy: { minInstallments: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Taxas de cartão de crédito</h1>
          <p className="text-sm text-muted-foreground">
            Faixas de parcelamento (até 12x) e o percentual cobrado pela operadora em cada uma.
            Essa taxa é aplicada automaticamente ao escolher Cartão de Crédito como forma de
            pagamento de uma OS.
          </p>
        </div>
        <CreditCardFeeTierDialog mode="create" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parcelamento</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhuma faixa cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium text-foreground">
                  {tier.minInstallments === tier.maxInstallments
                    ? `${tier.minInstallments}x`
                    : `${tier.minInstallments}x a ${tier.maxInstallments}x`}
                </TableCell>
                <TableCell className="text-foreground">
                  {Number(tier.feePercent).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CreditCardFeeTierDialog
                      mode="edit"
                      tier={{
                        id: tier.id,
                        minInstallments: tier.minInstallments,
                        maxInstallments: tier.maxInstallments,
                        feePercent: tier.feePercent.toString(),
                      }}
                    />
                    <DeleteButton
                      confirmMessage={`Excluir a faixa de ${tier.minInstallments}x a ${tier.maxInstallments}x? OS já vendidas nessa faixa mantêm a taxa aplicada na época.`}
                      action={deleteCreditCardFeeTierAction.bind(null, tier.id)}
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
