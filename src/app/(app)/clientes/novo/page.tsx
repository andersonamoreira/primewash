import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "@/lib/actions/clients";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-foreground">Novo cliente</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Cadastre as informações principais do cliente.
      </p>
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <ClientForm action={createClientAction} submitLabel="Cadastrar cliente" />
      </div>
    </div>
  );
}
