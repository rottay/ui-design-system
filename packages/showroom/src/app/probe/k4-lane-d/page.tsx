"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K4LaneDProbe,
  type K4LaneDDensity,
  type K4LaneDGround,
  type K4LaneDLocale,
  type K4LaneDSource,
  type K4LaneDState,
} from "@/components/K4LaneDProbe";

function sanitizeSource(value: string | null): K4LaneDSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneDLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneDDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneDState {
  return value === "error" || value === "disabled" ? value : "rest";
}

function sanitizeGround(value: string | null): K4LaneDGround {
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
      ground: sanitizeGround(searchParams.get("ground")),
    }),
    [searchParams]
  );

  return <K4LaneDProbe {...cell} />;
}

export default function K4LaneDProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
