import type { FleetSource } from "@/components/probes/ground/documents";

export type BrandLocaleEvidenceFixture = "bithire" | "themanagementmiami";
export type BrandLocaleEvidenceLocale = "en" | "es" | "ar";

/**
 * The evidence routes' two fixtures ARE two of the fleet's governed sources. The
 * seeds-only source is the canary's subject, not these routes'.
 */
export function evidenceSource(fixture: BrandLocaleEvidenceFixture): FleetSource {
  return fixture === "themanagementmiami" ? "themanagement-db" : "bithire-static";
}
