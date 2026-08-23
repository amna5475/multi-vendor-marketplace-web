"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StorefrontShell } from "@/components/storefront-shell";
import { Button, ErrorBanner, Field, inputClass, PageHeader } from "@/components/ui";
import { homeForRole, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(homeForRole(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Is the API running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-md">
        <PageHeader eyebrow="Account" title="Sign in" description="JWT login against POST /api/auth/login. Role decides whether you land in the store, seller console, or admin." />
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-ink/10 bg-white p-6">
          {error ? <ErrorBanner message={error} /> : null}
          <Field label="Email">
            <input className={inputClass} name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="Password">
            <input className={inputClass} name="password" type="password" required minLength={6} autoComplete="current-password" />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </StorefrontShell>
  );
}
