"use client";

import { motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
  "aria-label"?: string;
  id?: string;
}

/** Segmented control with a sliding selection pill. */
export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  size = "md",
  className,
  fullWidth,
  id,
  ...aria
}: SegmentedProps<T>) {
  const layoutId = useId();
  return (
    <ToggleGroup.Root
      id={id}
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      className={cn(
        "relative inline-flex items-center gap-0.5 rounded-[10px] bg-surface-3 p-[3px]",
        fullWidth && "flex w-full",
        className,
      )}
      aria-label={aria["aria-label"]}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <ToggleGroup.Item
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            title={o.title}
            aria-label={o.label ? undefined : o.title}
            className={cn(
              "relative z-0 inline-flex items-center justify-center gap-1.5 rounded-[7px] font-medium whitespace-nowrap",
              "transition-colors duration-150 focus-visible:focus-ring disabled:opacity-40",
              size === "sm"
                ? "h-7 px-2.5 text-xs [&_svg]:size-3.5"
                : "h-8 px-3 text-[13px] [&_svg]:size-4",
              fullWidth && "flex-1",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-[7px] bg-surface shadow-sm dark:bg-surface-2"
                transition={{ type: "spring", bounce: 0.18, duration: 0.38 }}
              />
            )}
            {o.icon}
            {o.label}
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
