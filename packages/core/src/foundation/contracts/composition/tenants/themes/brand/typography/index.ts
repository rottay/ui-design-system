import type { SemanticTypographyTokens } from "../../../../../kernel/tokens";

export interface BrandTypography {
  /** Governed family preset shared by static and DB Theme transports. */
  typePairing?: "sober" | "editorial" | "geometric" | "technical";
  /** Bounded multiplier for the canonical type ramp. */
  scale?: number;
  fontFamilyBase?: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontFamilyDisplay?: string;
  headingWeightBias?: "lighter" | "normal" | "heavier";
  /**
   * Kit row 9: the weight posture the whole role vocabulary wears.
   *
   * A DECISION, and the reason `headingWeightBias` is not one: the bias only
   * ever reached `--ds-font-weight-heading` and `--ds-font-weight-display`, so
   * a theme that asked for heavier headings still drew every `--ds-type-<role>`
   * at the builder's own weight. This posture states the ladder AND the role
   * weights the surfaces actually bind, and it outranks the bias wherever both
   * are authored; the bias keeps its own two channels as the fallback.
   *
   * Absent -> the bias, then `regular`, which is the resting ladder.
   */
  roleWeights?: "light" | "regular" | "strong";
  /**
   * Kit row 10: the figure posture every role wears.
   *
   * Tabular figures align in a column and proportional ones read as prose;
   * which of the two a product wants is one statement about the whole type
   * vocabulary, not a per-role accident. Reaches
   * `--ds-type-<role>-font-variant-numeric` for all nine roles.
   *
   * Absent -> the DS resting posture (prose roles normal, code and numeric
   * tabular), which is byte-identical to today.
   */
  numeric?: "proportional" | "tabular";
  headingLetterSpacing?: string;
  labelStyle?: "uppercase" | "sentence" | "capitalize";
  /** Per-role type system consumed by components instead of ad-hoc triples. */
  roles?: SemanticTypographyTokens;
  /** Per-context letter spacing */
  letterSpacing?: {
    display?: string;
    heading?: string;
    body?: string;
    mono?: string;
  };
  /** Per-context line height */
  lineHeight?: {
    display?: number;
    heading?: number;
    body?: number;
    tight?: number;
    relaxed?: number;
  };
}
