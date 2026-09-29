import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { getSession } from "@/lib/auth";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Sign in | SmartIQLiving Admin",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="font-semibold text-xl tracking-tight">SmartIQLiving Admin</h1>
          <p className="text-muted-foreground text-sm">Sign in with your SmartIQLiving CRM account.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
