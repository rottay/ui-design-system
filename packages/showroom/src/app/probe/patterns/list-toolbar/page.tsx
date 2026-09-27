import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  P1ListToolbarProbe,
  type P1ListToolbarDensity,
  type P1ListToolbarLocale,
  type P1ListToolbarSource,
  type P1ListToolbarState,
} from "@/components/probes/patterns/list-toolbar";

function sanitizeSource(value: string | null): P1ListToolbarSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): P1ListToolbarLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): P1ListToolbarDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): P1ListToolbarState {
  // The lane's request defines only `rest` today; the param is accepted for
  // forward compatibility.
  void value;
  return "rest";
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
      <P1ListToolbarProbe {...cell} />
    </FleetGround>
  );
}

export default async function P1ListToolbarProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
