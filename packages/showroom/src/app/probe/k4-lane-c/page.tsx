"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K4LaneCProbe,
  type K4LaneCDensity,
  type K4LaneCLocale,
  type K4LaneCSource,
  type K4LaneCState,
  type K4LaneCTheme,
} from "@/components/K4LaneCProbe";

function sanitizeSource(value: string | null): K4LaneCSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneCLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneCDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneCState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): K4LaneCTheme {
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

  return <K4LaneCProbe {...cell} />;
}

export default function K4LaneCProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
