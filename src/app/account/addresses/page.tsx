"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, ErrorBanner, Field, PageHeader, Spinner, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Address } from "@/lib/types";

export default function AddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<Address[]>("/addresses/me", { token })
      .then((data) => setAddresses(asList(data)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load addresses."))
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    try {
      const created = await api<Address>("/addresses", {
        method: "POST",
        token,
        body: Object.fromEntries(new FormData(form).entries()),
      });
      setAddresses((current) => [created, ...current]);
      form.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save address.");
    }
  }

  async function makeDefault(id: string) {
    if (!token) return;
    await api(`/addresses/${id}/default`, { method: "PUT", token });
    setAddresses((current) => current.map((row) => ({ ...row, is_default: row.id === id })));
  }

  return (
    <>
      <PageHeader title="Addresses" description="Saved shipping addresses for checkout." />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Full name"><input className={inputClass} name="full_name" required /></Field>
        <Field label="Phone"><input className={inputClass} name="phone" required /></Field>
        <Field label="City"><input className={inputClass} name="city" required /></Field>
        <Field label="Street"><input className={inputClass} name="street" required /></Field>
        <div className="sm:col-span-2">
          <Button type="submit">Add address</Button>
        </div>
      </form>
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Name", "City", "Street", "Default"]}
            empty={<EmptyState title="No addresses" body="Add one before checkout." />}
            rows={addresses.map((address) => [
              address.full_name,
              address.city,
              address.street,
              address.is_default ? (
                "Default"
              ) : (
                <button key={address.id} className="text-terracotta" onClick={() => makeDefault(address.id)}>
                  Make default
                </button>
              ),
            ])}
          />
        )}
      </div>
    </>
  );
}
