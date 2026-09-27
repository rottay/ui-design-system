import { groundFor } from "@/components/probe-ground";
import {
  FleetStage,
  fleetGroundRequest,
  FLEET_SLUG,
  probeParam,
  type FleetDensity,
  type FleetLocale,
  type FleetSource,
  type FleetTheme,
  type ProbeSearchParams,
} from "@/components/probes/ground";

import { WlCanaryCanvas } from "./canvas";

/** The only mountable sources. Anything else is a hard failure. */
const SOURCES: readonly FleetSource[] = ["bithire-static", "themanagement-db", "themanagement-seeds"];

/**
 * A requested source that cannot mount must FAIL VISIBLY. The previous form
 * coerced any unrecognised `?source` to `bithire-static`, so a typo — or a
 * tenant that stopped resolving — rendered a different vertical under the
 * requested name. That silent substitution is the defect this probe exists to
 * catch, so it cannot be allowed to live in the probe's own plumbing.
 */
function ProbeFailure({ requested }: { requested: string }) {
  return (
    <main
      data-testid="wc-source-failure"
      data-canary-source-requested={requested}
      style={{ minHeight: "100vh", padding: 32, fontFamily: "system-ui, sans-serif", background: "#2b0b0b", color: "#ffd9d9" }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>canary source did not mount</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        Requested source <code>{requested || "(empty)"}</code> is not one of{" "}
        <code>{SOURCES.join(" | ")}</code>. Nothing is rendered on purpose: falling back to
        another tenant would make this probe certify the wrong vertical under the requested name.
      </p>
    </main>
  );
}

export default async function WlCanaryProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const requestedSource = probeParam(params, "source");
  // Absent is the documented default; PRESENT-BUT-UNKNOWN is an error.
  const sourceIsValid = requestedSource === null || (SOURCES as readonly string[]).includes(requestedSource);
  if (!sourceIsValid) return <ProbeFailure requested={requestedSource ?? ""} />;
  const source: FleetSource = (requestedSource ?? "bithire-static") as FleetSource;
  const localeParam = probeParam(params, "locale");
  const locale: FleetLocale = localeParam === "es" || localeParam === "ar" ? localeParam : "en";
  const densityParam = probeParam(params, "density");
  const density: FleetDensity = densityParam === "compact" || densityParam === "spacious" ? densityParam : "comfortable";
  const theme: FleetTheme = probeParam(params, "theme") === "dark" ? "dark" : "light";
  const seedPrimary = probeParam(params, "seedPrimary") ?? undefined;

  const ground = await groundFor(fleetGroundRequest(source, { locale, density, theme, seedPrimary }));
  const mountedSlug = ground.mounted.rootAttributes["data-tenant"] ?? "";
  // The mounted identity must also MATCH what was asked for: a resolver that
  // quietly returns another tenant is the same defect wearing a valid name.
  if (mountedSlug !== FLEET_SLUG[source]) {
    return <ProbeFailure requested={`${source} -> resolved '${mountedSlug}'`} />;
  }

  return (
    <FleetStage ground={ground} density={density}>
      <WlCanaryCanvas
        source={source}
        mountedSlug={mountedSlug}
        locale={locale}
        density={density}
        // Overlays are opt-in (`&modal=1` / `&sheet=1`) so they do not cover the
        // other sections in their own captures (they portal above everything).
        modalInitiallyOpen={probeParam(params, "modal") === "1"}
        sheetInitiallyOpen={probeParam(params, "sheet") === "1"}
      />
    </FleetStage>
  );
}
