"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K1LaneBProbe,
  type LaneBDensity,
  type LaneBLocale,
  type LaneBSource,
  type LaneBState,
} from "@/components/k1-lane-b";

function sanitizeSource(value: string | null): LaneBSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneBLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneBDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneBState {
  return value === "disabled" || value === "error" || value === "loading"
    ? value
    : "rest";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      locale: sanitizeLocale(searchParams.get("locale")),
      density: sanitizeDensity(searchParams.get("density")),
      state: sanitizeState(searchParams.get("state")),
    }),
    [searchParams]
  );

  return <K1LaneBProbe {...cell} />;
}

export default function K1LaneBProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
