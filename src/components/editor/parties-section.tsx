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
import { SwitchRow } from "@/components/ui/switch";
import { StateSelect } from "@/components/forms/pickers";
import { useEditorContext, useFieldIssue } from "./editor-context";
import { useEditorActions } from "./use-editor-actions";
import { EditorSection } from "./section";

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
      summary={[seller.name, seller.gstin].filter(Boolean).join(" · ") || "Your business details"}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="State" id={fieldId.sellerState} warning={stateIssue.warning}>
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" optional>
            <Input
              value={seller.email}
              onChange={(e) => patchSeller({ email: e.target.value })}
              type="email"
              maxLength={160}
            />
          </Field>
          <Field label="Website" optional>
            <Input
              value={seller.website}
              onChange={(e) => patchSeller({ website: e.target.value })}
              maxLength={160}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="secondary" onClick={fromProfile}>
            <RotateCcw />
            Use saved profile
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void saveToProfile()}>
            <Save />
            Save as my profile
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
  const [shipOpen, setShipOpen] = useState(Boolean(customer.shippingAddress));
  const [showContact, setShowContact] = useState(false);
  const contactOpen = showContact || Boolean(customer.email || customer.phone);
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

  return (
    <EditorSection
      title="Bill to"
      icon={<UserRound />}
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
              setShipOpen(Boolean(c.shippingAddress));
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
      <div className="grid gap-4">
        {linked && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-primary-soft/60 px-3 py-2 text-[13px] text-primary-soft-foreground">
            <span className="flex items-center gap-2">
              <Check className="size-4" />
              Linked to saved customer
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                patchCustomer({ ...EMPTY_CUSTOMER });
                patch({ placeOfSupply: "" });
              }}
            >
              <X />
              Clear
            </Button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name" required id={fieldId.customerName} error={nameIssue.error}>
            <Input
              value={customer.name}
              onChange={(e) => patchCustomer({ name: e.target.value })}
              maxLength={160}
              placeholder="Person or business"
            />
          </Field>
          <Field label="Company" optional>
            <Input
              value={customer.company}
              onChange={(e) => patchCustomer({ company: e.target.value })}
              maxLength={160}
            />
          </Field>
        </div>
        <Field label="Billing address">
          <Textarea
            value={customer.billingAddress}
            onChange={(e) => patchCustomer({ billingAddress: e.target.value })}
            rows={2}
            maxLength={500}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <Input
              value={customer.country}
              onChange={(e) => patchCustomer({ country: e.target.value })}
              maxLength={80}
              autoComplete="country-name"
            />
          </Field>
          {india && (
            <Field label="State">
              <StateSelect
                value={customer.stateCode}
                onChange={(code) => patchCustomer({ stateCode: code })}
              />
            </Field>
          )}
        </div>
        {india && (
          <Field
            label="GSTIN"
            optional
            id={fieldId.customerGstin}
            warning={gstinIssue.warning}
            hint="For registered businesses (B2B)."
          >
            <Input
              value={customer.gstin}
              onChange={(e) => setGstin(e.target.value)}
              maxLength={15}
              className="font-mono tracking-wide uppercase"
              spellCheck={false}
            />
          </Field>
        )}
        {!contactOpen && (
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="-mt-1 w-fit rounded text-xs font-medium text-primary hover:underline focus-visible:focus-ring"
          >
            + Add email / phone
          </button>
        )}
        <Collapse open={contactOpen}>
          <div className="grid gap-4 sm:grid-cols-2">
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

        <SwitchRow
          label="Different shipping address"
          checked={shipOpen}
          onCheckedChange={(v) => {
            setShipOpen(v);
            if (!v) patchCustomer({ shippingAddress: "" });
          }}
        />
        <Collapse open={shipOpen}>
          <Field label="Shipping address">
            <Textarea
              value={customer.shippingAddress}
              onChange={(e) => patchCustomer({ shippingAddress: e.target.value })}
              rows={2}
              maxLength={500}
            />
          </Field>
        </Collapse>

        {showPos && (
          <Field
            label="Place of supply"
            id={fieldId.placeOfSupply}
            warning={posIssue.warning}
            hint={
              sellerStateCode(seller) && (placeOfSupply || autoPos)
                ? (placeOfSupply || autoPos) === sellerStateCode(seller)
                  ? "Same state as you → CGST + SGST"
                  : "Different state → IGST"
                : "Decides CGST + SGST (same state) or IGST (other state)."
            }
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
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {(!linked || changedFromSaved) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void save()}
              loading={saving}
              disabled={!customer.name.trim()}
            >
              <Save />
              {linked ? "Update saved customer" : "Save to customers"}
            </Button>
          )}
          {!linked && (
            <p className="self-center text-xs text-muted-foreground">
              New customers are also saved automatically when you download the PDF.
            </p>
          )}
        </div>
      </div>
    </EditorSection>
  );
}
