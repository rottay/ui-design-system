import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K3LaneAProbe,
  type LaneADensity,
  type LaneALocale,
  type LaneASource,
  type LaneAState,
} from "@/components/probes/patterns/data-display";

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
  return value === "loading" || value === "empty" ? value : "rest";
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
      <K3LaneAProbe {...cell} />
    </FleetGround>
  );
}

export default async function K3LaneAProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  return (
    <main>
      {/*
        The lane contract requires exactly one h1 per probe page; it is
        visually hidden so the capture cells show only the specimen tree.
      */}
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        K3 lane A — data display probe
      </h1>
      <ProbeContent params={params} />
    </main>
  );
}
