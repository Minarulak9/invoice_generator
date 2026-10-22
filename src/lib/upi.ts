import { toDec } from "@/lib/money";
import { UPI_PATTERN } from "@/lib/gst/gstin";

export interface UpiPaymentInput {
  upiId: string;
  payeeName: string;
  amount?: string;
  note?: string;
}

/**
 * Build a UPI deep link (NPCI "upi://pay" format) for a QR code.
 * Values are percent-encoded with encodeURIComponent so spaces become %20,
 * which every UPI app decodes correctly.
 */
export function buildUpiUri({ upiId, payeeName, amount, note }: UpiPaymentInput): string | null {
  const pa = upiId.trim();
  if (!UPI_PATTERN.test(pa)) return null;
  const params: [string, string][] = [["pa", pa]];
  const pn = payeeName.trim();
  if (pn) params.push(["pn", pn.slice(0, 50)]);
  if (amount !== undefined) {
    const value = toDec(amount);
    if (value.greaterThan(0)) params.push(["am", value.toFixed(2)]);
  }
  params.push(["cu", "INR"]);
  const tn = note?.trim();
  if (tn) params.push(["tn", tn.slice(0, 80)]);
  return `upi://pay?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
}
