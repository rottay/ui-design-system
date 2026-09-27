import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K4LaneCProbe,
  type K4LaneCDensity,
  type K4LaneCLocale,
  type K4LaneCSource,
  type K4LaneCState,
  type K4LaneCTheme,
} from "@/components/probes/patterns/media-actions";

function sanitizeSource(value: string | null): K4LaneCSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneCLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneCDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneCState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): K4LaneCTheme {
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
      <K4LaneCProbe {...cell} />
    </FleetGround>
  );
}

export default async function K4LaneCProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <ProbeContent params={params} />
  );
}
