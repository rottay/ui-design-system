import { FleetGround, probeParam, type ProbeSearchParams } from "@/components/probes/ground";
import {
  K3LaneBProbe,
  type LaneBDensity,
  type LaneBLocale,
  type LaneBSource,
  type LaneBState,
  type LaneBVariant,
} from "@/components/probes/patterns/navigation";

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
  return value === "disabled" || value === "error" ? value : "rest";
}

const VARIANTS: readonly LaneBVariant[] = [
  "menu-collapsed",
  "breadcrumb-overflow",
  "pagination-compact",
  "steps-finished",
  "stepper-horizontal",
];

function sanitizeVariant(value: string | null): LaneBVariant | undefined {
  return VARIANTS.find((variant) => variant === value);
}

function ProbeContent({ params }: { params: ProbeSearchParams }) {
  const cell = {
    source: sanitizeSource(probeParam(params, "source")),
    locale: sanitizeLocale(probeParam(params, "locale")),
    density: sanitizeDensity(probeParam(params, "density")),
    state: sanitizeState(probeParam(params, "state")),
    variant: sanitizeVariant(probeParam(params, "variant")),
  };

  return (
    <FleetGround source={cell.source} locale={cell.locale} density={cell.density}>
      <K3LaneBProbe {...cell} />
    </FleetGround>
  );
}

export default async function K3LaneBProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
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
        K3 lane B — navigation probe
      </h1>
      <ProbeContent params={params} />
    </main>
  );
}
