import Link from "next/link";
import type { ReactNode } from "react";
import type { Faq } from "@/lib/seo";
import { INDIAN_STATES } from "@/lib/gst/states";

/*
 * Public GST guides. Written answer-first (a direct answer, then a table or
 * list, then FAQs) so search and answer engines can quote them accurately.
 * Rule and section numbers cited are from the CGST Rules, 2017 and the IGST
 * Act, 2017. Rates and turnover thresholds change — the guides point readers
 * to CBIC for current values instead of hard-coding them.
 */

export interface GuideSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export interface Guide {
  slug: string;
  shortTitle: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  /** One-paragraph direct answer shown at the top (and used by answer engines). */
  answer: string;
  sections: GuideSection[];
  faqs: Faq[];
}

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="not-prose my-5 overflow-x-auto rounded-xl border border-border">
    <table className="w-full min-w-[520px] text-left text-sm">
      <thead className="bg-surface-2/70 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" className="px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            {r.map((c, j) => (
              <td key={j} className="px-4 py-3 leading-6">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Cta = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
    {children}
  </Link>
);

/* ------------------------------------------------------------------ */

const gstInvoiceFormat: Guide = {
  slug: "gst-invoice-format",
  shortTitle: "GST invoice format",
  title: "GST Invoice Format: Mandatory Fields Under Rule 46 (With Checklist)",
  metaTitle: "GST Invoice Format — Mandatory Fields (Rule 46) & Free Template",
  description:
    "What must a GST tax invoice contain? A clear checklist of the mandatory fields under Rule 46 of the CGST Rules, invoice numbering rules, copies, time limits — and a free GST invoice generator.",
  keywords: [
    "GST invoice format",
    "tax invoice format",
    "GST bill format",
    "Rule 46 invoice",
    "mandatory fields in GST invoice",
  ],
  answer:
    "A GST tax invoice must show the supplier's name, address and GSTIN; a unique serial number of up to 16 characters for the financial year; the date; the recipient's name, address and GSTIN (if registered); the HSN or SAC code; a description, quantity and value of the goods or services; the taxable value; the GST rate and amount split into CGST and SGST/UTGST or IGST; the place of supply for inter-state supplies; whether tax is payable on reverse charge; and the supplier's signature. These requirements come from Rule 46 of the CGST Rules, 2017.",
  sections: [
    {
      id: "mandatory-fields",
      heading: "Mandatory fields on a GST tax invoice",
      body: (
        <>
          <p>
            Rule 46 of the CGST Rules, 2017 lists what a registered supplier’s tax invoice must
            contain. In practice that means:
          </p>
          <Table
            head={["Field", "What to show"]}
            rows={[
              ["Supplier details", "Name, address and GSTIN of the supplier."],
              [
                "Invoice number",
                "A consecutive serial number of at most 16 characters (letters, digits, “-” and “/”), unique for the financial year.",
              ],
              ["Invoice date", "Date of issue."],
              ["Recipient details", "Name, address and GSTIN/UIN if the recipient is registered."],
              [
                "Unregistered recipient (₹50,000 or more)",
                "Name and address of the recipient and the delivery address, with the state name and state code.",
              ],
              [
                "HSN / SAC code",
                "HSN code for goods, SAC for services (the number of digits depends on turnover — check the current CBIC notification).",
              ],
              ["Description, quantity, unit", "What was supplied and how much."],
              ["Value", "Total value and the taxable value after discounts."],
              [
                "Tax rate and amount",
                "Rate and amount of CGST and SGST/UTGST, or IGST (and cess, if any).",
              ],
              ["Place of supply", "State name — required for inter-state supplies."],
              ["Delivery address", "If it differs from the place of supply."],
              ["Reverse charge", "Whether tax is payable on reverse charge basis."],
              [
                "Signature",
                "Signature or digital signature of the supplier or an authorised representative.",
              ],
            ]}
          />
          <p>
            A computer-generated invoice can carry a printed name in the signature block. Invoice
            Studio adds every one of these fields — fill them in once in your{" "}
            <Cta href="/invoice?new=1">free GST invoice</Cta> and they’re laid out correctly on
            every template.
          </p>
        </>
      ),
    },
    {
      id: "numbering",
      heading: "Invoice number rules",
      body: (
        <>
          <p>
            The serial number must be <b>unique for a financial year</b> (April–March),{" "}
            <b>consecutive</b>, and <b>no longer than 16 characters</b>. Only letters, digits,
            hyphens (-) and slashes (/) are allowed. You may run more than one series — for example
            one per branch or one for exports.
          </p>
          <ul>
            <li>
              <code>INV/26-27/001</code> — prefix, financial year and running number (12
              characters).
            </li>
            <li>
              <code>EXP-26-27-001</code> — a separate series for export invoices.
            </li>
          </ul>
          <p>
            Invoice Studio lets you set a numbering pattern per document type, including the
            financial year and a running number.
          </p>
        </>
      ),
    },
    {
      id: "time-and-copies",
      heading: "When to issue and how many copies",
      body: (
        <>
          <Table
            head={["", "Goods", "Services"]}
            rows={[
              [
                "When to issue",
                "Before or at the time of removal / delivery of goods.",
                "Within 30 days of supplying the service (Rule 47).",
              ],
              [
                "Copies (Rule 48)",
                "Three: original for recipient, duplicate for transporter, triplicate for supplier.",
                "Two: original for recipient, duplicate for supplier.",
              ],
            ]}
          />
          <p>
            Mark copies as “Original for recipient”, “Duplicate for transporter” and so on when you
            print them.
          </p>
        </>
      ),
    },
    {
      id: "e-invoicing",
      heading: "What about e-invoicing (IRN)?",
      body: (
        <p>
          Businesses whose aggregate turnover is above the notified threshold must also register B2B
          invoices on the Invoice Registration Portal (IRP) to get an IRN and a signed QR code.
          Check the current threshold on the GST portal. Invoice Studio creates regular PDF tax
          invoices — it does not generate IRNs.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: "What is the format of a GST invoice?",
      a: "A GST invoice must include the supplier's name, address and GSTIN, a unique invoice number (max 16 characters), date, recipient details, HSN/SAC code, description, quantity, taxable value, GST rate and amount (CGST + SGST/UTGST or IGST), place of supply for inter-state supplies, reverse-charge status and the supplier's signature, as required by Rule 46 of the CGST Rules, 2017.",
    },
    {
      q: "How many characters can a GST invoice number have?",
      a: "At most 16 characters. It can contain letters, digits, hyphens and slashes, must be consecutive, and must be unique for the financial year.",
    },
    {
      q: "Is a signature mandatory on a GST invoice?",
      a: "Yes. A tax invoice must carry the signature or digital signature of the supplier or an authorised representative. Computer-generated invoices commonly show the authorised signatory's name.",
    },
    {
      q: "How many copies of a GST invoice are required?",
      a: "For goods, three copies — original for the recipient, duplicate for the transporter and triplicate for the supplier. For services, two copies — original for the recipient and duplicate for the supplier (Rule 48).",
    },
    {
      q: "What is the time limit to issue a GST invoice for services?",
      a: "A tax invoice for services should be issued within 30 days from the date of supply of the service (Rule 47).",
    },
  ],
};

/* ------------------------------------------------------------------ */

const utgstTerritories = INDIAN_STATES.filter((s) => s.utgst && !s.legacy && s.code !== "97").map(
  (s) => s.name,
);

const cgstSgstIgst: Guide = {
  slug: "cgst-sgst-igst",
  shortTitle: "CGST, SGST & IGST",
  title: "CGST, SGST and IGST: Which GST to Charge on Your Invoice",
  metaTitle: "CGST vs SGST vs IGST — Which GST to Charge (With Examples)",
  description:
    "Intrastate or interstate? Learn when to charge CGST + SGST, when to charge IGST, where UTGST applies, and see worked examples and the full list of GST state codes.",
  keywords: [
    "CGST SGST IGST",
    "intrastate vs interstate GST",
    "UTGST",
    "GST state code list",
    "place of supply",
  ],
  answer:
    "Charge CGST + SGST when the supplier and the place of supply are in the same state — each is half of the GST rate (for 18%: 9% CGST + 9% SGST). Charge IGST at the full rate when the place of supply is in a different state or outside India. In Union Territories without a legislature, UTGST replaces SGST. The total tax is the same either way; only the split changes.",
  sections: [
    {
      id: "rule",
      heading: "The simple rule",
      body: (
        <Table
          head={["Type of supply", "Tax charged", "Example at 18%"]}
          rows={[
            [
              "Intrastate — supplier and place of supply in the same state",
              "CGST + SGST (half each)",
              "9% CGST + 9% SGST",
            ],
            ["Intrastate in a UT without legislature", "CGST + UTGST", "9% CGST + 9% UTGST"],
            ["Interstate — different states", "IGST (full rate)", "18% IGST"],
            [
              "Exports and supplies to SEZ",
              "Treated as interstate (zero-rated)",
              "IGST paid, or nil under LUT",
            ],
          ]}
        />
      ),
    },
    {
      id: "example",
      heading: "Worked example: ₹10,000 at 18%",
      body: (
        <>
          <Table
            head={["", "Same state (Pune → Mumbai)", "Different state (Pune → Bengaluru)"]}
            rows={[
              ["Taxable value", "₹10,000", "₹10,000"],
              ["CGST", "₹900 (9%)", "—"],
              ["SGST", "₹900 (9%)", "—"],
              ["IGST", "—", "₹1,800 (18%)"],
              [<b key="t">Invoice total</b>, <b key="a">₹11,800</b>, <b key="b">₹11,800</b>],
            ]}
          />
          <p>
            Try it with the <Cta href="/gst-calculator">free GST calculator</Cta>, or let the{" "}
            <Cta href="/invoice?new=1">invoice generator</Cta> pick CGST + SGST or IGST
            automatically from your state and your customer’s state.
          </p>
        </>
      ),
    },
    {
      id: "place-of-supply",
      heading: "How place of supply is decided",
      body: (
        <>
          <p>
            Place of supply rules are in sections 10 to 13 of the IGST Act, 2017. The common cases:
          </p>
          <ul>
            <li>
              <b>Goods:</b> generally where the movement of goods ends for delivery to the
              recipient.
            </li>
            <li>
              <b>Services to a registered business (B2B):</b> generally the recipient’s location
              (their GSTIN state).
            </li>
            <li>
              <b>Services to a consumer (B2C):</b> generally the recipient’s address on record,
              otherwise the supplier’s location.
            </li>
          </ul>
          <p>
            Some services (for example events, transport and immovable property) have special rules,
            so check those cases with your CA.
          </p>
        </>
      ),
    },
    {
      id: "utgst",
      heading: "Where UTGST applies",
      body: (
        <p>
          UTGST replaces SGST in Union Territories without their own legislature:{" "}
          {utgstTerritories.join(", ")}. Delhi, Puducherry and Jammu &amp; Kashmir have
          legislatures, so they use SGST.
        </p>
      ),
    },
    {
      id: "state-codes",
      heading: "GST state codes",
      body: (
        <>
          <p>
            The first two digits of a GSTIN are the state code. Show the place of supply with its
            state name and code on interstate invoices.
          </p>
          <Table
            head={["Code", "State / UT", "Intrastate tax"]}
            rows={INDIAN_STATES.filter((s) => !s.legacy).map((s) => [
              s.code,
              s.name,
              s.utgst ? "CGST + UTGST" : "CGST + SGST",
            ])}
          />
        </>
      ),
    },
  ],
  faqs: [
    {
      q: "When should I charge IGST instead of CGST and SGST?",
      a: "Charge IGST when the supplier's location and the place of supply are in different states or Union Territories, and on exports and supplies to SEZ units. Charge CGST + SGST (or UTGST) when both are in the same state.",
    },
    {
      q: "Is IGST equal to CGST plus SGST?",
      a: "Yes. The total tax is the same — for 18% GST, intrastate supplies carry 9% CGST + 9% SGST and interstate supplies carry 18% IGST.",
    },
    {
      q: "What is UTGST?",
      a: "UTGST (Union Territory GST) replaces SGST for intrastate supplies in Union Territories without a legislature, such as Chandigarh, Ladakh, Lakshadweep, Andaman and Nicobar Islands, and Dadra and Nagar Haveli and Daman and Diu.",
    },
    {
      q: "How do I find the state code from a GSTIN?",
      a: "The first two digits of a GSTIN are the state code. For example, 27 is Maharashtra, 29 is Karnataka and 07 is Delhi.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const billOfSupply: Guide = {
  slug: "bill-of-supply",
  shortTitle: "Bill of supply vs tax invoice",
  title: "Bill of Supply vs Tax Invoice: Which One Should You Issue?",
  metaTitle: "Bill of Supply vs Tax Invoice — Format, Rules & Free Generator",
  description:
    "A bill of supply is issued instead of a tax invoice when no GST can be charged — by composition dealers and for exempt supplies. See the differences, the required fields and the declaration text.",
  keywords: [
    "bill of supply",
    "bill of supply format",
    "composition dealer invoice",
    "bill of supply vs tax invoice",
  ],
  answer:
    "Issue a bill of supply when you cannot charge GST: if you are registered under the composition scheme, or when you supply only exempt goods or services. It carries no GST amount, and the buyer cannot claim input tax credit on it. Registered suppliers of taxable goods or services issue a tax invoice instead. Bills of supply are governed by Rule 49 of the CGST Rules, 2017.",
  sections: [
    {
      id: "difference",
      heading: "Bill of supply vs tax invoice at a glance",
      body: (
        <Table
          head={["", "Tax invoice", "Bill of supply"]}
          rows={[
            [
              "Who issues it",
              "Registered supplier of taxable goods or services",
              "Composition taxpayers, and suppliers of exempt goods or services",
            ],
            ["GST charged", "Yes — CGST + SGST/UTGST or IGST", "No"],
            ["Input tax credit for buyer", "Yes (if eligible)", "No"],
            ["Governing rule", "Rule 46", "Rule 49"],
          ]}
        />
      ),
    },
    {
      id: "fields",
      heading: "What a bill of supply must contain",
      body: (
        <ul>
          <li>Supplier’s name, address and GSTIN</li>
          <li>A consecutive serial number (max 16 characters), unique for the financial year</li>
          <li>Date of issue</li>
          <li>Recipient’s name, address and GSTIN/UIN if registered</li>
          <li>HSN code for goods or SAC for services</li>
          <li>Description and value of the goods or services</li>
          <li>Signature or digital signature of the supplier or authorised representative</li>
        </ul>
      ),
    },
    {
      id: "declaration",
      heading: "The composition declaration",
      body: (
        <p>
          Composition taxpayers must mention “
          <b>composition taxable person, not eligible to collect tax on supplies</b>” on their bills
          of supply. Invoice Studio adds this line automatically when you choose{" "}
          <Cta href="/invoice?new=1&type=bill_of_supply">Bill of Supply</Cta> — and you can edit it.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: "Who should issue a bill of supply?",
      a: "A registered person under the composition scheme, and a registered person supplying only exempt goods or services, issue a bill of supply instead of a tax invoice.",
    },
    {
      q: "Can I charge GST on a bill of supply?",
      a: "No. A bill of supply does not show or collect GST, and the buyer cannot claim input tax credit on it.",
    },
    {
      q: "What is the difference between a tax invoice and a bill of supply?",
      a: "A tax invoice charges GST and lets an eligible buyer claim input tax credit; a bill of supply is used when no GST can be charged, such as by composition dealers or for exempt supplies.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const exportInvoice: Guide = {
  slug: "export-invoice-lut",
  shortTitle: "Export invoice under LUT",
  title: "Export Invoice Under LUT: Format, Declaration and Currency",
  metaTitle: "Export Invoice Under LUT — Format & Declaration (GST)",
  description:
    "How to make an export invoice for goods or services without paying IGST under a Letter of Undertaking (LUT): the mandatory endorsement, extra fields, foreign currency and a free export invoice generator.",
  keywords: [
    "export invoice format",
    "LUT invoice",
    "export of services invoice",
    "zero rated supply invoice",
    "invoice in USD",
  ],
  answer:
    "Exports are zero-rated under section 16 of the IGST Act. If you have filed a Letter of Undertaking (LUT, Form GST RFD-11) for the financial year, you can export without paying IGST. The invoice must carry the endorsement “Supply meant for export under Letter of Undertaking without payment of integrated tax”, and show the recipient's name and address, the delivery address and the country of destination. You may invoice in a foreign currency such as USD or EUR.",
  sections: [
    {
      id: "options",
      heading: "Two ways to export under GST",
      body: (
        <Table
          head={["Option", "IGST on invoice", "Refund"]}
          rows={[
            ["Under LUT or bond", "No IGST charged", "Claim refund of unutilised input tax credit"],
            ["With payment of IGST", "IGST charged", "Claim refund of the IGST paid"],
          ]}
        />
      ),
    },
    {
      id: "fields",
      heading: "Extra details on an export invoice",
      body: (
        <ul>
          <li>
            The endorsement:{" "}
            <b>
              “Supply meant for export under Letter of Undertaking without payment of integrated
              tax”
            </b>{" "}
            (or “…on payment of integrated tax” if you pay IGST).
          </li>
          <li>Recipient’s name and address</li>
          <li>Address of delivery</li>
          <li>Name of the country of destination</li>
          <li>Your LUT reference number (good practice)</li>
        </ul>
      ),
    },
    {
      id: "services",
      heading: "When is a service an “export of services”?",
      body: (
        <p>
          Under section 2(6) of the IGST Act, the supplier must be in India, the recipient outside
          India, the place of supply outside India, payment received in convertible foreign exchange
          (or in Indian rupees where RBI permits), and the two must not be merely establishments of
          the same person.
        </p>
      ),
    },
    {
      id: "make-one",
      heading: "Create an export invoice in minutes",
      body: (
        <p>
          Choose <Cta href="/invoice?new=1&type=export">Export Invoice</Cta>, pick the currency, and
          add your LUT number in Settings → Invoice defaults. The declaration and SWIFT code from
          your bank details are added for you.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: "Do I charge GST on export invoices?",
      a: "Not if you export under a Letter of Undertaking (LUT). Exports are zero-rated, so with a valid LUT you can export goods or services without paying IGST. Alternatively you can pay IGST and claim a refund.",
    },
    {
      q: "What declaration is required on an export invoice under LUT?",
      a: "The invoice must carry the endorsement “Supply meant for export under Letter of Undertaking without payment of integrated tax”, along with the recipient's name and address, the delivery address and the country of destination.",
    },
    {
      q: "Can I make an invoice in USD or another foreign currency?",
      a: "Yes. Export invoices can be raised in a foreign currency. For GST returns, the value is converted to Indian rupees at the applicable exchange rate.",
    },
    {
      q: "How do I get an LUT?",
      a: "File Form GST RFD-11 on the GST portal. An LUT is valid for the financial year in which it is furnished.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const proforma: Guide = {
  slug: "proforma-invoice",
  shortTitle: "Proforma invoice vs tax invoice",
  title: "Proforma Invoice vs Tax Invoice (and Quotation): What's the Difference?",
  metaTitle: "Proforma Invoice vs Tax Invoice vs Quotation — Format & Uses",
  description:
    "A proforma invoice is a preliminary bill sent before a sale — it is not a GST tax invoice. Learn how it differs from a tax invoice and a quotation, when to use each, and how to convert one into the other.",
  keywords: [
    "proforma invoice",
    "proforma invoice format",
    "quotation format",
    "estimate format",
    "proforma vs tax invoice",
  ],
  answer:
    "A proforma invoice is a preliminary bill that tells the buyer what they will be charged before the sale happens — for advance payments, approvals or import paperwork. It is not a GST tax invoice: it creates no GST liability and the buyer cannot claim input tax credit on it. Once the goods or services are supplied, you issue a tax invoice. A quotation (or estimate) is an earlier, non-binding price offer.",
  sections: [
    {
      id: "comparison",
      heading: "Quotation vs proforma invoice vs tax invoice",
      body: (
        <Table
          head={["", "Quotation / estimate", "Proforma invoice", "Tax invoice"]}
          rows={[
            ["Purpose", "Price offer", "Advance bill / commitment", "Final bill for the supply"],
            ["When", "Before the order", "After agreement, before supply", "At or after supply"],
            ["GST liability", "No", "No", "Yes"],
            ["Input tax credit", "No", "No", "Yes (if eligible)"],
            ["Recorded in accounts", "No", "No", "Yes"],
          ]}
        />
      ),
    },
    {
      id: "convert",
      heading: "Convert a quotation into a tax invoice",
      body: (
        <p>
          In Invoice Studio, create a{" "}
          <Cta href="/invoice?new=1&type=proforma">quotation or proforma invoice</Cta>, and when the
          customer confirms, use <b>Convert to tax invoice</b>. The customer, items and prices are
          copied into a new tax invoice with its own number — nothing is retyped.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: "Is a proforma invoice valid under GST?",
      a: "A proforma invoice is not a tax invoice under GST. It creates no tax liability and cannot be used to claim input tax credit. Issue a tax invoice when the supply happens.",
    },
    {
      q: "What is the difference between a quotation and a proforma invoice?",
      a: "A quotation is a non-binding price offer made before the order. A proforma invoice is sent after the buyer agrees, often to request an advance payment, and lists the final terms before the actual tax invoice is issued.",
    },
    {
      q: "Can I convert a proforma invoice into a tax invoice?",
      a: "Yes. Issue a new tax invoice with its own invoice number when the goods or services are supplied. Invoice Studio converts a quotation into a tax invoice in one click.",
    },
  ],
};

export const GUIDES: Guide[] = [
  gstInvoiceFormat,
  cgstSgstIgst,
  billOfSupply,
  exportInvoice,
  proforma,
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
