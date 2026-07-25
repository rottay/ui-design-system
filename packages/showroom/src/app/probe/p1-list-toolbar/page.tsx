"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  P1ListToolbarProbe,
  type P1ListToolbarDensity,
  type P1ListToolbarEngine,
  type P1ListToolbarLocale,
  type P1ListToolbarSource,
  type P1ListToolbarState,
} from "@/components/P1ListToolbarProbe";

function sanitizeSource(value: string | null): P1ListToolbarSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): P1ListToolbarLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): P1ListToolbarDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeEngine(value: string | null): P1ListToolbarEngine {
  return value === "classic" || value === "rustic" ? value : "modern";
}

function sanitizeState(value: string | null): P1ListToolbarState {
  // The lane's request defines only `rest` today; the param is accepted for
  // forward compatibility.
  void value;
  return "rest";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      locale: sanitizeLocale(searchParams.get("locale")),
      density: sanitizeDensity(searchParams.get("density")),
      engine: sanitizeEngine(searchParams.get("engine")),
      state: sanitizeState(searchParams.get("state")),
    }),
    [searchParams]
  );

  return <P1ListToolbarProbe {...cell} />;
}

export default function P1ListToolbarProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
