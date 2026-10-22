"use client";

import { CURRENCIES, currencySymbol } from "@/lib/currency";
import { OTHER_COUNTRY_CODE, SELECTABLE_STATES } from "@/lib/gst/states";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";

export function StateSelect({
  value,
  onChange,
  id,
  allowOutsideIndia,
  placeholder = "Select state",
  autoLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  allowOutsideIndia?: boolean;
  placeholder?: string;
  /** When set, adds an "Auto" option (empty value) with this label. */
  autoLabel?: string;
}) {
  const items = [
    ...(autoLabel ? [{ code: "", name: autoLabel }] : []),
    ...SELECTABLE_STATES.map((s) => ({ code: s.code, name: s.name })),
    ...(allowOutsideIndia ? [{ code: OTHER_COUNTRY_CODE, name: "Outside India" }] : []),
  ];
  return (
    <Combobox
      id={id}
      items={items}
      getKey={(s) => s.code || "auto"}
      getLabel={(s) => (s.code ? `${s.name} (${s.code})` : s.name)}
      getKeywords={(s) => [s.code]}
      selectedKey={value || (autoLabel ? "auto" : undefined)}
      onSelect={(s) => onChange(s.code)}
      placeholder={placeholder}
      searchPlaceholder="Search states…"
    />
  );
}

export function CurrencySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}) {
  return (
    <Combobox
      id={id}
      items={CURRENCIES}
      getKey={(c) => c.code}
      getLabel={(c) => `${c.code} — ${c.name}`}
      getDescription={(c) => currencySymbol(c.code)}
      selectedKey={value}
      onSelect={(c) => onChange(c.code)}
      searchPlaceholder="Search currencies…"
    />
  );
}

export function GstRateSelect({
  value,
  onChange,
  rates,
  id,
  size,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (rate: string) => void;
  rates: string[];
  id?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  const normalized = rates.map((r) => String(Number(r)));
  const current = value === "" ? "0" : String(Number(value));
  const options = Array.from(new Set([...normalized, current]))
    .filter((r) => r !== "NaN")
    .sort((a, b) => Number(a) - Number(b))
    .map((r) => ({ value: r, label: `${r}%` }));
  return (
    <Select
      id={id}
      size={size}
      value={current}
      onValueChange={onChange}
      options={options}
      aria-label={ariaLabel}
    />
  );
}
