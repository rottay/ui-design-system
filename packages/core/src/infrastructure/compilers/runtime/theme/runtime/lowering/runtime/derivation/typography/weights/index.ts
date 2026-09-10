/**
 * @fileoverview Typography sub-owner: the closed weight vocabulary, the role
 * weight posture that states it, and the legacy heading bias it falls back to.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/weights
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  SemanticTypographyRole,
  SemanticTypographyTokens,
} from "@/foundation/contracts/kernel/tokens/typography";

/** The four steps every family binds; 620-860 and the 100/200 band stay out. */
const WEIGHT_STEPS: Readonly<Record<string, string>> = {
  "--ds-font-weight-normal": "400",
  "--ds-font-weight-regular": "var(--ds-font-weight-normal)",
  "--ds-font-weight-medium": "500",
  "--ds-font-weight-semibold": "600",
  "--ds-font-weight-bold": "700",
  "--ds-font-weight-body": "var(--ds-font-weight-normal)",
};

/** The two ladder channels a posture states, per step of the closed domain. */
interface WeightLadder {
  readonly heading: string;
  readonly display: string;
}

/**
 * Kit row 9, as three statements about the WHOLE role vocabulary.
 *
 * `regular` is the identity: its ladder and its role weights are the resting
 * values, so a document that authors it is byte-identical to one that does not.
 * That is deliberate -- a posture that had to differ from the default to be
 * expressible would make the resting ladder inexpressible.
 *
 * The four TEXT roles (body, supporting, caption, code) are absent from every
 * step. Body weight is a legibility floor, not a posture: a skin that drew its
 * paragraphs at 500 because the tenant asked for strong headings would be
 * trading reading comfort for emphasis the heading roles already carry.
 */
const ROLE_WEIGHT_POSTURE: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["typography"]>["roleWeights"]>,
    {
      readonly ladder: WeightLadder;
      readonly roles: Readonly<Partial<Record<SemanticTypographyRole, number>>>;
    }
  >
> = {
  light: {
    ladder: { heading: "500", display: "600" },
    roles: {
      display: 600,
      pageTitle: 600,
      sectionTitle: 500,
      label: 500,
      numeric: 500,
    },
  },
  regular: {
    ladder: { heading: "600", display: "700" },
    roles: {
      display: 700,
      pageTitle: 700,
      sectionTitle: 600,
      label: 600,
      numeric: 600,
    },
  },
  strong: {
    ladder: { heading: "700", display: "800" },
    roles: {
      display: 800,
      pageTitle: 800,
      sectionTitle: 700,
      label: 700,
      numeric: 700,
    },
  },
};

type RoleWeights = keyof typeof ROLE_WEIGHT_POSTURE;

/**
 * The legacy bias, and the exact two channels it has ever reached.
 *
 * It is kept as a TABLE of its own rather than mapped onto the posture above,
 * because the two are not the same statement: the bias moves the ladder and
 * nothing else, while the decision moves the ladder AND the semantic role
 * weights. Routing `headingWeightBias: heavier` through the posture table
 * would silently re-weight `--ds-type-display-font-weight` on the two shipped
 * verticals that author it, which is a repaint no kit row asked for.
 */
const HEADING_BIAS: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["typography"]>["headingWeightBias"]>,
    WeightLadder
  >
> = {
  lighter: { heading: "500", display: "600" },
  normal: { heading: "600", display: "700" },
  heavier: { heading: "700", display: "800" },
};

type HeadingBias = keyof typeof HEADING_BIAS;

/**
 * FAILING CLOSED IS THE LADDER, not an extra, and it is the same law the
 * `axes` and `states` families already state. A `BrandTheme` is typed, but it
 * is plain data by the time it reaches this compiler: it crosses the RSC/JSON
 * boundary and arrives through the compatibility `TenantConfig.brandTheme`
 * field, where no type survives. A bare bracket read of a closed table
 * therefore resolves INHERITED members and unknown words alike -- the first
 * paints the literal string `undefined` on both role weights, the second
 * throws and takes the whole compile down. An own-property guard is what makes
 * the two ingress paths land on the same resting ladder.
 */
function readClosed<T extends string>(
  table: Readonly<Record<string, unknown>>,
  authored: unknown
): T | undefined {
  return typeof authored === "string" &&
    Object.prototype.hasOwnProperty.call(table, authored)
    ? (authored as T)
    : undefined;
}

/** The posture the theme DECIDED, or `undefined` when it decided none. */
function readRoleWeights(bt: BrandTheme): RoleWeights | undefined {
  return readClosed<RoleWeights>(
    ROLE_WEIGHT_POSTURE,
    bt.typography?.roleWeights
  );
}

function readHeadingBias(bt: BrandTheme): HeadingBias {
  return (
    readClosed<HeadingBias>(HEADING_BIAS, bt.typography?.headingWeightBias) ??
    "normal"
  );
}

/**
 * The weight ladder, and the decision that moves it.
 *
 * PRECEDENCE. `typography.roleWeights` is the kit's decision and wins wherever
 * it is authored; `typography.headingWeightBias` is the pre-kit field and
 * remains the fallback, with the resting `normal` ladder under both. The bias
 * had no channel at all before DER-04 -- it reached personality objects and
 * stopped there -- and the decision had no keypath, so a tenant could state a
 * weight posture that moved nothing at all.
 */
export function deriveTypeWeightChannels(
  bt: BrandTheme
): Record<string, string> {
  const vars: Record<string, string> = { ...WEIGHT_STEPS };
  const decided = readRoleWeights(bt);
  const ladder =
    decided === undefined
      ? HEADING_BIAS[readHeadingBias(bt)]
      : ROLE_WEIGHT_POSTURE[decided].ladder;
  vars["--ds-font-weight-heading"] = ladder.heading;
  vars["--ds-font-weight-display"] = ladder.display;
  return vars;
}

/**
 * The per-role weights the DECISION states, for the role merge to fold in.
 *
 * This is what makes row 9 reach the vocabulary a component actually binds:
 * `--ds-type-display-font-weight` is written by the single role emitter, not by
 * the ladder above, so a posture that only moved `--ds-font-weight-display`
 * left every semantic surface at the builder's own 700. Returned as authored
 * role tokens so the emitter's own precedence applies unchanged: this posture
 * outranks an expressive profile overlay, and the finer
 * `typography.roles.<role>.fontWeight` outranks this posture.
 *
 * Empty when no decision is authored. The legacy bias deliberately does NOT
 * produce a map here -- see `HEADING_BIAS`.
 */
export function roleWeightOverlay(bt: BrandTheme): SemanticTypographyTokens {
  const decided = readRoleWeights(bt);
  if (decided === undefined) return {};
  const overlay: Record<string, { fontWeight: number }> = {};
  for (const [role, fontWeight] of Object.entries(
    ROLE_WEIGHT_POSTURE[decided].roles
  )) {
    overlay[role] = { fontWeight };
  }
  return overlay as SemanticTypographyTokens;
}
