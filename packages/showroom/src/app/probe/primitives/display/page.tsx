import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K1LaneAProbe,
  type LaneADensity,
  type LaneALocale,
  type LaneASource,
  type LaneAState,
} from "@/components/probes/primitives/display";

function sanitizeSource(value: string | null): LaneASource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneALocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneADensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneAState {
  return value === "disabled" || value === "loading" ? value : "rest";
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
      <K1LaneAProbe {...cell} />
    </FleetGround>
  );
}

export default async function K1LaneAProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
