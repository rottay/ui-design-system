/**
 * Tier enforcement, measured at both tenant doors (rubric J.7).
 *
 * WHAT WAS DECORATIVE (F-03, restated by F-23). The catalog carried a `tier`,
 * the document carried a `plan`, and for a long time nothing compared them: a
 * `standard` tenant could activate a `pro` decision and see it painted. The
 * comparison now exists in one station, and this file is the executable proof
 * that it is REACHED -- from the persisted door and from the preview door, on
 * every `pro` row the catalog declares.
 *
 * WHY IT IS DRIVEN OFF THE CATALOG. A hand-written list of pro rows is a second
 * listing with its own staleness class; the whole point of the typed catalog is
 * that there is one. So the cases are generated from `THEME_CONTROL_CATALOG`,
 * and `EXERCISED` must account for EVERY pro row: adding a pro control fails
 * this file until its rejection is proven or its absence is written down with a
 * reason. That is the coverage half, and it is the half a hand-written suite
 * always loses first.
 *
 * THE STATIC DOOR IS NOT A THIRD CASE, and saying why is part of the proof.
 * `staticThemeIntent` is the vertical's own code-owned baseline. It carries no
 * entitlement because a vertical is not a tenant on a plan, and D-02 forbids
 * defaulting one -- "a defaulted plan is an entitlement nobody granted". The
 * assertion below is therefore that the static door carries NO entitlement,
 * not that it refuses something.
 *
 * SCOPE: ONE VERTICAL. Every case runs on `bithire` (`VERTICAL` below). A
 * catalog tier is not per vertical, so one vertical exercises the rule for
 * every row -- but this file measures bithire, and a refusal that only another
 * vertical's envelope or default mode would produce is outside it. Read the
 * result as "the station is reached", not as a fleet claim.
 */
import { describe, expect, it } from "vitest";

import {
  THEME_CONTROL_CATALOG,
  type ThemeControlRow,
} from "@/contracts/theme/runtime/catalog";
import { THEME_PLAN_TIERS } from "@/contracts/theme/foundation/decisions";
import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";
import { compileThemeIntent } from "@/infrastructure/compilers/runtime/theme";
import {
  documentThemeIntent,
  previewThemeIntent,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme/runtime/ingress";

const VERTICAL = "bithire" as const;
const SLUG = "tier-rejection-probe";

/**
 * One authorable value per `pro` row, and a written reason for every row that
 * has none.
 *
 * A value is NOT derived from the domain automatically. `palette.dark-mode`
 * expands into a whole second ramp and `profiles.expressive` is a seven-key
 * record; a generated "first enum value" would author something the row does
 * not mean and would then measure the compiler's opinion of that instead of the
 * tier station. Each value here is the row's own vocabulary, read off the
 * catalog domain by hand once.
 */
const EXERCISED: Readonly<Record<string, { value: unknown } | { skip: string }>> = {
  "palette.contrast-posture": { value: "high" },
  "palette.dark-mode": { value: "dark" },
  "typography.numeric": { value: "tabular" },
  "shape.nesting": { value: "uniform" },
  "motion.character": { value: "playful" },
  "responsive.posture": { value: "compact" },
  "typography.families": {
    skip:
      "the domain is the registered font-pack registry, and authoring a pack is a font-loading concern with its " +
      "own admission; the tier station is proven by the six rows above, which reach it through the same ledger entry",
  },
  "recipe-profile": {
    skip:
      "the domain is the registered recipe-profile registry; the row is authored at visualFoundation.recipeProfile " +
      "rather than under decisions, so it does not exercise the decision ledger this station judges",
  },
  "profiles.expressive": {
    skip:
      "a seven-key record whose keys carry their own closed vocabularies; authoring one key here would measure the " +
      "profile composition rather than the tier comparison",
  },
  "chrome.anatomy": {
    skip:
      "effect is root-attributes, not css-channels: it travels as a normalized root attribute and never reaches a " +
      "compiled channel, so a rejection proof here would be about a different transport",
  },
};

const proRows: readonly ThemeControlRow[] = THEME_CONTROL_CATALOG.filter(
  (row) => row.tier === "pro"
);

const v2 = (
  plan: TenantThemeDocumentV2["plan"],
  decisions: Record<string, unknown>
): TenantThemeDocumentV2 =>
  ({ version: 2, plan, decisions }) as TenantThemeDocumentV2;

const compileThrough = (
  door: "document" | "preview",
  document: TenantThemeDocumentV2
): void => {
  const intent =
    door === "document"
      ? documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document })
      : previewThemeIntent({ vertical: VERTICAL, slug: SLUG, document });
  compileThemeIntent(intent);
};

describe("tier rejection — the catalog's tier is compared against the document's plan", () => {
  it("every pro row of the catalog is exercised or has a written reason", () => {
    const accounted = Object.keys(EXERCISED);
    const missing = proRows.map((row) => row.id).filter((id) => !accounted.includes(id));
    expect(missing, "a new pro control must prove its own rejection").toEqual([]);
    const stale = accounted.filter((id) => !proRows.some((row) => row.id === id));
    expect(stale, "EXERCISED names a row the catalog no longer tiers as pro").toEqual([]);
  });

  it("the plan table still entitles standard to standard only", () => {
    expect([...THEME_PLAN_TIERS.standard]).toEqual(["standard"]);
    expect([...THEME_PLAN_TIERS.pro]).toEqual(["standard", "pro"]);
  });

  for (const row of proRows) {
    const entry = EXERCISED[row.id];
    if (!entry || "skip" in entry) continue;

    describe(row.id, () => {
      const authored = { [row.id]: entry.value };

      for (const door of ["document", "preview"] as const) {
        it(`the ${door} door REFUSES it by name under the standard plan`, () => {
          expect(() => compileThrough(door, v2("standard", authored))).toThrowError(
            new RegExp(row.id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u")
          );
        });

        it(`the ${door} door ADMITS it under the pro plan`, () => {
          expect(() => compileThrough(door, v2("pro", authored))).not.toThrow();
        });
      }
    });
  }

  /**
   * The negative control. Without it, a station that refused EVERY authored
   * decision would pass every assertion above and would have proven nothing
   * about tiers.
   */
  it("a STANDARD decision under the standard plan is admitted, so the refusal is about the tier", () => {
    expect(() =>
      compileThrough("document", v2("standard", { "shape.button-style": "pill" }))
    ).not.toThrow();
    expect(() =>
      compileThrough("preview", v2("standard", { "shape.button-style": "pill" }))
    ).not.toThrow();
  });

  it("the static door carries no entitlement, and no patch either", () => {
    const intent = staticThemeIntent(VERTICAL, VERTICAL);
    expect(intent.entitlement).toBeUndefined();
    expect(intent.origin).toBe("static-vertical");
    // The roster Theme is already total, so the vertical's own compile overlays
    // nothing. There is no tenant selection here to hold to a tier.
    expect(intent.patch).toEqual({});
  });
});
