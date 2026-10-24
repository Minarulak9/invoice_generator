"use client";

import { Building, Check, RotateCcw, Save, UserPlus, UserRound, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useCustomers } from "@/db/hooks";
import { saveCustomer } from "@/db/records";
import { updateSettings } from "@/db/settings";
import { DOC_TYPE_META } from "@/lib/documents";
import { checkGstin, normalizeGstin, stateFromGstin } from "@/lib/gst/gstin";
import { stateLabel } from "@/lib/gst/states";
import { customerStateCode, isIndia, sellerStateCode } from "@/lib/gst/tax";
import { toInvoiceCustomer } from "@/lib/invoice-factory";
import type { InvoiceCustomer, Seller } from "@/lib/schema";
import { fieldId } from "@/lib/validation";
import { useEditor } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Collapse } from "@/components/ui/collapse";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { StateSelect } from "@/components/forms/pickers";
import { useEditorContext, useFieldIssue } from "./editor-context";
import { useEditorActions } from "./use-editor-actions";
import { AddFieldLink, EditorSection, useRevealOn } from "./section";

/* ---------------- Seller ---------------- */

export function SellerSection() {
  const { settings } = useEditorContext();
  const seller = useEditor((s) => s.invoice!.seller);
  const patchSeller = useEditor((s) => s.patchSeller);
  const { refreshBusinessCode } = useEditorActions();
  const nameIssue = useFieldIssue(fieldId.sellerName);
  const gstinIssue = useFieldIssue(fieldId.sellerGstin);
  const stateIssue = useFieldIssue(fieldId.sellerState);
  const filled = Boolean(seller.name.trim());

  const setGstin = (raw: string) => {
    const gstin = normalizeGstin(raw);
    const derived = stateFromGstin(gstin);
    patchSeller({
      gstin,
      ...(gstin.length >= 2 && derived && !seller.stateCode ? { stateCode: derived } : {}),
    });
  };

  const fromProfile = () => {
    patchSeller(structuredClone(settings.profile));
    toast.success("Loaded your business profile");
  };
  const saveToProfile = async () => {
    await updateSettings((s) => ({ ...s, profile: structuredClone(seller) }));
    toast.success("Business profile updated", {
      description: "New documents will use these details.",
    });
  };

  return (
    <EditorSection
      title="From"
      icon={<Building />}
      collapsible
      defaultOpen={!filled}
      done={filled}
      hasIssue={Boolean(nameIssue.error || gstinIssue.warning || stateIssue.warning)}
      fields={[fieldId.sellerName, fieldId.sellerGstin, fieldId.sellerState]}
      summary={[seller.name, seller.gstin].filter(Boolean).join(" · ") || "Your business details"}
    >
      <div className="grid gap-2.5 sm:gap-3">
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          <Field label="Business name" required id={fieldId.sellerName} error={nameIssue.error}>
            <Input
              value={seller.name}
              onChange={(e) => patchSeller({ name: e.target.value })}
              onBlur={() => void refreshBusinessCode()}
              maxLength={160}
              autoComplete="organization"
            />
          </Field>
          <Field label="GSTIN" optional id={fieldId.sellerGstin} warning={gstinIssue.warning}>
            <Input
              value={seller.gstin}
              onChange={(e) => setGstin(e.target.value)}
              maxLength={15}
              className="font-mono tracking-wide uppercase"
              placeholder="27ABCDE1234F1Z5"
              spellCheck={false}
            />
          </Field>
        </div>
        <Field label="Address">
          <Textarea
            value={seller.address}
            onChange={(e) => patchSeller({ address: e.target.value })}
            rows={2}
            maxLength={500}
            autoComplete="street-address"
          />
        </Field>
        {/* Phones: State, then Phone | Email side by side, then Website. Desktop: two even rows. */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Field
            label="State"
            id={fieldId.sellerState}
            warning={stateIssue.warning}
            className="col-span-2 sm:col-span-1"
          >
            <StateSelect
              value={seller.stateCode}
              onChange={(code) => patchSeller({ stateCode: code })}
            />
          </Field>
          <Field label="Phone" optional>
            <Input
              value={seller.phone}
              onChange={(e) => patchSeller({ phone: e.target.value })}
              type="tel"
              maxLength={40}
            />
          </Field>
          <Field label="Email" optional>
            <Input
              value={seller.email}
              onChange={(e) => patchSeller({ email: e.target.value })}
              type="email"
              maxLength={160}
            />
          </Field>
          <Field label="Website" optional className="col-span-2 sm:col-span-1">
            <Input
              value={seller.website}
              onChange={(e) => patchSeller({ website: e.target.value })}
              maxLength={160}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={fromProfile}>
            <RotateCcw />
            Load profile
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void saveToProfile()}>
            <Save />
            Save as profile
          </Button>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {settings.profile.name.trim()
            ? "Logo, bank, UPI and signature come from your business profile in Settings."
            : "These details become your business profile when you download — you won't have to type them again. Add a logo, bank or UPI details later in Settings."}
        </p>
      </div>
    </EditorSection>
  );
}

/* ---------------- Customer ---------------- */

const EMPTY_CUSTOMER: InvoiceCustomer = {
  customerId: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  billingAddress: "",
  shippingAddress: "",
  stateCode: "",
  country: "India",
  gstin: "",
};

export function CustomerSection() {
  const customers = useCustomers() ?? [];
  const customer = useEditor((s) => s.invoice!.customer);
  const { docType, gstMode, placeOfSupply, seller } = useEditor(
    useShallow((s) => ({
      docType: s.invoice!.docType,
      gstMode: s.invoice!.gstMode,
      placeOfSupply: s.invoice!.placeOfSupply,
      seller: s.invoice!.seller as Seller,
    })),
  );
  const patchCustomer = useEditor((s) => s.patchCustomer);
  const patch = useEditor((s) => s.patch);
  const nameIssue = useFieldIssue(fieldId.customerName);
  const gstinIssue = useFieldIssue(fieldId.customerGstin);
  const posIssue = useFieldIssue(fieldId.placeOfSupply);
  // Optional groups stay behind "+ Add" links, but open whenever they hold data or a problem.
  const [show, setShow] = useState(HIDDEN_GROUPS);
  const reveal = (key: keyof typeof HIDDEN_GROUPS) => setShow((v) => ({ ...v, [key]: true }));
  const companyOpen = show.company || Boolean(customer.company);
  const contactOpen = show.contact || Boolean(customer.email || customer.phone);
  const shipOpen = show.ship || Boolean(customer.shippingAddress);
  const posOpen = show.pos || Boolean(placeOfSupply) || Boolean(posIssue.warning);
  useRevealOn([fieldId.placeOfSupply], () => reveal("pos"));
  const [saving, setSaving] = useState(false);
  const linked = customers.find((c) => c.id === customer.customerId);
  const india = isIndia(customer.country);
  const showPos = DOC_TYPE_META[docType].hasTax && gstMode === "split";

  const setGstin = (raw: string) => {
    const gstin = normalizeGstin(raw);
    const derived = stateFromGstin(gstin);
    patchCustomer({
      gstin,
      ...(derived && checkGstin(gstin).valid && !customer.stateCode ? { stateCode: derived } : {}),
    });
  };

  const changedFromSaved =
    linked &&
    (
      [
        "name",
        "company",
        "email",
        "phone",
        "billingAddress",
        "shippingAddress",
        "stateCode",
        "country",
        "gstin",
      ] as const
    ).some((k) => (linked[k] ?? "") !== (customer[k] ?? ""));

  const save = async () => {
    if (!customer.name.trim()) {
      toast.error("Add the customer's name first");
      return;
    }
    setSaving(true);
    try {
      const { customerId, ...fields } = customer;
      const record = await saveCustomer({
        ...(linked ?? {}),
        ...fields,
        id: customerId || undefined,
      });
      patchCustomer({ customerId: record.id });
      toast.success(linked ? "Customer updated" : "Saved to your customers");
    } finally {
      setSaving(false);
    }
  };

  const autoPos = customerStateCode(customer);
  const sellerState = sellerStateCode(seller);
  const effectivePos = placeOfSupply || autoPos;
  const taxResult =
    sellerState && effectivePos ? (effectivePos === sellerState ? "CGST + SGST" : "IGST") : "";

  return (
    <EditorSection
      title="Bill to"
      icon={<UserRound />}
      done={Boolean(customer.name.trim())}
      action={
        customers.length > 0 ? (
          <Combobox
            items={customers}
            getKey={(c) => c.id}
            getLabel={(c) => c.name}
            getDescription={(c) =>
              [c.company, c.gstin, c.email].filter(Boolean).join(" · ") || stateLabel(c.stateCode)
            }
            getKeywords={(c) => [c.company, c.gstin, c.email].filter(Boolean)}
            selectedKey={customer.customerId}
            onSelect={(c) => {
              patchCustomer(toInvoiceCustomer(c));
              patch({ placeOfSupply: "" });
            }}
            align="end"
            searchPlaceholder="Search customers…"
            emptyText="No customers match"
            trigger={
              <Button size="sm" variant="secondary">
                <UserPlus />
                Choose saved
              </Button>
            }
          />
        ) : undefined
      }
    >
      <div className="grid gap-2.5 sm:gap-3">
        {linked && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-primary-soft/60 px-3 py-1.5 text-[13px] text-primary-soft-foreground">
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Saved customer
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                patchCustomer({ ...EMPTY_CUSTOMER });
                patch({ placeOfSupply: "" });
                setShow(HIDDEN_GROUPS);
              }}
            >
              <X />
              Clear
            </Button>
          </div>
        )}
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          <Field label="Customer name" required id={fieldId.customerName} error={nameIssue.error}>
            <Input
              value={customer.name}
              onChange={(e) => patchCustomer({ name: e.target.value })}
              maxLength={160}
              placeholder="Person or business"
            />
          </Field>
          {india && (
            <Field label="GSTIN" optional id={fieldId.customerGstin} warning={gstinIssue.warning}>
              <Input
                value={customer.gstin}
                onChange={(e) => setGstin(e.target.value)}
                maxLength={15}
                className="font-mono tracking-wide uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
                placeholder="For GST-registered buyers"
                spellCheck={false}
              />
            </Field>
          )}
        </div>
        <Collapse open={companyOpen}>
          <Field label="Company" optional>
            <Input
              value={customer.company}
              onChange={(e) => patchCustomer({ company: e.target.value })}
              maxLength={160}
            />
          </Field>
        </Collapse>
        <Field label="Billing address">
          <Textarea
            value={customer.billingAddress}
            onChange={(e) => patchCustomer({ billingAddress: e.target.value })}
            rows={2}
            maxLength={500}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {india && (
            <Field label="State">
              <StateSelect
                value={customer.stateCode}
                onChange={(code) => patchCustomer({ stateCode: code })}
              />
            </Field>
          )}
          <Field label="Country" className={india ? undefined : "col-span-2"}>
            <Input
              value={customer.country}
              onChange={(e) => patchCustomer({ country: e.target.value })}
              maxLength={80}
              autoComplete="country-name"
            />
          </Field>
        </div>

        {showPos &&
          (posOpen ? (
            <Field
              label="Place of supply"
              id={fieldId.placeOfSupply}
              warning={posIssue.warning}
              hint={taxResult ? `→ ${taxResult}` : "Decides CGST + SGST or IGST."}
            >
              <StateSelect
                value={placeOfSupply}
                onChange={(code) => patch({ placeOfSupply: code })}
                allowOutsideIndia
                autoLabel={
                  autoPos
                    ? `Auto — ${stateLabel(autoPos) || "Outside India"}`
                    : "Auto — from customer's state"
                }
              />
            </Field>
          ) : (
            <div className="flex min-h-9 items-center justify-between gap-3 rounded-lg bg-surface-2/70 py-1 pr-1 pl-3 text-[13px]">
              <span className="min-w-0 text-muted-foreground">
                Place of supply{" "}
                <span className="font-medium text-foreground">
                  {autoPos ? stateLabel(autoPos) || "Outside India" : "Auto"}
                </span>
                {taxResult && <span> → {taxResult}</span>}
              </span>
              <Button variant="ghost" size="xs" onClick={() => reveal("pos")}>
                Change
              </Button>
            </div>
          ))}

        <Collapse open={contactOpen}>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <Field label="Email" optional>
              <Input
                value={customer.email}
                onChange={(e) => patchCustomer({ email: e.target.value })}
                type="email"
                maxLength={160}
              />
            </Field>
            <Field label="Phone" optional>
              <Input
                value={customer.phone}
                onChange={(e) => patchCustomer({ phone: e.target.value })}
                type="tel"
                maxLength={40}
              />
            </Field>
          </div>
        </Collapse>
        <Collapse open={shipOpen}>
          <Field
            label="Shipping address"
            action={
              <button
                type="button"
                onClick={() => {
                  setShow((v) => ({ ...v, ship: false }));
                  patchCustomer({ shippingAddress: "" });
                }}
                className="rounded text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:focus-ring"
              >
                Remove
              </button>
            }
          >
            <Textarea
              value={customer.shippingAddress}
              onChange={(e) => patchCustomer({ shippingAddress: e.target.value })}
              rows={2}
              maxLength={500}
              placeholder="If different from the billing address"
            />
          </Field>
        </Collapse>

        {/* Optional fields and the save action share one row to keep the card short. */}
        {(!companyOpen || !contactOpen || !shipOpen || !linked || changedFromSaved) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {!companyOpen && <AddFieldLink onClick={() => reveal("company")}>Company</AddFieldLink>}
            {!contactOpen && (
              <AddFieldLink onClick={() => reveal("contact")}>Email / phone</AddFieldLink>
            )}
            {!shipOpen && (
              <AddFieldLink onClick={() => reveal("ship")}>Shipping address</AddFieldLink>
            )}
            {(!linked || changedFromSaved) && (
              <Tooltip
                content={linked ? undefined : "New customers are also saved when you download"}
              >
                <Button
                  size="xs"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => void save()}
                  loading={saving}
                  disabled={!customer.name.trim()}
                >
                  <Save />
                  {linked ? "Update saved customer" : "Save customer"}
                </Button>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </EditorSection>
  );
}

const HIDDEN_GROUPS = { company: false, contact: false, ship: false, pos: false };
