"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  P1ActionDockProbe,
  type P1ActionDockDensity,
  type P1ActionDockLocale,
  type P1ActionDockSource,
  type P1ActionDockState,
  type P1ActionDockTheme,
} from "@/components/P1ActionDockProbe";

function sanitizeSource(value: string | null): P1ActionDockSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): P1ActionDockLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): P1ActionDockDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): P1ActionDockState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): P1ActionDockTheme {
  return value === "dark" ? value : "light";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      locale: sanitizeLocale(searchParams.get("locale")),
      density: sanitizeDensity(searchParams.get("density")),
      state: sanitizeState(searchParams.get("state")),
      theme: sanitizeTheme(searchParams.get("theme")),
    }),
    [searchParams]
  );

  return <P1ActionDockProbe {...cell} />;
}

export default function P1ActionDockProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
