import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K1LaneBProbe,
  type LaneBDensity,
  type LaneBLocale,
  type LaneBSource,
  type LaneBState,
} from "@/components/probes/primitives/forms";

function sanitizeSource(value: string | null): LaneBSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): LaneBLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): LaneBDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): LaneBState {
  return value === "disabled" || value === "error" || value === "loading"
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
      <K1LaneBProbe {...cell} />
    </FleetGround>
  );
}

export default async function K1LaneBProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
