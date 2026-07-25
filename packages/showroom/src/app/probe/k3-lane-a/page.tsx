"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  K3LaneAProbe,
  type LaneADensity,
  type LaneALocale,
  type LaneASource,
  type LaneAState,
} from "@/components/k3-lane-a";

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

function ProbeContent() {
  const searchParams = useSearchParams();
  const cell = useMemo(
    () => ({
      source: sanitizeSource(searchParams.get("source")),
      locale: sanitizeLocale(searchParams.get("locale")),
      density: sanitizeDensity(searchParams.get("density")),
      state: sanitizeState(searchParams.get("state")),
    }),
    [searchParams]
  );

  return <K3LaneAProbe {...cell} />;
}

export default function K3LaneAProbePage() {
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
      <Suspense fallback={null}>
        <ProbeContent />
      </Suspense>
    </main>
  );
}
