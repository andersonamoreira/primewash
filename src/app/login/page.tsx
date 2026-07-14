import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pw-navy-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/logo.png"
            alt="Prime Wash"
            width={96}
            height={96}
            className="size-24 rounded-2xl object-cover shadow-lg"
            priority
          />
          <div>
            <h1 className="text-xl font-bold tracking-wide text-foreground">
              PRIME <span className="text-pw-blue-400">WASH</span>
            </h1>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Estética de Motos
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-xl">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Entrar no sistema</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
