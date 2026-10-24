"use client";

import { Landmark, Save } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { updateSettings } from "@/db/settings";
import { IFSC_PATTERN, UPI_PATTERN } from "@/lib/gst/gstin";
import type { Seller } from "@/lib/schema";
import { useEditor } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Tooltip } from "@/components/ui/tooltip";
import { EditorSection } from "./section";

type Preferred = Seller["preferredPayment"];

/** Bank account, UPI and which of the two the customer should use first. */
export function PaymentDetailsSection() {
  const { seller, currency, instructions } = useEditor(
    useShallow((s) => ({
      seller: s.invoice!.seller,
      currency: s.invoice!.currency,
      instructions: s.invoice!.paymentInstructions,
    })),
  );
  const patch = useEditor((s) => s.patch);
  const patchSeller = useEditor((s) => s.patchSeller);
  const bank = seller.bank;
  const setBank = (partial: Partial<Seller["bank"]>) =>
    patchSeller({ bank: { ...bank, ...partial } });

  const hasBank = Boolean(bank.accountNumber.trim());
  const hasUpi = Boolean(seller.upiId.trim());
  const ifscInvalid = bank.ifsc && !IFSC_PATTERN.test(bank.ifsc);
  const upiInvalid = seller.upiId && !UPI_PATTERN.test(seller.upiId);

  const bankSummary = hasBank
    ? `${bank.bankName.trim() || "Bank"} ••${bank.accountNumber.trim().slice(-4)}`
    : "";
  const methods =
    seller.preferredPayment === "upi"
      ? [seller.upiId.trim(), bankSummary]
      : [bankSummary, seller.upiId.trim()];
  const summary = methods.filter(Boolean).join(" · ") || "Add bank or UPI so customers can pay";

  const saveAsDefault = async () => {
    await updateSettings((s) => ({
      ...s,
      profile: {
        ...s.profile,
        bank: structuredClone(bank),
        upiId: seller.upiId,
        upiName: seller.upiName,
        preferredPayment: seller.preferredPayment,
      },
    }));
    toast.success("Payment details saved", {
      description: "New documents will use this bank, UPI and preference.",
    });
  };

  return (
    <EditorSection
      title="Bank & UPI"
      icon={<Landmark />}
      collapsible
      defaultOpen={false}
      done={hasBank || hasUpi}
      summary={summary}
    >
      <div className="grid gap-2.5 sm:gap-3">
        <p className="pt-1 text-xs font-semibold text-muted-foreground">Bank account</p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Field label="Account name" optional className="col-span-2 sm:col-span-1">
            <Input
              value={bank.accountName}
              onChange={(e) => setBank({ accountName: e.target.value })}
              maxLength={120}
            />
          </Field>
          <Field label="Account number" className="col-span-2 sm:col-span-1">
            <Input
              value={bank.accountNumber}
              onChange={(e) => setBank({ accountNumber: e.target.value.replace(/\s/g, "") })}
              maxLength={40}
              inputMode="numeric"
              className="font-mono"
            />
          </Field>
          <Field
            label="IFSC"
            warning={ifscInvalid ? "IFSC looks incorrect (e.g. HDFC0001234)." : undefined}
          >
            <Input
              value={bank.ifsc}
              onChange={(e) => setBank({ ifsc: e.target.value.toUpperCase().replace(/\s/g, "") })}
              maxLength={11}
              className="font-mono uppercase"
            />
          </Field>
          <Field label="Bank name">
            <Input
              value={bank.bankName}
              onChange={(e) => setBank({ bankName: e.target.value })}
              maxLength={120}
            />
          </Field>
          <Field
            label="Branch"
            optional
            className={currency === "INR" ? "col-span-2" : "col-span-2 sm:col-span-1"}
          >
            <Input
              value={bank.branch}
              onChange={(e) => setBank({ branch: e.target.value })}
              maxLength={120}
            />
          </Field>
          {currency !== "INR" && (
            <Field label="SWIFT / BIC" optional className="col-span-2 sm:col-span-1">
              <Input
                value={bank.swift}
                onChange={(e) =>
                  setBank({ swift: e.target.value.toUpperCase().replace(/\s/g, "") })
                }
                maxLength={11}
                className="font-mono uppercase"
              />
            </Field>
          )}
        </div>

        <p className="pt-1 text-xs font-semibold text-muted-foreground">UPI</p>
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
          <Field label="UPI ID" warning={upiInvalid ? "UPI IDs look like name@bank." : undefined}>
            <Input
              value={seller.upiId}
              onChange={(e) => patchSeller({ upiId: e.target.value.trim() })}
              maxLength={120}
              placeholder="yourname@okhdfcbank"
              spellCheck={false}
            />
          </Field>
          <Field label="Payee name" optional>
            <Input
              value={seller.upiName}
              onChange={(e) => patchSeller({ upiName: e.target.value })}
              maxLength={120}
              placeholder={seller.name.trim() || "Your business name"}
            />
          </Field>
        </div>
        {currency !== "INR" && hasUpi && (
          <p className="text-xs text-muted-foreground">UPI is shown on INR documents only.</p>
        )}

        <Field
          label="Preferred method"
          hint={
            hasBank && hasUpi
              ? "Both stay on the document; the preferred one is listed first and marked Preferred."
              : "Applies once both bank and UPI are filled in."
          }
        >
          <Segmented<Preferred>
            fullWidth
            value={seller.preferredPayment}
            onValueChange={(preferredPayment) => patchSeller({ preferredPayment })}
            options={[
              { value: "", label: "No preference" },
              { value: "upi", label: "UPI" },
              { value: "bank", label: "Bank transfer" },
            ]}
          />
        </Field>

        <Field label="Payment instructions" optional hint="Printed under the bank and UPI details.">
          <Textarea
            value={instructions}
            onChange={(e) => patch({ paymentInstructions: e.target.value })}
            rows={2}
            maxLength={1000}
            placeholder="e.g. Please mention the invoice number in the payment reference."
          />
        </Field>

        <div className="flex justify-end">
          <Tooltip content="Use this bank, UPI and preference on new documents">
            <Button size="xs" variant="ghost" onClick={() => void saveAsDefault()}>
              <Save />
              Save as default
            </Button>
          </Tooltip>
        </div>
      </div>
    </EditorSection>
  );
}
