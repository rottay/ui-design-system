/**
 * @fileoverview Typography pairing presets (W4-B2) — the highest-leverage
 * white-label typography dial.
 *
 * `TYPE_PAIRINGS` is the compiler-owned map the tenant-theme APPEARANCE compiler
 * applies for `general.typography.typePairing`. It is applied BEFORE any
 * free-form `fontFamilyBase`/`fontFamilyHeading` so an explicit family still
 * wins (additive, non-breaking). Each preset emits `--ds-font-family-heading` /
 * `--ds-font-family-base` (and `--ds-font-family-mono` where the preset tunes
 * it) plus the `--ds-letter-spacing-heading` / `--ds-line-height-display` dials
 * that already exist in the override token set — which makes those dials REAL
 * for simple-mode tenants.
 *
 * The `heading`/`base`/`mono` values reference `var(--ds-font-pack-<id>)` slots
 * that resolve only when the matching opt-in pack css
 * (@rottay/design-system/fonts/<id>.css) is loaded. Fallbacks MUST live inside
 * the var() parens and terminate in a concrete stack or a DIFFERENT underlying
 * token (--ds-font-sans / --ds-font-mono): list-position "fallbacks" outside
 * the parens are additional font-list items, and referencing the emitted token
 * itself is a per-element cycle — both compute guaranteed-invalid.
 */

export interface TypePairing {
  /** `--ds-font-family-heading` value for this preset. */
  readonly heading: string;
  /** `--ds-font-family-base` value for this preset. */
  readonly base: string;
  /** `--ds-font-family-mono` value; present only where the preset tunes mono. */
  readonly mono?: string;
  /** `--ds-letter-spacing-heading` dial. */
  readonly headingLs: string;
  /** `--ds-line-height-display` dial. */
  readonly displayLh: number;
}

export const TYPE_PAIRINGS = {
  sober: {
    heading: 'var(--ds-font-pack-grotesk-display, var(--ds-font-sans))',
    base: 'var(--ds-font-pack-humanist-text, var(--ds-font-sans))',
    headingLs: '-0.01em',
    displayLh: 1.15,
  },
  editorial: {
    heading: "var(--ds-font-pack-editorial-display, Georgia, 'Times New Roman', serif)",
    base: "var(--ds-font-pack-editorial-text, Georgia, 'Times New Roman', serif)",
    headingLs: '0',
    displayLh: 1.2,
  },
  geometric: {
    heading: 'var(--ds-font-pack-geometric-display, var(--ds-font-sans))',
    base: 'var(--ds-font-sans)',
    headingLs: '0.005em',
    displayLh: 1.18,
  },
  technical: {
    heading: 'var(--ds-font-pack-grotesk-display, var(--ds-font-sans))',
    base: 'var(--ds-font-sans)',
    mono: 'var(--ds-font-pack-plex-mono, var(--ds-font-mono))',
    headingLs: '0.01em',
    displayLh: 1.12,
  },
} as const satisfies Record<string, TypePairing>;

export type TypePairingId = keyof typeof TYPE_PAIRINGS;

export const TYPE_PAIRING_IDS = Object.keys(TYPE_PAIRINGS) as TypePairingId[];
