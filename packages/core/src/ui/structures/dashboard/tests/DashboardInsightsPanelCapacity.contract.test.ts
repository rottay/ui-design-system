/**
 * @fileoverview The DashboardInsights panel-capacity contract -- proof that the
 * eight Modern skin roots take their panel size from a PRIVATE seam with a
 * byte-exact literal fallback, and that no layout-rhythm channel reaches it.
 *
 * THE LAW BEING PINNED. Rhythm owns the room BETWEEN and AROUND content. It
 * must never size a control, a panel, a touch target, an icon, type or motion --
 * those are density's axis, or no axis at all. Until 2026-08-11 these eight
 * roots declared
 *
 *   block-size: var(--_ds-dashboard-panel-block-size,
 *                   calc(415px * var(--ds-rhythm-effective-scale, 1)));
 *
 * so a tenant asking for `airy` did not gain room: it grew the panel's CAPACITY
 * by 20% while the content kept its own measure, and `tight` cropped it. The
 * seam stays -- it is the panel's private size socket, spelled `--_ds-` because
 * no tenant pipeline writes it and it is not a rhythm channel -- but its
 * fallback is now the shipped 415px measure, stated rather than computed.
 *
 * WHY A TEST AND NOT ONLY THE GATE. `scripts/tokens/spacing-rhythm-contract-gate/index.mjs`
 * is the census authority: it classifies every rhythm read in the whole
 * authored Modern corpus and fails closed. This suite is the FOCAL
 * counterfactual for the eight roots that carried the defect, so a silent
 * revert fails a test rather than only a script somebody has to remember to
 * run. It reads AUTHORED CSS, never a bundle: a bundle is a build product and
 * would report a fresh edit as absent.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

/** The panel's private size socket. Embedded hosts retune the panel by
 *  declaring it; it is not public tenant surface and carries no rhythm. */
const PANEL_SIZE_SEAM = '--_ds-dashboard-panel-block-size';

/** The shipped dashboard measure, byte-exact. */
const SHIPPED_PANEL_MEASURE = '415px';

/** The exact value every one of the eight roots must declare. */
const CONTRACT_VALUE = `var(${PANEL_SIZE_SEAM}, ${SHIPPED_PANEL_MEASURE})`;

/** Both rhythm spellings. `--ds-rhythm-scale` is the raw tenant input and
 *  `--ds-rhythm-effective-scale` its clamped derivation; a SIZE read of either
 *  is the defect, so neither may appear on a block-size here. */
const RHYTHM_CHANNELS = ['--ds-rhythm-effective-scale', '--ds-rhythm-scale'] as const;

/** Resolved to a plain string path, never handed to `fs` as a URL: the suite
 *  runs under happy-dom, whose global `URL` is not the `node:url` one `fs`
 *  accepts. This is the rhythm-adoption-census idiom. */
const HERE = dirname(fileURLToPath(import.meta.url));
const SKIN_DIRECTORY = resolvePath(
  HERE,
  '../../../../foundation/tokens/css/presentation/components/skin',
);

/**
 * The eight DashboardInsights panel roots. Each skin scope class is REPEATED in
 * its own selector to buy the kit's "two root classes" specificity budget, so
 * the selector is derived rather than retyped.
 */
const PANEL_ROOTS = [
  { file: 'activity-cards.css', scope: 'ds-activity-cards' },
  { file: 'activity-compact.css', scope: 'ds-activity-compact' },
  { file: 'activity-ticker.css', scope: 'ds-activity-ticker' },
  { file: 'activity-timeline.css', scope: 'ds-activity-timeline' },
  { file: 'metrics-cards.css', scope: 'ds-metrics-cards' },
  { file: 'metrics-chart.css', scope: 'ds-metrics-chart' },
  { file: 'metrics-minimal.css', scope: 'ds-metrics-minimal' },
  { file: 'metrics-rows.css', scope: 'ds-metrics-rows' },
] as const;

function rootSelector(scope: string): string {
  return `.${scope}.${scope}[data-part='root']`;
}

function readSkin(file: string): string {
  return readFileSync(resolvePath(SKIN_DIRECTORY, file), 'utf8');
}

/** Every `block-size` value declared on `selector` in `source`. */
function rootBlockSizeValues(source: string, selector: string): readonly string[] {
  const out: string[] = [];
  postcss.parse(source).walkDecls('block-size', (declaration) => {
    const parent = declaration.parent;
    if (!parent || parent.type !== 'rule') return;
    if ((parent as { selector: string }).selector !== selector) return;
    out.push(declaration.value);
  });
  return out;
}

/** Every `block-size` value in `source`, wherever it is declared. */
function allBlockSizeValues(source: string): readonly string[] {
  const out: string[] = [];
  postcss.parse(source).walkDecls(/^(min-|max-)?block-size$/, (declaration) => {
    out.push(declaration.value);
  });
  return out;
}

/**
 * THE INSTRUMENT. Returns the reasons `value` escapes the panel-capacity
 * contract; an empty array is a pass. Kept pure so the counterfactual leg can
 * fire it on the retired form without editing the repository.
 */
function capacityViolations(value: string): readonly string[] {
  const reasons: string[] = [];
  if (value !== CONTRACT_VALUE) {
    reasons.push(`value is \`${value}\`, expected \`${CONTRACT_VALUE}\``);
  }
  for (const channel of RHYTHM_CHANNELS) {
    if (value.includes(channel)) reasons.push(`sizes the panel from ${channel}`);
  }
  if (value.includes('calc(')) {
    reasons.push('computes the fallback instead of stating the shipped measure');
  }
  return reasons;
}

describe('DashboardInsights panel capacity (the seam sizes the panel, rhythm never does)', () => {
  it('covers all eight roots that carried the defect', () => {
    expect(PANEL_ROOTS).toHaveLength(8);
    expect(new Set(PANEL_ROOTS.map((root) => root.file)).size).toBe(8);
  });

  it.each(PANEL_ROOTS)(
    '$file sizes its panel root from the private seam, falling back to a literal 415px',
    ({ file, scope }) => {
      const selector = rootSelector(scope);
      const values = rootBlockSizeValues(readSkin(file), selector);

      // Exactly one: a second declaration on the same root would mean the
      // assertion below audits a value the cascade discards.
      expect(values, `${file} :: ${selector} declares no block-size`).toHaveLength(1);
      expect(capacityViolations(values[0]), `${file} :: ${selector}`).toEqual([]);
    },
  );

  it('no block-size anywhere in the eight skins reads a rhythm channel', () => {
    // Wider than the root, because the defect can come back on a nested part
    // (a ticker body, a meter well) just as easily as on the panel frame.
    const violations: string[] = [];
    for (const { file } of PANEL_ROOTS) {
      for (const value of allBlockSizeValues(readSkin(file))) {
        for (const channel of RHYTHM_CHANNELS) {
          if (value.includes(channel)) violations.push(`${file} :: block-size: ${value}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('COUNTERFACTUAL: the instrument fires on the exact retired rhythm-multiplied form', () => {
    // A drill that cannot go red proves nothing. This is the literal shape the
    // eight roots carried at 68f258690.
    const retired = `var(${PANEL_SIZE_SEAM}, calc(${SHIPPED_PANEL_MEASURE} * var(--ds-rhythm-effective-scale, 1)))`;
    const reasons = capacityViolations(retired);
    expect(reasons).not.toEqual([]);
    expect(reasons.some((reason) => reason.includes('--ds-rhythm-effective-scale'))).toBe(true);

    // The raw tenant input is caught too, so a "fix" that skips the clamp is
    // not mistaken for a repair.
    expect(
      capacityViolations(`var(${PANEL_SIZE_SEAM}, calc(415px * var(--ds-rhythm-scale, 1)))`),
    ).not.toEqual([]);

    // ...and the shipped contract value itself stays clean, so the instrument
    // is not simply rejecting everything.
    expect(capacityViolations(CONTRACT_VALUE)).toEqual([]);
  });

  it('COUNTERFACTUAL: the reader finds a reverted declaration rather than reporting a hollow green', () => {
    // The dangerous failure is not a wrong value -- it is a selector match that
    // silently returns zero declarations, which would let every leg above pass
    // against a file where the defect had come back. This proves the extraction
    // sees a reverted root and hands it to the instrument.
    const scope = 'ds-metrics-cards';
    const selector = rootSelector(scope);
    const reverted = `${selector} {
      display: flex;
      block-size: var(${PANEL_SIZE_SEAM}, calc(${SHIPPED_PANEL_MEASURE} * var(--ds-rhythm-effective-scale, 1)));
    }`;

    const values = rootBlockSizeValues(reverted, selector);
    expect(values).toHaveLength(1);
    expect(capacityViolations(values[0])).not.toEqual([]);
  });
});
