"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-pw-navy-950 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mb-1.5 text-lg font-semibold text-foreground">Ops, algo deu errado</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          Ocorreu um erro inesperado ao carregar esta página. Você pode tentar novamente ou voltar
          para o início.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="secondary" asChild>
            <a href="/">
              <Home className="size-4" /> Início
            </a>
          </Button>
          <Button onClick={() => unstable_retry()}>
            <RotateCcw className="size-4" /> Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
