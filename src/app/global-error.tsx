"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#05070A",
          color: "#F5F6F7",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "24rem",
            textAlign: "center",
            border: "1px solid #22262f",
            borderRadius: "0.75rem",
            padding: "1.5rem",
            backgroundColor: "#0e1218",
          }}
        >
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Ops, algo deu errado
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#9aa3af", marginBottom: "1.25rem" }}>
            Ocorreu um erro inesperado. Tente novamente em instantes.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              backgroundColor: "#1E9FE8",
              color: "#05070A",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
