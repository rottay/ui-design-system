"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DensityScope } from "@/infrastructure/runtime/foundation/density";
import { ActionDock } from "@/components/structures/workspace/action-dock";
import type {
  ResolvedSurfacePosture,
  SurfaceFamily,
  SurfacePostures,
} from "../../../foundation/contracts/postures";
import { ResolvedSurfaceRegion, useSurfacePosture } from "../region";

const SurfacePostureContext = createContext<ResolvedSurfacePosture | undefined>(
  undefined
);

export function useScopedSurfacePosture(): ResolvedSurfacePosture | undefined {
  return useContext(SurfacePostureContext);
}

export function SurfacePostureScope({
  postures,
  family = "list",
  children,
}: {
  postures?: SurfacePostures;
  family?: SurfaceFamily;
  children: ReactNode;
}) {
  const resolved = useSurfacePosture(postures, family);
  const active = postures === undefined ? undefined : resolved;

  return (
    <SurfacePostureContext.Provider value={active}>
      {active?.density ? (
        <DensityScope posture={active.density}>{children}</DensityScope>
      ) : (
        children
      )}
    </SurfacePostureContext.Provider>
  );
}

export function SurfacePostureSlot({
  name,
  label,
  children,
  asChild = false,
}: {
  name: string;
  label?: string;
  children?: ReactNode;
  /** Annotate a single layout container; collapse clears only its children. */
  asChild?: boolean;
}) {
  const posture = useScopedSurfacePosture();
  if (!posture) return <>{children}</>;

  return (
    <ResolvedSurfaceRegion
      name={name}
      label={label}
      posture={posture}
      asChild={asChild}
    >
      {children}
    </ResolvedSurfaceRegion>
  );
}

export function SurfacePostureAction({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  const posture = useScopedSurfacePosture();
  const placement = posture?.primaryAction ?? "app-bar";
  if (
    posture?.regions["primary-action"] &&
    posture.regions["primary-action"] !== "render"
  ) {
    return <SurfacePostureSlot name="primary-action" label={label} />;
  }
  const action = (
    <SurfacePostureSlot name="primary-action" label={label} asChild>
      {children}
    </SurfacePostureSlot>
  );
  if (placement === "app-bar") return action;

  return (
    <SurfacePostureSlot name={placement} label={label} asChild>
      <ActionDock
        mode={placement === "bottom-bar" ? "sticky" : "fixed"}
        aria-label={label}
      >
        {action}
      </ActionDock>
    </SurfacePostureSlot>
  );
}
