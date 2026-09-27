import type { ReactNode } from "react";

import { GroundStage, groundFor, type Ground } from "@/components/probe-ground";

import { FleetDensityScope } from "./density";
import {
  FLEET_ARTIFACT_TESTID,
  fleetGroundRequest,
  type FleetDensity,
  type FleetGroundOptions,
  type FleetSource,
} from "./documents";

export { ProbeCellSwitch, type ProbeCellAxis, type ProbeCellSwitchProps } from "./cell-switch";
export { probeParam, type ProbeSearchParams } from "./params";
export {
  FLEET_ARTIFACT_TESTID,
  FLEET_SLUG,
  SEEDS_ONLY_DOCUMENT_ALLOWLIST,
  fleetGroundRequest,
  seedsOnlyDocument,
  type FleetDensity,
  type FleetGroundOptions,
  type FleetLocale,
  type FleetSource,
  type FleetTheme,
} from "./documents";

export interface FleetStageProps {
  readonly ground: Ground;
  /** Scoped only on a code-owned ground; a compiled one carries its own density. */
  readonly density?: FleetDensity;
  readonly children: ReactNode;
}

/** A resolved ground as the fleet renders it: the stamp first, then the stage. */
export function FleetStage({ ground, density, children }: FleetStageProps) {
  const scoped = ground.stage.artifact === null && density;
  return (
    <>
      <script data-testid="showroom-tenant-stamp" dangerouslySetInnerHTML={{ __html: ground.stamp }} />
      <GroundStage {...ground.stage} styleTestId={FLEET_ARTIFACT_TESTID}>
        {scoped ? <FleetDensityScope posture={density}>{children}</FleetDensityScope> : children}
      </GroundStage>
    </>
  );
}

export interface FleetGroundProps extends FleetGroundOptions {
  readonly source: FleetSource;
  readonly children: ReactNode;
}

/** One fleet cell on the probe-ground kernel. */
export async function FleetGround({ source, children, ...options }: FleetGroundProps) {
  const ground = await groundFor(fleetGroundRequest(source, options));
  return (
    <FleetStage ground={ground} density={options.density}>
      {children}
    </FleetStage>
  );
}
