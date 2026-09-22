/**
 * @fileoverview The envelope clearance a published style must prove: every
 * ranged dial it authors lies inside EVERY declared vertical's range, and a
 * non-default anatomy family is admitted only where the vertical opens it.
 *
 * THE ENVELOPES ARE INJECTED, not imported. `contracts/theme/runtime/envelopes`
 * is this owner's unranked peer, so a production edge to it is structural debt;
 * the clearance is a pure comparison over whatever envelope set the caller
 * hands in. That is also what makes the request-time station possible: a caller
 * that publishes under a NARROWED envelope hands that one in instead, and the
 * same comparison answers both questions.
 *
 * NOTHING IS CLAMPED. A registered style is authored content, written once by a
 * reviewed DS change and inherited by many tenants, so it sits on the refuse
 * side of the line the repo already draws between "the tenant asked for
 * something this vertical forbids" and "this vertical narrows a default". A
 * clamped style leaf would carry a ledger entry saying the style owns it while
 * the effective value is neither the style's nor anyone's.
 *
 * @module Contracts/Theme/Styles/Clearance
 * @category Types
 * @package @rottay/design-system
 */

import type { ThemeDecisionId } from "@/contracts/theme/foundation/decisions";
import type { ThemeStyleDocument } from "@/contracts/theme/runtime/styles/foundation/document";

/** One ranged dial, the decision that authors it and where its bound lives. */
interface RangedDial {
  readonly dial: string;
  readonly decision: ThemeDecisionId;
  /** The member inside a `record` decision, or `null` for a scalar row. */
  readonly member: string | null;
  readonly range: "motionIntensity" | "motionDurationScale" | "typeScale" | "radiusScale" | "effectIntensity";
}

/**
 * The five dials an envelope range governs, mapped onto the decisions that
 * author them. The pairing is the publish terminal's own `DECISION_BY_DIAL`,
 * restated here only because that owner sits under `infrastructure/**` and a
 * contract that imported a compiler would be a compiler input. The owner's
 * suite asserts the two agree.
 */
export const THEME_STYLE_RANGED_DIALS: readonly RangedDial[] = Object.freeze([
  { dial: "motion.intensity", decision: "motion.dial", member: "intensity", range: "motionIntensity" },
  { dial: "motion.durationScale", decision: "motion.dial", member: "durationScale", range: "motionDurationScale" },
  { dial: "typography.scale", decision: "typography.scale", member: null, range: "typeScale" },
  { dial: "shape.radiusScale", decision: "shape.radius-scale", member: null, range: "radiusScale" },
  { dial: "surfaces.effectIntensity", decision: "surfaces.effect-intensity", member: null, range: "effectIntensity" },
] as const);

/** What a vertical lets a style reach, as much of it as this comparison reads. */
export interface ThemeStyleEnvelope {
  readonly verticalKey: string;
  readonly ranges?: Readonly<
    Partial<Record<RangedDial["range"], { readonly min: number; readonly max: number }>>
  >;
  readonly allowAnatomyVariants?: boolean;
}

/** One refusal, naming the dial or row AND the vertical that refuses it. */
export interface ThemeStyleClearanceIssue {
  readonly decision: ThemeDecisionId;
  /** The dial or the anatomy family, in the spelling the envelope reads it in. */
  readonly dial: string;
  readonly verticalKey: string;
  readonly value: unknown;
  readonly message: string;
}

function dialValue(
  decisions: Partial<Record<string, unknown>>,
  entry: RangedDial
): unknown {
  const authored = decisions[entry.decision];
  if (authored === undefined) return undefined;
  if (entry.member === null) return authored;
  if (authored === null || typeof authored !== "object") return undefined;
  return (authored as Record<string, unknown>)[entry.member];
}

/**
 * Every clearance a style FAILS against the envelopes handed in, in dial order.
 *
 * An empty list is the only admission. The comparison is total and static --
 * both operands are frozen data -- so it is re-evaluated on every run rather
 * than recorded once and trusted.
 */
export function themeStyleClearanceIssues(input: {
  readonly styleId: string;
  readonly document: ThemeStyleDocument;
  readonly envelopes: readonly ThemeStyleEnvelope[];
}): readonly ThemeStyleClearanceIssue[] {
  const issues: ThemeStyleClearanceIssue[] = [];
  const decisions = input.document.decisions as Partial<Record<string, unknown>>;
  for (const entry of THEME_STYLE_RANGED_DIALS) {
    const value = dialValue(decisions, entry);
    if (typeof value !== "number") continue;
    for (const envelope of input.envelopes) {
      const range = envelope.ranges?.[entry.range];
      if (!range) continue;
      if (value >= range.min && value <= range.max) continue;
      issues.push({
        decision: entry.decision,
        dial: entry.dial,
        verticalKey: envelope.verticalKey,
        value,
        message:
          `style ${JSON.stringify(input.styleId)} sets ${entry.dial} ${value}, outside the ` +
          `${envelope.verticalKey} envelope [${range.min}, ${range.max}]; narrow the dial or ` +
          "exclude the vertical with a written D-28 reason",
      });
    }
  }
  issues.push(...anatomyIssues(input.styleId, decisions, input.envelopes));
  return issues;
}

/**
 * A non-`"default"` anatomy family needs the vertical to opt in.
 *
 * Vacuous on HEAD's three envelopes, which all open it, and written anyway: the
 * check is static and total, so a vertical that later closes it reddens the
 * style registry immediately instead of shipping an anatomy that vertical
 * forbids. The catalog states the dependency in its own words -- the row's
 * default behaviour "fails closed unless the vertical envelope opts in".
 */
function anatomyIssues(
  styleId: string,
  decisions: Partial<Record<string, unknown>>,
  envelopes: readonly ThemeStyleEnvelope[]
): readonly ThemeStyleClearanceIssue[] {
  const anatomy = decisions["chrome.anatomy"];
  if (anatomy === null || typeof anatomy !== "object") return [];
  const variants = Object.entries(anatomy as Record<string, unknown>).filter(
    ([, value]) => value !== undefined && value !== "default"
  );
  if (variants.length === 0) return [];
  const issues: ThemeStyleClearanceIssue[] = [];
  for (const envelope of envelopes) {
    if (envelope.allowAnatomyVariants !== false) continue;
    for (const [family, value] of variants) {
      issues.push({
        decision: "chrome.anatomy",
        dial: `chrome.anatomy.${family}`,
        verticalKey: envelope.verticalKey,
        value,
        message:
          `style ${JSON.stringify(styleId)} sets chrome.anatomy.${family} ${JSON.stringify(value)}, ` +
          `but the ${envelope.verticalKey} envelope sets allowAnatomyVariants false`,
      });
    }
  }
  return issues;
}
