"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { signup } from "@/lib/actions/auth";
import type { ActionState } from "@/types";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<
    ActionState | null,
    FormData
  >(signup, null);

  // Sucesso — email de confirmação enviado
  if (state?.success) {
    return (
      <div className="space-y-6 pt-4">
        <Card className="border-0 card-shadow">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-7 w-7 text-green-500" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold">Conta criada!</h2>
            <p className="text-sm text-muted-foreground">{state.success}</p>
            <Link
              href="/login"
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Ir para o login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Comece sua jornada na Forja hoje
        </p>
      </div>

      <Card className="border-0 card-shadow">
        <CardContent className="p-5">
          <form action={formAction} className="space-y-4">
            {/* Mensagem de erro — sempre visível quando presente */}
            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                required
                disabled={isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Ao criar sua conta você concorda com os{" "}
              <Link href="#" className="text-primary hover:underline">
                Termos de uso
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
