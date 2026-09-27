import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  P1ActionDockProbe,
  type P1ActionDockDensity,
  type P1ActionDockLocale,
  type P1ActionDockSource,
  type P1ActionDockState,
  type P1ActionDockTheme,
} from "@/components/probes/patterns/action-dock";

function sanitizeSource(value: string | null): P1ActionDockSource {
  return value === "themanagement-db" ? value : "bithire-static";
}

function sanitizeLocale(value: string | null): P1ActionDockLocale {
  return value === "es" || value === "ar" ? value : "en";
}

function sanitizeDensity(value: string | null): P1ActionDockDensity {
  return value === "compact" || value === "spacious" ? value : "comfortable";
}

function sanitizeState(value: string | null): P1ActionDockState {
  return value === "loading" || value === "error" ? value : "rest";
}

function sanitizeTheme(value: string | null): P1ActionDockTheme {
  return value === "dark" ? value : "light";
}

export default async function P1ActionDockProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
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
      <P1ActionDockProbe {...cell} />
    </FleetGround>
  );
}
