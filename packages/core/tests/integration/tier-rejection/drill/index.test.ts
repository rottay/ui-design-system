/**
 * The planted mutant for `tests/integration/tier-rejection`.
 *
 * An assertion that a compile THROWS is only evidence when the throw comes from
 * the station under test. A fixture that was malformed for some unrelated
 * reason throws too, and a suite full of those reads exactly like a suite full
 * of enforced tiers -- which is the shape F-23 found across this tree.
 *
 * WHAT IS MUTATED, AND WHY IT IS THE TABLE. Running this drill established
 * something the sibling suite could not: the refusal fires at TWO stations, not
 * one. `assertTenantThemeDocumentV2` refuses the document before an intent
 * exists, and `tierIssues` refuses the intent at compile admission. Neutralising
 * either one alone leaves the other holding the line -- which is a good
 * property and a bad mutant, because the compile still throws and the drill
 * proves nothing.
 *
 * Both stations read one table: `THEME_PLAN_TIERS`. Mutating it to entitle
 * `pro` under the `standard` plan is therefore the single change that removes
 * the comparison itself, and it is exactly the pre-WO-CAT-03 behaviour F-03
 * described -- "the catalog carried a tier, the document carried a plan, and
 * nothing compared them". Under it the refused document must COMPILE. If it
 * still threw, the sibling suite's refusal was never about the tier.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TenantThemeDocumentV2 } from "@/contracts/theme/presentation/document";

const VERTICAL = "bithire" as const;
const SLUG = "tier-rejection-drill";
const PRO_DECISION = { "shape.nesting": "uniform" };

const v2 = (plan: TenantThemeDocumentV2["plan"]): TenantThemeDocumentV2 =>
  ({ version: 2, plan, decisions: PRO_DECISION }) as TenantThemeDocumentV2;

const TIER_TABLE = "@/contracts/theme/foundation/decisions";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock(TIER_TABLE);
});

async function compileWithStandardPlan(): Promise<void> {
  const { compileThemeIntent } = await import(
    "@/infrastructure/compilers/runtime/theme"
  );
  const { documentThemeIntent } = await import(
    "@/infrastructure/compilers/runtime/theme/runtime/ingress"
  );
  compileThemeIntent(
    documentThemeIntent({ vertical: VERTICAL, slug: SLUG, document: v2("standard") })
  );
}

describe("tier-rejection DRILL — the refusal is the station, not the fixture", () => {
  it("CONTROL: the unmutated tree refuses the pro decision under the standard plan", async () => {
    vi.resetModules();
    await expect(compileWithStandardPlan()).rejects.toThrowError(/shape\.nesting/u);
  });

  it("MUTANT: with the plan/tier comparison removed, the same document compiles", async () => {
    vi.resetModules();
    vi.doMock(TIER_TABLE, async (importOriginal) => {
      const original = await importOriginal<typeof import("@/contracts/theme/foundation/decisions")>();
      return {
        ...original,
        THEME_PLAN_TIERS: Object.freeze({
          ...original.THEME_PLAN_TIERS,
          standard: Object.freeze(["standard", "pro"] as const),
        }),
      };
    });

    await expect(compileWithStandardPlan()).resolves.toBeUndefined();
  });

  it("the mutation is the ONLY difference: restoring the table restores the refusal", async () => {
    vi.resetModules();
    vi.doUnmock(TIER_TABLE);
    await expect(compileWithStandardPlan()).rejects.toThrowError(/shape\.nesting/u);
  });
});
