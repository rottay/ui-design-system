"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  DensityAuthorityProbe,
  type DensityAuthorityDensity,
  type DensityAuthorityLocale,
  type DensityAuthoritySource,
} from "@/components/density-authority";

/**
 * Two governed sources only. A mixed source that layered a customer Appearance
 * over a reserved code-owned BrandTheme on one config is not admissible: the
 * runtime resolves exactly one visual authority per tenant. There is no recipe
 * axis here either — that one belongs to the recipe-profile probe, and carrying
 * a dead copy of it would fake a cross-axis this route never tests.
 */
function sanitizeSource(value: string | null): DensityAuthoritySource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeDensity(value: string | null): DensityAuthorityDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeLocale(value: string | null): DensityAuthorityLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      density: sanitizeDensity(searchParams.get("density")),
      locale: sanitizeLocale(searchParams.get("locale")),
    }),
    [searchParams]
  );

  return <DensityAuthorityProbe {...cell} />;
}

export default function DensityAuthorityPage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
