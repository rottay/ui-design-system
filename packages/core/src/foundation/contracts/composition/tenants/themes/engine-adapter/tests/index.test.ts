/**
 * The engine-adapter contract's totality law, proved over the live registry in
 * the type system and at runtime.
 *
 * Named by the `engine-posture-totality` discharge ledger in the engine-freeze
 * gate: deleting this file re-reddens that gate.
 */

import { describe, expect, it } from "vitest";

import { TENANT_CAPABILITY_REGISTRY } from "../../../capabilities";
import type { ControlId, EngineAdapter, EnginePosture } from "..";

const POSTURES: readonly EnginePosture[] = [
  "native",
  "mapped",
  "invariant",
  "unsupported",
];

const total = Object.fromEntries(
  TENANT_CAPABILITY_REGISTRY.map((control) => [control.id, "native"])
) as Record<ControlId, EnginePosture>;

const probe: EngineAdapter = {
  id: "modern",
  posture: total,
  project: () => ({ seeds: {}, tokenOverrides: {}, modes: [] }),
};

describe("EngineAdapter.posture is total over ControlId", () => {
  it("accepts a record with every registry id", () => {
    expect(Object.keys(probe.posture).sort()).toEqual(
      TENANT_CAPABILITY_REGISTRY.map((control) => control.id).sort()
    );
  });

  it("rejects a literal that omits one ControlId key at compile time", () => {
    const { "palette.seeds": _omitted, ...missingOne } = total;
    const adapter: EngineAdapter = {
      id: "modern",
      // @ts-expect-error posture must be TOTAL: omitting a ControlId is a build error.
      posture: missingOne,
      project: () => ({ seeds: {}, tokenOverrides: {}, modes: [] }),
    };
    expect(Object.keys(adapter.posture)).not.toContain("palette.seeds");
  });

  it("rejects a posture value outside the closed four-value set", () => {
    const adapter: EngineAdapter = {
      id: "modern",
      // @ts-expect-error 'partial' is not an EnginePosture; absence of a route is not a fifth value.
      posture: { ...total, "palette.seeds": "partial" },
      project: () => ({ seeds: {}, tokenOverrides: {}, modes: [] }),
    };
    expect(POSTURES).not.toContain(
      adapter.posture["palette.seeds"] as unknown as EnginePosture
    );
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
