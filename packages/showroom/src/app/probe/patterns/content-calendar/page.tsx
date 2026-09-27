import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K4LaneBProbe,
  type LaneBDensity,
  type LaneBLocale,
  type LaneBSource,
  type LaneBState,
  type LaneBTheme,
} from "@/components/probes/patterns/content-calendar";

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
  return value === "stress" ? value : "rest";
}

function sanitizeTheme(value: string | null): LaneBTheme {
  return value === "dark" ? value : "light";
}

export default async function K4LaneBProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const get = (key: string) => probeParam(params, key);
  const cell = {
    source: sanitizeSource(get("source")),
    locale: sanitizeLocale(get("locale")),
    density: sanitizeDensity(get("density")),
    state: sanitizeState(get("state")),
    theme: sanitizeTheme(get("theme")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density} theme={cell.theme}>
      <K4LaneBProbe {...cell} />
    </FleetGround>
  );
}
