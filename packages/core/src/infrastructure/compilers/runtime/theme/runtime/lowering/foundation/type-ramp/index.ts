/**
 * @fileoverview The named type ramp and its channel writer.
 *
 * @module Compilers/Theme/Lowering/Foundation/type-ramp
 * @category Compilers
 * @package @rottay/design-system
 */

/**
 * The closed composite type ramp (design-language §2.1): five sizes, three
 * weights, one editorial uppercase variant. Each entry's size aligns to a step
 * of the DS scalar font ramp (0.75rem=xs, 0.875rem=sm, 1rem, 1.25rem, 2rem) but
 * pairs it with a fixed rem line-height and tracking so a consumer binds one
 * named ramp entry instead of hand-picking a size/weight/tracking triple. The
 * weight set is 400/600/700 only; 500 and the 620–860 band are banned.
 */
const TYPE_RAMP = [
  {
    name: "detail",
    size: "0.75rem",
    lineHeight: "1rem",
    weight: 400,
    tracking: "0",
  },
  {
    name: "body",
    size: "0.875rem",
    lineHeight: "1.25rem",
    weight: 400,
    tracking: "0",
  },
  {
    name: "emphasis",
    size: "1rem",
    lineHeight: "1.5rem",
    weight: 600,
    tracking: "0",
  },
  {
    name: "title",
    size: "1.25rem",
    lineHeight: "1.75rem",
    weight: 600,
    tracking: "-0.01em",
  },
  {
    name: "display",
    size: "2rem",
    lineHeight: "2.25rem",
    weight: 700,
    tracking: "-0.02em",
  },
] as const;

/**
 * Emit the composite type ramp --ds-text-{detail,body,emphasis,title,display}
 * plus the --ds-text-eyebrow variant (design-language §2.1).
 *
 * Each ramp entry is emitted as a bare `font`-shorthand token (`--ds-text-<name>`
 * = `<weight> <size>/<line-height> <family>`, the headline composite the §2.1
 * table names) AND as the four addressable facets
 * `--ds-text-<name>-{size,weight,line-height,letter-spacing}` (tracking cannot
 * ride the `font` shorthand, so it is a separate facet; the facet names match the
 * existing foundation composite-text convention in
 * foundation/tokens/css/foundation/base/typography/index.css). The eyebrow reuses the detail size
 * at weight 600 with +0.08em tracking and is the sole uppercase in the product
 * (S1) — it carries a `-transform: uppercase` facet; every other ramp entry is
 * sentence case. The ramp is a fixed, tenant-independent closed set, so it is
 * emitted for every compiled BrandTheme.
 */
export function setTypeRampVariables(vars: Record<string, string>): void {
  const family = "var(--ds-font-family-base)";

  for (const { name, size, lineHeight, weight, tracking } of TYPE_RAMP) {
    vars[`--ds-text-${name}`] = `${weight} ${size}/${lineHeight} ${family}`;
    vars[`--ds-text-${name}-size`] = size;
    vars[`--ds-text-${name}-weight`] = String(weight);
    vars[`--ds-text-${name}-line-height`] = lineHeight;
    vars[`--ds-text-${name}-letter-spacing`] = tracking;
  }

  // Eyebrow — detail size, weight 600, +0.08em tracking, uppercase (the sole
  // uppercase per BITHIRE_PROFILE.labelStyle: 'sentence').
  vars["--ds-text-eyebrow"] = `600 0.75rem/1rem ${family}`;
  vars["--ds-text-eyebrow-size"] = "0.75rem";
  vars["--ds-text-eyebrow-weight"] = "600";
  vars["--ds-text-eyebrow-line-height"] = "1rem";
  vars["--ds-text-eyebrow-letter-spacing"] = "0.08em";
  vars["--ds-text-eyebrow-transform"] = "uppercase";
}
