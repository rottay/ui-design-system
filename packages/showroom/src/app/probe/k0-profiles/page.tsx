"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K0ProfileEvidence,
  type ProfileEvidenceLocale,
  type ProfileEvidenceProfile,
  type ProfileEvidenceTheme,
} from "@/components/k0-profile-evidence";

function sanitizeTheme(value: string | null): ProfileEvidenceTheme {
  return value === "bithire" || value === "evnto" ? value : "platform";
}

function sanitizeProfile(value: string | null): ProfileEvidenceProfile {
  return value === "technical-sharp" || value === "editorial-round"
    ? value
    : "none";
}

function sanitizeLocale(value: string | null): ProfileEvidenceLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      theme: sanitizeTheme(searchParams.get("theme")),
      profile: sanitizeProfile(searchParams.get("profile")),
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
