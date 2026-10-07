"use client";

import type { ReactNode } from "react";

import { DensityScope, type DensityPosture } from "@rottay/design-system";

/** The code-owned ground's density seam: a scope, never a config edit. */
export function FleetDensityScope({ posture, children }: { readonly posture: DensityPosture; readonly children: ReactNode }) {
  return <DensityScope posture={posture}>{children}</DensityScope>;
}
