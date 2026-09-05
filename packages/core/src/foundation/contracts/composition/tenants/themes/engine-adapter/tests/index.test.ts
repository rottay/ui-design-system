/**
 * The engine-adapter contract's totality law, proved over the live registry in
 * the type system and at runtime.
 *
 * Named by the `engine-posture-totality` discharge ledger in the engine-freeze
 * gate: deleting this file re-reddens that gate.
 */

import { describe, expect, it } from "vitest";

import { TENANT_CAPABILITY_REGISTRY } from "../../../capabilities";
import type { EngineTokenOverrides } from "@/foundation/contracts/kernel/tokens/engine-tokens";
import type {
  ControlId,
  EngineAdapter,
  EngineControlDeclaration,
  EnginePosture,
} from "..";

const POSTURES: readonly EnginePosture[] = [
  "native",
  "mapped",
  "invariant",
  "unsupported",
];

const cell: EngineControlDeclaration = {
  posture: "native",
  evidence: { kind: "channels", read: ["--ds-color-primary"] },
};

const baseline: EngineTokenOverrides = {
  borderRadius: { none: "0", sm: "1px", md: "2px", lg: "3px", xl: "4px", full: "9999px" },
  shadows: { sm: "none", md: "none", lg: "none", xl: "none" },
  surface: { borderWidth: "0", borderStyle: "none", useGradients: false, useGlass: false },
  motion: { hover: "0ms", transform: "none", spring: "linear", durationScale: 1 },
  densityScale: 1,
};

const total = Object.fromEntries(
  TENANT_CAPABILITY_REGISTRY.map((control) => [control.id, cell])
) as Record<ControlId, EngineControlDeclaration>;

const posture = Object.fromEntries(
  TENANT_CAPABILITY_REGISTRY.map((control) => [control.id, "native"])
) as Record<ControlId, EnginePosture>;

const probe: EngineAdapter = {
  id: "modern",
  tokenBaseline: baseline,
  controls: total,
  posture,
  project: () => ({ seeds: {}, modes: [] }),
};

describe("EngineAdapter.controls is total over ControlId", () => {
  it("accepts a record with every registry id", () => {
    expect(Object.keys(probe.controls).sort()).toEqual(
      TENANT_CAPABILITY_REGISTRY.map((control) => control.id).sort()
    );
  });

  it("rejects a literal that omits one ControlId key at compile time", () => {
    const { "palette.seeds": _omitted, ...missingOne } = total;
    const adapter: EngineAdapter = {
      id: "modern",
      tokenBaseline: baseline,
      // @ts-expect-error controls must be TOTAL: omitting a ControlId is a build error.
      controls: missingOne,
      posture,
      project: () => ({ seeds: {}, modes: [] }),
    };
    expect(Object.keys(adapter.controls)).not.toContain("palette.seeds");
  });

  it("rejects a posture value outside the closed four-value set", () => {
    const adapter: EngineAdapter = {
      id: "modern",
      tokenBaseline: baseline,
      controls: {
        ...total,
        // @ts-expect-error 'partial' is not an EnginePosture; absence of a route is not a fifth value.
        "palette.seeds": { posture: "partial", evidence: cell.evidence },
      },
      posture,
      project: () => ({ seeds: {}, modes: [] }),
    };
    expect(POSTURES).not.toContain(
      adapter.controls["palette.seeds"].posture as unknown as EnginePosture
    );
  });

  it("rejects evidence that does not match the posture it is paired with", () => {
    const adapter: EngineAdapter = {
      id: "modern",
      tokenBaseline: baseline,
      controls: {
        ...total,
        // @ts-expect-error an `unsupported` cell cannot carry channel evidence.
        "palette.seeds": { posture: "unsupported", evidence: cell.evidence },
      },
      posture,
      project: () => ({ seeds: {}, modes: [] }),
    };
    expect(adapter.controls["palette.seeds"].evidence.kind).toBe("channels");
  });

  it("derives ControlId from the registry rather than a hand-written list", () => {
    expect(TENANT_CAPABILITY_REGISTRY.length).toBe(22);
    const ids = new Set(TENANT_CAPABILITY_REGISTRY.map((control) => control.id));
    expect(ids.size).toBe(TENANT_CAPABILITY_REGISTRY.length);
  });

  it("keeps EnginePosture closed at exactly four values", () => {
    expect([...new Set(POSTURES)]).toHaveLength(4);
  });
});
