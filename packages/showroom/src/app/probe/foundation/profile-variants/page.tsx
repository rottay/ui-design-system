"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K0ProfileEvidence,
  type ProfileEvidenceLocale,
  type ProfileEvidenceVertical,
} from "@/components/probes/foundation/profile-variants";

function sanitizeVertical(value: string | null): ProfileEvidenceVertical {
  return value === "bithire" || value === "evnto" ? value : "rottay";
}

function sanitizeLocale(value: string | null): ProfileEvidenceLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  // `?profile=` is deliberately NOT read. A recipe profile is authored in the
  // vertical's checked-in BrandTheme and reaches the runtime only through the
  // code-owned registry path; a runtime override is unrenderable, so offering
  // the knob would only produce spinners. See the probe's own header.
  const cell = useMemo(
    () => ({
      vertical: sanitizeVertical(searchParams.get("vertical")),
      locale: sanitizeLocale(searchParams.get("locale")),
    }),
    [searchParams]
  );

  return <K0ProfileEvidence {...cell} />;
}

export default function K0ProfileEvidencePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
