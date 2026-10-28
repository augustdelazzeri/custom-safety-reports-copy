"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Which plant the prototype shows. The sample plant has assets, documents and work orders. The two
 * empty ones are the account most customers start with: assets from Maintenance but no Safety
 * documents, or nothing at all. Kept in this browser and in the address (`?data=`), so a link
 * opens the same state.
 */
export type DataMode = "sample" | "no-docs" | "new";

export const DATA_MODES: { value: DataMode; label: string; hint: string }[] = [
  { value: "sample", label: "Sample plant", hint: "Assets, documents and work orders" },
  { value: "no-docs", label: "No documents", hint: "Assets exist, no JHA, SOP, LOTO, permit or audit yet" },
  { value: "new", label: "No assets", hint: "No assets yet: the screen asks the user to create them" },
];

const KEY = "ehs-demo-data-mode";
const EVENT = "ehs-demo-data-mode";
const isMode = (v: unknown): v is DataMode => v === "sample" || v === "no-docs" || v === "new";

function read(): DataMode {
  try {
    const v = window.localStorage.getItem(KEY);
    return isMode(v) ? v : "sample";
  } catch {
    return "sample";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setDataMode(mode: DataMode) {
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    // Blocked storage: the address still carries it below.
  }
  try {
    const url = new URL(window.location.href);
    if (mode === "sample") url.searchParams.delete("data");
    else url.searchParams.set("data", mode);
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // The mode still changes for this visit.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useDataMode(): [DataMode, (m: DataMode) => void] {
  const mode = useSyncExternalStore(subscribe, read, () => "sample" as DataMode);
  // A link with ?data= wins over what this browser remembered.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("data");
    if (isMode(fromUrl) && fromUrl !== read()) setDataMode(fromUrl);
  }, []);
  return [mode, setDataMode];
}
