"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K2LaneVProbe,
  type LaneVDensity,
  type LaneVLocale,
  type LaneVSource,
  type LaneVState,
} from "@/components/k2-lane-v";

function sanitizeSource(value: string | null): LaneVSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneVLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneVDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneVState {
  return value === "disabled" || value === "error" ? value : "rest";
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

  return <K2LaneVProbe {...cell} />;
}

export default function K2LaneVProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
