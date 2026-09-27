import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K2LaneVProbe,
  type LaneVDensity,
  type LaneVLocale,
  type LaneVSource,
  type LaneVState,
} from "@/components/probes/primitives/advanced-inputs";

function sanitizeSource(value: string | null): LaneVSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneVLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneVDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneVState {
  return value === "disabled" || value === "error" ? value : "rest";
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
      <K2LaneVProbe {...cell} />
    </FleetGround>
  );
}

export default async function K2LaneVProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
