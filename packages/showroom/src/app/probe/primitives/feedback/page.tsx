import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K1LaneCProbe,
  type LaneCDensity,
  type LaneCLocale,
  type LaneCSource,
  type LaneCState,
} from "@/components/probes/primitives/feedback";

function sanitizeSource(value: string | null): LaneCSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneCLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneCDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneCState {
  return value === "loading" || value === "empty" || value === "error"
    ? value
    : "rest";
}

function ProbeContent({ params }: { params: ProbeSearchParams }) {
  const cell = {
    source: sanitizeSource(probeParam(params, "source")),
    locale: sanitizeLocale(probeParam(params, "locale")),
    density: sanitizeDensity(probeParam(params, "density")),
    state: sanitizeState(probeParam(params, "state")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density}>
      <K1LaneCProbe {...cell} />
    </FleetGround>
  );
}

export default async function K1LaneCProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
