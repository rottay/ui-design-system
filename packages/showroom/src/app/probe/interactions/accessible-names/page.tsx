import { FleetGround, probeParam, type FleetLocale, type ProbeSearchParams } from "@/components/probes/ground";

import { AccessibleNamesFixture } from "./fixture";

// Read in real Chromium by e2e/a11y/visible-label-names.spec.ts; no visual spec captures it.
// ?locale=es switches the provider locale so the localized default names can be read.

function sanitizeLocale(value: string | null): Extract<FleetLocale, "en" | "es"> {
  return value === "es" ? "es" : "en";
}

export default async function AccessibleNamesProbePage({ searchParams }: { searchParams: Promise<ProbeSearchParams> }) {
  const params = await searchParams;
  const locale = sanitizeLocale(probeParam(params, "locale"));
  return (
    <main>
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
        Accessible names of action buttons
      </h1>
      <FleetGround source="bithire-static" locale={locale}>
        <AccessibleNamesFixture />
      </FleetGround>
    </main>
  );
}
