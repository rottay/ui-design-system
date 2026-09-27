import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K4LaneDProbe,
  type K4LaneDDensity,
  type K4LaneDGround,
  type K4LaneDLocale,
  type K4LaneDSource,
  type K4LaneDState,
} from "@/components/probes/patterns/complex-inputs";

function sanitizeSource(value: string | null): K4LaneDSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): K4LaneDLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): K4LaneDDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): K4LaneDState {
  return value === "error" || value === "disabled" ? value : "rest";
}

function sanitizeGround(value: string | null): K4LaneDGround {
  return value === "dark" ? value : "light";
}

export default async function K4LaneDProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const get = (key: string) => probeParam(params, key);
  const cell = {
    source: sanitizeSource(get("source")),
    locale: sanitizeLocale(get("locale")),
    density: sanitizeDensity(get("density")),
    state: sanitizeState(get("state")),
    ground: sanitizeGround(get("ground")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density} theme={cell.ground}>
      <K4LaneDProbe {...cell} />
    </FleetGround>
  );
}
