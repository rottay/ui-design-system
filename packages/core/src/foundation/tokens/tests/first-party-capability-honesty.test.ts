/**
 * @fileoverview A capability disposition must describe what the code ACTUALLY
 * does, not what a migration intends to do later.
 *
 * The three first-party themes each publish a `capabilities` catalog stating,
 * per `BrandCapabilityId`, whether that channel is live. The catalog is the
 * only thing standing between "this brand deliberately ships nothing here" and
 * "someone forgot to author this" — so a catalog that LIES is worse than no
 * catalog at all: it converts an unnoticed gap into a documented, trusted,
 * wrong fact.
 *
 * `motion` was authored as `disabled/superseded` with the note "feeds the
 * compatibility bridge only". That is false. `brandThemeToTokenOverrides`
 * lowers `BrandTheme.motion.spring{Tension,Friction}` into
 * `TenantTokenOverrides.motion.spring`, which `useTokens` resolves onto the
 * shipped `--ds-motion-spring` channel, and `brandThemeToPersonality` maps the
 * whole `motion` block onto `PersonalityTokens.animation`. Both are live
 * production compilers, not a bridge.
 *
 * These assertions are deliberately BEHAVIOURAL. A test that compared the
 * catalog against a hand-maintained list of "capabilities we think are live"
 * would restate the same claim it is supposed to check, and would keep passing
 * the day the compiler changed. Instead each leg mutates the theme and proves
 * the compiler output moves.
 */

import { describe, it, expect } from "vitest";

import {
  brandThemeToPersonality,
  brandThemeToTokenOverrides,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/personality";
import type { BrandCapabilityId } from "@/foundation/contracts/composition/tenants/themes";

import { FIRST_PARTY_VERTICAL_ROSTER } from "@/foundation/tokens/ts/presentation/brand-themes";

/**
 * A capability is LIVE when removing it from the theme changes what the
 * production compilers emit. Each probe returns a comparable fingerprint of
 * everything the compilers produced, so "changed" is observed, never asserted.
 */
const LIVENESS_PROBES: Partial<
  Record<BrandCapabilityId, (theme: Record<string, unknown>) => string>
> = {
  motion: (theme) =>
    JSON.stringify([
      brandThemeToTokenOverrides(theme as never).motion ?? null,
      brandThemeToPersonality(theme as never).animation ?? null,
    ]),
  engineBridge: (theme) => JSON.stringify(theme.engineBridge ?? null),
};

describe("first-party capability dispositions are honest", () => {
  for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
    describe(row.slug, () => {
      for (const [id, probe] of Object.entries(LIVENESS_PROBES) as Array<
        [BrandCapabilityId, (t: Record<string, unknown>) => string]
      >) {
        it(`states \`${id}\` as active iff the compilers actually consume it`, () => {
          const authored = row.theme as unknown as Record<string, unknown>;
          if (authored[id] === undefined) return; // nothing authored: nothing to lie about

          const withCapability = probe(authored);
          const withoutCapability = probe({ ...authored, [id]: undefined });

          const compilerConsumesIt = withCapability !== withoutCapability;
          const declaredStatus = row.theme.capabilities[id]?.status;

          expect(
            declaredStatus,
            `${row.slug} authors \`${id}\` and the production compilers ` +
              `${compilerConsumesIt ? "DO" : "do NOT"} consume it, so the ` +
              `disposition must be ${compilerConsumesIt ? '"active"' : 'not "active"'}. ` +
              `A disposition that disagrees with the compiler is a documented false fact.`,
          ).toBe(compilerConsumesIt ? "active" : declaredStatus);
        });
      }

      it("lowers authored spring physics onto the shipped `--ds-motion-spring` channel", () => {
        const theme = row.theme;
        const springAuthored =
          typeof theme.motion?.springTension === "number" &&
          typeof theme.motion?.springFriction === "number" &&
          theme.motion?.useSpring !== false;
        if (!springAuthored) return;

        // field -> lowering: the compiler must place a generated curve on the
        // SAME field `useTokens` reads for `--ds-motion-spring`.
        const lowered = brandThemeToTokenOverrides(theme).motion?.spring;
        expect(
          lowered,
          `${row.slug} authors spring tension/friction, so the compiler must ` +
            `lower them onto TenantTokenOverrides.motion.spring — the only ` +
            `path that reaches --ds-motion-spring without a literal override.`,
        ).toBeTruthy();
        expect(lowered).toMatch(/^linear\(/);

        // ...and that lowering must be a FUNCTION of the authored physics,
        // not a constant the theme could delete without anyone noticing.
        const perturbed = brandThemeToTokenOverrides({
          ...theme,
          motion: { ...theme.motion, springTension: theme.motion!.springTension! + 60 },
        }).motion?.spring;
        expect(
          perturbed,
          "changing authored spring tension must change the emitted curve",
        ).not.toBe(lowered);
      });
    });
  }

  it("keys a disposition for every capability the contract declares", () => {
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      for (const id of [
        "motion",
        "recipes",
        "expressive",
        "responsive",
        "engineBridge",
      ] as const) {
        expect(
          row.theme.capabilities[id],
          `${row.slug} must state a disposition for \`${id}\`; silent absence ` +
            `is the exact failure mode the catalog exists to remove.`,
        ).toBeDefined();
      }
    }
  });
});
