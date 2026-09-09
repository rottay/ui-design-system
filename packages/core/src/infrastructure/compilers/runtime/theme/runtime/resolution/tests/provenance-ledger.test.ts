/**
 * The ledger is part of the intent CONTRACT, not only of its types: the
 * resolver admits it by name, refuses a malformed one, and carries it into the
 * resolution instead of dropping it.
 */

import { describe, expect, it } from "vitest";

import {
  resolveDecisionProvenanceLedger,
  type DecisionProvenanceClaim,
  type DecisionProvenanceLedger,
} from "@/contracts/theme/foundation/provenance";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeLayerPatch } from "@/foundation/contracts/composition/tenants/themes/iso";
import { EMPTY_PROVENANCE } from "@/foundation/contracts/composition/tenants/themes/resolved";

import { resolveTheme } from "..";

const patch = {
  typography: { typePairing: "geometric" },
} as unknown as ThemeLayerPatch;

const pairingClaim: DecisionProvenanceClaim = {
  ref: { kind: "decision", id: "typography.pairing" },
  provenance: "direct-override",
  authoredValue: "geometric",
  leaves: [
    { leaf: "typography.typePairing", specificity: "named" },
    { leaf: "typography.fontFamilyBase", specificity: "expansion-derived" },
  ],
};

const ledger = resolveDecisionProvenanceLedger([pairingClaim]);

const tenantIntent = (
  overrides: Partial<ThemeIntent> = {}
): ThemeIntent => ({
  vertical: "bithire",
  slug: "acme",
  origin: "tenant-document",
  patch,
  entitlement: { plan: "standard" },
  ...overrides,
});

describe("the intent envelope admits the ledger by name", () => {
  it("accepts an intent that carries one", () => {
    expect(() => resolveTheme(tenantIntent({ ledger }))).not.toThrow();
  });

  it("still accepts an intent that carries none", () => {
    expect(() => resolveTheme(tenantIntent())).not.toThrow();
  });

  it("still refuses a key the envelope never declared", () => {
    expect(() =>
      resolveTheme(tenantIntent({ provenance: ledger } as never))
    ).toThrow(/unknown intent key\(s\) "provenance"/u);
  });
});

describe("a malformed ledger is refused, never dropped", () => {
  it("refuses a non-object", () => {
    expect(() =>
      resolveTheme(tenantIntent({ ledger: [] as never }))
    ).toThrow(/resolveTheme: intent\.ledger: must be an object/u);
  });

  it("refuses an unknown decision id", () => {
    expect(() =>
      resolveTheme(
        tenantIntent({
          ledger: {
            entries: [
              {
                ref: { kind: "decision", id: "typography.invented" },
                provenance: "direct-override",
                tier: "standard",
                authoredValue: "geometric",
                effectiveLeaves: [],
              },
            ],
          } as unknown as DecisionProvenanceLedger,
        })
      )
    ).toThrow(/intent\.ledger\.entries\[0\]: unknown decision id/u);
  });

  it("refuses a forged tier", () => {
    expect(() =>
      resolveTheme(
        tenantIntent({
          ledger: {
            entries: [
              {
                ref: { kind: "decision", id: "typography.families" },
                provenance: "direct-override",
                tier: "standard",
                authoredValue: { base: "inter" },
                effectiveLeaves: ["typography.fontFamilyBase"],
              },
            ],
          } as unknown as DecisionProvenanceLedger,
        })
      )
    ).toThrow(/is not the catalog tier "pro"/u);
  });

  it("refuses tenant authorship recorded on the vertical's own baseline", () => {
    expect(() =>
      resolveTheme({
        vertical: "bithire",
        slug: "bithire",
        origin: "static-vertical",
        patch: {},
        ledger,
      })
    ).toThrow(/static-vertical intent carries no provenance entries/u);
  });
});

describe("the resolution snapshots what the intent carried", () => {
  it("carries the entries through to the provenance", () => {
    const resolution = resolveTheme(tenantIntent({ ledger }));
    expect(resolution.provenance.ledger?.entries).toHaveLength(1);
    const [entry] = resolution.provenance.ledger!.entries;
    expect(entry.ref).toEqual({ kind: "decision", id: "typography.pairing" });
    expect(entry.tier).toBe("standard");
    expect(entry.effectiveLeaves).toEqual([
      "typography.typePairing",
      "typography.fontFamilyBase",
    ]);
  });

  it("reports no ledger, rather than an invented empty one, when none was carried", () => {
    const resolution = resolveTheme(tenantIntent());
    expect(resolution.provenance.tenantAuthored).toBe(true);
    expect(resolution.provenance.ledger).toBeUndefined();
  });

  it("gives a static-vertical resolution no ledger at all", () => {
    const resolution = resolveTheme({
      vertical: "bithire",
      slug: "bithire",
      origin: "static-vertical",
      patch: {},
    });
    expect(resolution.provenance).toBe(EMPTY_PROVENANCE);
    expect(resolution.provenance.ledger).toBeUndefined();
  });

  it("is not reachable through the caller's ledger after resolution", () => {
    const mutable: DecisionProvenanceLedger = {
      entries: [
        {
          ref: { kind: "decision", id: "typography.pairing" },
          provenance: "direct-override",
          tier: "standard",
          authoredValue: "geometric",
          effectiveLeaves: ["typography.typePairing"],
        },
      ],
    };
    const resolution = resolveTheme(tenantIntent({ ledger: mutable }));
    (mutable.entries as unknown[]).length = 0;
    expect(resolution.provenance.ledger?.entries).toHaveLength(1);
    expect(Object.isFrozen(resolution.provenance.ledger)).toBe(true);
  });
});
