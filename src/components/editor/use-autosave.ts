"use client";

import { useEffect } from "react";
import { isNumberTaken, saveInvoice } from "@/db/invoices";
import { useEditor } from "@/stores/editor-store";

const AUTOSAVE_DELAY = 600;

let queue: Promise<void> = Promise.resolve();

/**
 * Write the current document if it has unsaved edits. Saves are serialised
 * through a promise queue so two writes never race each other.
 */
export function flushSave(): Promise<void> {
  queue = queue.then(async () => {
    const state = useEditor.getState();
    const invoice = state.invoice;
    if (!invoice || state.revision === state.savedRevision) return;
    const revision = state.revision;
    const firstSave = !state.persisted;
    state.markSaving();
    try {
      const saved = await saveInvoice(invoice);
      useEditor.getState().markSaved(revision, saved);
      if (firstSave && typeof window !== "undefined") {
        // Give the draft a stable URL without a navigation/re-render.
        window.history.replaceState(window.history.state, "", `/invoice?id=${saved.id}`);
      }
    } catch {
      useEditor.getState().markError();
    }
  });
  return queue;
}

/** Debounced autosave + duplicate-number check + leave-page guard. */
export function useAutosave() {
  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let numberTimer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useEditor.subscribe((state, prev) => {
      if (state.revision !== prev.revision && state.revision !== state.savedRevision) {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => void flushSave(), AUTOSAVE_DELAY);
      }
      const number = state.invoice?.number;
      if (
        state.invoice &&
        (number !== prev.invoice?.number || state.invoice.id !== prev.invoice?.id)
      ) {
        clearTimeout(numberTimer);
        const id = state.invoice.id;
        numberTimer = setTimeout(async () => {
          const taken = await isNumberTaken(number ?? "", id).catch(() => false);
          if (useEditor.getState().invoice?.id === id) useEditor.getState().setNumberTaken(taken);
        }, 300);
      }
    });

    const beforeUnload = (e: BeforeUnloadEvent) => {
      const s = useEditor.getState();
      if (s.invoice && s.revision !== s.savedRevision) {
        void flushSave();
        e.preventDefault();
      }
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") void flushSave();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      unsubscribe();
      clearTimeout(saveTimer);
      clearTimeout(numberTimer);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", onHide);
      void flushSave();
    };
  }, []);
}
