"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K4LaneAProbe,
  type K4LaneADensity,
  type K4LaneALocale,
  type K4LaneASource,
  type K4LaneAState,
  type K4LaneATheme,
} from "@/components/K4LaneAProbe";

function sanitizeSource(value: string | null): K4LaneASource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneALocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneADensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneAState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): K4LaneATheme {
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

  return <K4LaneAProbe {...cell} />;
}

export default function K4LaneAProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
