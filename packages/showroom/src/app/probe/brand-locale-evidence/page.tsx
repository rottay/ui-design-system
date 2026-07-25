"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  BrandLocaleEvidence,
  type BrandLocaleEvidenceFixture,
  type BrandLocaleEvidenceLocale,
} from "@/components/brand-locale-evidence";

function sanitizeFixture(value: string | null): BrandLocaleEvidenceFixture {
  return value === "themanagementmiami" ? value : "bithire";
}

function sanitizeLocale(value: string | null): BrandLocaleEvidenceLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function ProbeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fixture = useMemo(
    () => sanitizeFixture(searchParams.get("fixture")),
    [searchParams]
  );
  const locale = useMemo(
    () => sanitizeLocale(searchParams.get("locale")),
    [searchParams]
  );

  useEffect(() => {
    const probeWindow = window as Window & {
      __setBrandLocaleEvidenceCell?: (next: {
        fixture: BrandLocaleEvidenceFixture;
        locale: BrandLocaleEvidenceLocale;
      }) => void;
    };
    probeWindow.__setBrandLocaleEvidenceCell = (next) => {
      const params = new URLSearchParams({
        fixture: sanitizeFixture(next.fixture),
        locale: sanitizeLocale(next.locale),
      });
      router.replace(`/probe/brand-locale-evidence?${params.toString()}`, {
        scroll: false,
      });
    };
    return () => {
      delete probeWindow.__setBrandLocaleEvidenceCell;
    };
  }, [router]);

  return <BrandLocaleEvidence fixture={fixture} locale={locale} />;
}

export default function BrandLocaleEvidencePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
