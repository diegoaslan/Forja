"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types";

// ── Schemas de validação ──────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").trim(),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

// ── Actions ───────────────────────────────────────────────────────

export async function login(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Validate form fields
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  console.log("[login] campos recebidos:", { email: raw.email });

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? "Dados inválidos";
    console.log("[login] validação falhou:", msg);
    return { error: msg };
  }

  // Call Supabase — wrapped in try/catch to catch network/config errors
  let supabaseError: string | null = null;
  try {
    const supabase = await createClient();
    console.log("[login] cliente criado");

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      console.log("[login] erro Supabase:", error.message);
      if (error.message.toLowerCase().includes("email not confirmed")) {
        supabaseError =
          "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.";
      } else {
        supabaseError = "Email ou senha incorretos. Verifique e tente novamente.";
      }
    }
  } catch (err) {
    console.error("[login] exceção não tratada:", err);
    supabaseError = "Erro de conexão ao fazer login. Tente novamente.";
  }

  if (supabaseError) return { error: supabaseError };

  // redirect() must be called outside try/catch — it throws intentionally
  console.log("[login] sucesso — redirecionando para /home");
  redirect("/home");
}

export async function signup(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Validate form fields
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  };
  console.log("[signup] campos recebidos:", { name: raw.name, email: raw.email });

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? "Dados inválidos";
    console.log("[signup] validação falhou:", msg);
    return { error: msg };
  }

  // Call Supabase — wrapped in try/catch to catch network/config errors
  let redirectToHome = false;
  let actionResult: ActionState | null = null;

  try {
    const supabase = await createClient();
    console.log("[signup] cliente criado");

    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.name },
      },
    });

    console.log("[signup] resposta Supabase:", {
      userId: data?.user?.id ?? null,
      hasSession: !!data?.session,
      errorMsg: error?.message ?? null,
    });

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("already exists")
      ) {
        actionResult = { error: "Este email já está cadastrado." };
      } else if (error.message.includes("Password should")) {
        actionResult = { error: "Senha muito fraca. Use letras, números e símbolos." };
      } else {
        actionResult = { error: `Erro ao criar conta: ${error.message}` };
      }
    } else if (!data.user) {
      actionResult = {
        error: "Não foi possível criar o usuário. Tente novamente.",
      };
    } else if (data.session) {
      // Email confirmation disabled → session created → redirect
      console.log("[signup] sessão criada — vai redirecionar para /home");
      redirectToHome = true;
    } else {
      // Email confirmation enabled → waiting for user to confirm
      console.log("[signup] aguardando confirmação de email");
      actionResult = {
        success:
          "Conta criada! Verifique seu email para confirmar o cadastro antes de entrar.",
      };
    }
  } catch (err) {
    console.error("[signup] exceção não tratada:", err);
    actionResult = { error: "Erro de conexão ao criar conta. Tente novamente." };
  }

  if (actionResult) return actionResult;

  // redirect() must be called outside try/catch — it throws intentionally
  redirect("/home");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
