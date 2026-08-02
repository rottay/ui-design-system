/**
 * Family emphasis API (C2, Fase C) — the compact "family + intensity" surface
 * for APPLICATION developers.
 *
 * An app never edits the DS and never hand-writes `--ds-*` at :root; what it
 * MAY do is ask the DS to express one governed decision — "this card family
 * instance should read at intensity 0.8" — and receive a small, coherent,
 * scope-ready bundle. The resolver is pure and returns SCOPED component
 * channels whose values are exclusively `var()` chains over the canon
 * (elevation ramp, edge grammar, tint scale): tenant identity always flows
 * through, no literal can pin brand paint, and the promoted-hook value
 * constraint holds by construction.
 *
 * Closed vocabulary: four families (all with live component channels), four
 * quantized steps. Growing either is a reviewed DS change.
 */

export const EMPHASIS_FAMILIES = ['card', 'toolbar', 'metric-card', 'panel'] as const;
export type EmphasisFamily = (typeof EMPHASIS_FAMILIES)[number];

export type EmphasisStep = 0 | 1 | 2 | 3;

/** Quantize a 0..1 intensity into the four governed steps (fail-closed). */
export function quantizeEmphasis(intensity: number): EmphasisStep {
  if (!Number.isFinite(intensity)) return 1;
  if (intensity < 0.25) return 0;
  if (intensity < 0.5) return 1;
  if (intensity < 0.8) return 2;
  return 3;
}

interface EmphasisRow {
  readonly shadow: string;
  readonly borderWidth: string;
  readonly highlight?: string;
}

/**
 * One coherent ladder per family: as intensity rises, depth carries more of
 * the separation and the edge carries less — never both maxed (the flat/
 * elevated grammar every engine skin already speaks). Values are var()
 * chains only.
 */
const EMPHASIS_LADDERS: Readonly<
  Record<EmphasisFamily, readonly [EmphasisRow, EmphasisRow, EmphasisRow, EmphasisRow]>
> = Object.freeze({
  card: [
    { shadow: 'none', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-1)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-2)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    {
      shadow: 'var(--ds-elevation-3)',
      borderWidth: '0px',
      highlight: 'var(--ds-material-card-highlight, none)',
    },
  ],
  toolbar: [
    { shadow: 'none', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-1)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-1)', borderWidth: 'var(--ds-edge-standard-width, 1px)' },
    { shadow: 'var(--ds-elevation-2)', borderWidth: '0px' },
  ],
  'metric-card': [
    { shadow: 'none', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-1)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-2)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'var(--ds-elevation-3)', borderWidth: '0px' },
  ],
  panel: [
    { shadow: 'none', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
    { shadow: 'none', borderWidth: 'var(--ds-edge-standard-width, 1px)' },
    { shadow: 'var(--ds-elevation-1)', borderWidth: 'var(--ds-edge-standard-width, 1px)' },
    { shadow: 'var(--ds-elevation-2)', borderWidth: 'var(--ds-edge-hairline-width, 1px)' },
  ],
});

/** Component channel names each family's engine skins already read. */
const FAMILY_CHANNELS: Readonly<
  Record<EmphasisFamily, { shadow: string; borderWidth: string; highlight?: string }>
> = Object.freeze({
  card: {
    shadow: '--ds-card-shadow',
    borderWidth: '--ds-card-border-width',
    highlight: '--ds-material-card-highlight',
  },
  toolbar: { shadow: '--ds-toolbar-shadow', borderWidth: '--ds-page-shell-border-width' },
  'metric-card': { shadow: '--ds-metric-card-shadow', borderWidth: '--ds-metric-card-border-width' },
  panel: { shadow: '--ds-material-panel-shadow', borderWidth: '--ds-surface-border-width' },
});

/**
 * Resolve the scope-ready channel bundle for one family instance. Unknown
 * family or non-finite intensity fails closed to an EMPTY bundle — never a
 * throw, never partial paint.
 */
export function resolveFamilyEmphasis(
  family: string,
  intensity: number
): Readonly<Record<string, string>> {
  if (!(EMPHASIS_FAMILIES as readonly string[]).includes(family)) return {};
  if (!Number.isFinite(intensity)) return {};
  const step = quantizeEmphasis(intensity);
  const ladder = EMPHASIS_LADDERS[family as EmphasisFamily][step];
  const channels = FAMILY_CHANNELS[family as EmphasisFamily];
  const bundle: Record<string, string> = {
    [channels.shadow]: ladder.shadow,
    [channels.borderWidth]: ladder.borderWidth,
  };
  if (channels.highlight && ladder.highlight) {
    bundle[channels.highlight] = ladder.highlight;
  }
  return Object.freeze(bundle);
}
