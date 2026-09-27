import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K4LaneAProbe,
  type K4LaneADensity,
  type K4LaneALocale,
  type K4LaneASource,
  type K4LaneAState,
  type K4LaneATheme,
} from "@/components/probes/patterns/overlay-notifications";

function sanitizeSource(value: string | null): K4LaneASource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneALocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneADensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneAState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): K4LaneATheme {
  return value === "dark" ? value : "light";
}

function ProbeContent({ params }: { params: ProbeSearchParams }) {
  const cell = {
    source: sanitizeSource(probeParam(params, "source")),
    locale: sanitizeLocale(probeParam(params, "locale")),
    density: sanitizeDensity(probeParam(params, "density")),
    state: sanitizeState(probeParam(params, "state")),
    theme: sanitizeTheme(probeParam(params, "theme")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density} theme={cell.theme}>
      <K4LaneAProbe {...cell} />
    </FleetGround>
  );
}

export default async function K4LaneAProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
