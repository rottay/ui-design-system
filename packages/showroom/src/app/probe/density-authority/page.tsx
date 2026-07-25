"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  DensityAuthorityProbe,
  type DensityAuthorityDensity,
  type DensityAuthorityLocale,
  type DensityAuthorityProfile,
  type DensityAuthoritySource,
} from "@/components/density-authority";

function sanitizeSource(value: string | null): DensityAuthoritySource {
  return value === "themanagement-db" || value === "db-over-static"
    ? value
    : "bithire-static";
}

function sanitizeDensity(value: string | null): DensityAuthorityDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeLocale(value: string | null): DensityAuthorityLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeProfile(value: string | null): DensityAuthorityProfile {
  return value === "technical-sharp" || value === "editorial-round"
    ? value
    : "none";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      density: sanitizeDensity(searchParams.get("density")),
      locale: sanitizeLocale(searchParams.get("locale")),
      profile: sanitizeProfile(searchParams.get("profile")),
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
