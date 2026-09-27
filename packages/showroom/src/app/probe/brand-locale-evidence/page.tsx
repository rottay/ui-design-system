import { BrandLocaleEvidence } from "@/components/brand-locale-evidence";
import {
  evidenceSource,
  type BrandLocaleEvidenceFixture,
  type BrandLocaleEvidenceLocale,
} from "@/components/brand-locale-evidence/source";
import { FleetGround, ProbeCellSwitch, probeParam, type ProbeSearchParams } from "@/components/probes/ground";

function sanitizeFixture(value: string | null): BrandLocaleEvidenceFixture {
  return value === "themanagementmiami" ? value : "bithire";
}

function sanitizeLocale(value: string | null): BrandLocaleEvidenceLocale {
  return value === "es" || value === "ar" ? value : "en";
}

const CELL_AXES = {
  fixture: { values: ["bithire", "themanagementmiami"], fallback: "bithire" },
  locale: { values: ["en", "es", "ar"], fallback: "en" },
};

export default async function BrandLocaleEvidencePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const fixture = sanitizeFixture(probeParam(params, "fixture"));
  const locale = sanitizeLocale(probeParam(params, "locale"));
  return (
    <FleetGround source={evidenceSource(fixture)} locale={locale}>
      <ProbeCellSwitch hook="__setBrandLocaleEvidenceCell" route="/probe/brand-locale-evidence" axes={CELL_AXES} />
      <BrandLocaleEvidence fixture={fixture} locale={locale} />
    </FleetGround>
  );
}
