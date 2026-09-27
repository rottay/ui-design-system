"use client";

import type { ReactNode } from "react";

import { DensityScope } from "@rottay/design-system";

import type { FleetDensity } from "../documents";

/** The code-owned ground's density seam: a scope, never a config edit. */
export function FleetDensityScope({ posture, children }: { readonly posture: FleetDensity; readonly children: ReactNode }) {
  return <DensityScope posture={posture}>{children}</DensityScope>;
}
