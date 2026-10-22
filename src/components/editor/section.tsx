"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/ui/collapse";

/** A card-like editor section with an optional collapsible body. */
export function EditorSection({
  title,
  icon,
  summary,
  action,
  children,
  collapsible = false,
  defaultOpen = true,
  id,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  summary?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const header = (
    <>
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted-foreground ring-1 ring-border [&_svg]:size-4">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold tracking-[-0.01em]">{title}</span>
        {summary && !open && (
          <span className="block truncate text-[13px] text-muted-foreground">{summary}</span>
        )}
      </span>
    </>
  );
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-2xl border border-border bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={bodyId}
            className="-m-1.5 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 focus-visible:focus-ring"
          >
            {header}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">{header}</div>
        )}
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {collapsible ? (
        <Collapse open={open} id={bodyId}>
          <div className="border-t border-border px-4 pt-4 pb-5 sm:px-5">{children}</div>
        </Collapse>
      ) : (
        <div className="border-t border-border px-4 pt-4 pb-5 sm:px-5">{children}</div>
      )}
    </section>
  );
}
