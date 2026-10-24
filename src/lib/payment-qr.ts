import type { InvoiceTotals } from "@/lib/calc/engine";
import { activeStages, computeSchedule } from "@/lib/calc/schedule";
import { DOC_TYPE_META } from "@/lib/documents";
import { UPI_PATTERN } from "@/lib/gst/gstin";
import { toDec } from "@/lib/money";
import type { Invoice } from "@/lib/schema";
import { buildUpiUri } from "@/lib/upi";

export type PaymentQr =
  /** The seller's own QR image, printed as-is (no amount). */
  | { kind: "upload"; image: string }
  /** Generated UPI QR; `amount` is empty when the amount is left to the payer. */
  | { kind: "auto"; uri: string; amount: string; forLabel: string }
  | { kind: "none"; reason: string };

/**
 * Decides which QR code the document carries. An uploaded QR wins; otherwise a
 * UPI QR is generated for what is payable now — the next unpaid instalment when
 * there are payment terms, else the balance due (or the total on quotations).
 */
export function resolvePaymentQr(
  invoice: Invoice,
  totals: InvoiceTotals,
  opts: { show: boolean; includeAmount: boolean },
): PaymentQr {
  const seller = invoice.seller;
  if (!opts.show) return { kind: "none", reason: "QR codes are turned off in Design." };
  if (seller.paymentQr) return { kind: "upload", image: seller.paymentQr };
  const upiId = seller.upiId.trim();
  if (!upiId) return { kind: "none", reason: "Add a UPI ID or upload your QR code." };
  if (!UPI_PATTERN.test(upiId))
    return { kind: "none", reason: "The UPI ID doesn't look right (it should be like name@bank)." };
  if (invoice.currency !== "INR")
    return {
      kind: "none",
      reason: "UPI QR codes work for INR documents only. Upload your own QR instead.",
    };

  const hasPayment = DOC_TYPE_META[invoice.docType].hasPayment;
  let amount = hasPayment ? totals.balanceDue : totals.grandTotal;
  let forLabel = "";
  const stages = activeStages(invoice.paymentSchedule);
  if (stages.length > 0) {
    const plan = computeSchedule(
      stages,
      totals.grandTotal,
      totals.precision,
      hasPayment ? totals.amountReceived : "0",
    );
    const next = plan.stages.findIndex((s) => s.status !== "paid");
    if (next >= 0) {
      const s = plan.stages[next];
      amount = toDec(s.amount).minus(toDec(s.paid)).toFixed(totals.precision);
      forLabel = stages[next].label.trim() || `Instalment ${next + 1}`;
    }
  }
  if (!toDec(amount).greaterThan(0))
    return {
      kind: "none",
      reason:
        hasPayment && totals.paymentStatus === "paid"
          ? "Fully paid, so no QR code is needed."
          : "Add items so there is an amount to pay.",
    };

  const uri = buildUpiUri({
    upiId,
    payeeName: seller.upiName || seller.name,
    amount: opts.includeAmount ? amount : undefined,
    note: `${invoice.docTitle || DOC_TYPE_META[invoice.docType].defaultTitle} ${invoice.number}`.trim(),
  });
  if (!uri) return { kind: "none", reason: "Couldn't build a UPI link from this UPI ID." };
  return { kind: "auto", uri, amount: opts.includeAmount ? amount : "", forLabel };
}
