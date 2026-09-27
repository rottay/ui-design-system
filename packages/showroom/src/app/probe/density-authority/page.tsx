import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  DensityAuthorityProbe,
  type DensityAuthorityDensity,
  type DensityAuthorityLocale,
  type DensityAuthoritySource,
} from "@/components/density-authority";

/**
 * Two governed sources only. A mixed source that layered a customer Appearance
 * over a reserved code-owned FlatTheme on one config is not admissible: the
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

function ProbeContent({ params }: { params: ProbeSearchParams }) {
  const cell = {
    source: sanitizeSource(probeParam(params, "source")),
    density: sanitizeDensity(probeParam(params, "density")),
    locale: sanitizeLocale(probeParam(params, "locale")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density}>
      <DensityAuthorityProbe {...cell} />
    </FleetGround>
  );
}

export default async function DensityAuthorityPage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
