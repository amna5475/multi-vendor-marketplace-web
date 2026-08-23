"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StorefrontShell } from "@/components/storefront-shell";
import { Button, ErrorBanner, Field, inputClass, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("full_name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      phone: String(form.get("phone")),
      role: "customer" as const,
    };
    try {
      await register(payload);
      await login(payload.email, payload.password);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register.");
    } finally {
      setPending(false);
    }
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-md">
        <PageHeader
          eyebrow="Account"
          title="Join Souk"
          description="Creates a customer via POST /api/auth/register. Sellers apply from the account area after login."
        />
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-ink/10 bg-white p-6">
          {error ? <ErrorBanner message={error} /> : null}
          <Field label="Full name">
            <input className={inputClass} name="full_name" required minLength={3} />
          </Field>
          <Field label="Email">
            <input className={inputClass} name="email" type="email" required />
          </Field>
          <Field label="Phone">
            <input className={inputClass} name="phone" required placeholder="03001234567" />
          </Field>
          <Field label="Password">
            <input className={inputClass} name="password" type="password" required minLength={6} />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
      </div>
    </StorefrontShell>
  );
}
