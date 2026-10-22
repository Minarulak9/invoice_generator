import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/db";
import { saveCustomer } from "@/db/records";
import { loadSettings, updateSettings } from "@/db/settings";
import { createInvoice } from "@/lib/invoice-factory";
import { DEFAULT_SETTINGS, type Invoice } from "@/lib/schema";
import { rememberParties } from "./remember";

const memory = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
});

function invoice(partial: { seller?: string; customer?: string; gstin?: string } = {}): Invoice {
  const inv = createInvoice({
    settings: DEFAULT_SETTINGS,
    designs: [],
    docType: "tax_invoice",
    generated: { number: "INV-1", autoNumber: null },
  });
  return {
    ...inv,
    seller: { ...inv.seller, name: partial.seller ?? "Zynitex Studio" },
    customer: {
      ...inv.customer,
      name: partial.customer ?? "Acme Pvt Ltd",
      gstin: partial.gstin ?? "",
    },
  };
}

beforeEach(async () => {
  await Promise.all(getDb().tables.map((t) => t.clear()));
});

describe("rememberParties", () => {
  it("saves the seller as the business profile when none exists", async () => {
    const result = await rememberParties(invoice());
    expect(result.profile).toBe(true);
    expect((await loadSettings()).profile.name).toBe("Zynitex Studio");
  });

  it("never overwrites an existing business profile", async () => {
    await updateSettings((s) => ({ ...s, profile: { ...s.profile, name: "Original Co" } }));
    const result = await rememberParties(invoice({ seller: "Something Else" }));
    expect(result.profile).toBe(false);
    expect((await loadSettings()).profile.name).toBe("Original Co");
  });

  it("adds a new customer once and reuses it afterwards", async () => {
    const first = await rememberParties(invoice());
    expect(first.customerAdded).toBe(true);
    const second = await rememberParties(invoice({ customer: "  acme pvt ltd " }));
    expect(second.customerAdded).toBe(false);
    expect(second.customerId).toBe(first.customerId);
    expect(await getDb().customers.count()).toBe(1);
  });

  it("treats the same name with a different GSTIN as a different customer", async () => {
    await saveCustomer({ name: "Acme Pvt Ltd", gstin: "27AAPFU0939F1ZV" });
    const result = await rememberParties(invoice({ gstin: "29AAACA1234A1ZS" }));
    expect(result.customerAdded).toBe(true);
    expect(await getDb().customers.count()).toBe(2);
  });

  it("does nothing for an already linked customer", async () => {
    const inv = invoice();
    const result = await rememberParties({
      ...inv,
      customer: { ...inv.customer, customerId: "abc" },
    });
    expect(result.customerId).toBeNull();
    expect(await getDb().customers.count()).toBe(0);
  });
});
