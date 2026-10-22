import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/marketing/accordion";
import { GstCalculator } from "@/components/marketing/gst-calculator";
import { JsonLd } from "@/components/marketing/json-ld";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbLd, faqLd, graph, type Faq } from "@/lib/seo";

const TITLE = "GST Calculator — Add or Remove GST, CGST/SGST/IGST Split";
const DESCRIPTION =
  "Free online GST calculator for India. Add GST to a price or remove GST from an inclusive amount, and see the CGST, SGST and IGST split instantly. Formulas and examples included.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "GST calculator",
    "GST calculator online",
    "reverse GST calculator",
    "GST inclusive calculator",
    "CGST SGST calculator",
  ],
  alternates: { canonical: "/gst-calculator" },
  openGraph: { url: "/gst-calculator", title: TITLE, description: DESCRIPTION },
};

const FAQS: Faq[] = [
  {
    q: "How do I calculate GST on an amount?",
    a: "Multiply the amount by the GST rate and divide by 100. For ₹10,000 at 18%, GST is ₹10,000 × 18 ÷ 100 = ₹1,800, so the total is ₹11,800.",
  },
  {
    q: "How do I remove GST from a GST-inclusive price?",
    a: "Divide the inclusive amount by (1 + rate ÷ 100). For ₹11,800 including 18% GST, the taxable value is ₹11,800 ÷ 1.18 = ₹10,000 and the GST is ₹1,800.",
  },
  {
    q: "How is GST split into CGST and SGST?",
    a: "For a sale within the same state, the GST rate is split equally: 18% becomes 9% CGST and 9% SGST. For a sale to another state, the full 18% is charged as IGST.",
  },
  {
    q: "Which GST rate applies to my product or service?",
    a: "It depends on the HSN or SAC code of the goods or service. Check the current rate notification on the CBIC website or the GST portal, as rates are revised from time to time.",
  },
];

export default function GstCalculatorPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 pb-20 sm:px-6">
      <JsonLd
        data={graph(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "GST calculator", path: "/gst-calculator" },
          ]),
          {
            "@type": "WebApplication",
            name: "GST Calculator",
            url: absoluteUrl("/gst-calculator"),
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any (web browser)",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          },
          faqLd(FAQS),
        )}
      />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance">GST Calculator</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Add GST to a price or remove GST from an inclusive amount — with the CGST, SGST and IGST
          split shown instantly.
        </p>
      </div>

      <div className="mt-10">
        <GstCalculator />
      </div>

      <div className="guide-prose mx-auto mt-16 max-w-3xl">
        <section>
          <h2>GST formulas</h2>
          <ul>
            <li>
              <b>Add GST:</b> GST = Amount × Rate ÷ 100 · Total = Amount + GST
            </li>
            <li>
              <b>Remove GST:</b> Taxable value = Inclusive amount × 100 ÷ (100 + Rate) · GST =
              Inclusive amount − Taxable value
            </li>
            <li>
              <b>Same state:</b> CGST = SGST = GST ÷ 2 · <b>Other state:</b> IGST = GST
            </li>
          </ul>
        </section>
        <section>
          <h2>Example</h2>
          <p>
            A designer in Pune bills ₹25,000 for a website at 18% GST. For a client in Mumbai (same
            state) the invoice shows CGST ₹2,250 and SGST ₹2,250. For a client in Bengaluru (another
            state) it shows IGST ₹4,500. Either way the total is ₹29,500. Learn more in{" "}
            <Link
              href="/guides/cgst-sgst-igst"
              className="font-medium text-primary hover:underline"
            >
              CGST vs SGST vs IGST
            </Link>
            .
          </p>
        </section>
      </div>

      <section className="mx-auto mt-14 max-w-3xl">
        <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em]">
          Frequently asked questions
        </h2>
        <Accordion items={FAQS} />
      </section>
    </div>
  );
}
