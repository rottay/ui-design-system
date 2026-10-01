/**
 * Sub-rung corners follow the radius dial RELATIVE TO THE VERTICAL'S REST: each
 * is its authored pixel times `--ds-radius-scale-normalized`, so it paints that
 * pixel at rest in every vertical (bithire included, whose rest dial is 0.8) and
 * moves by the tenant's ratio. Unset paints the literal.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { THEME_CONTROL_CATALOG } from '@/contracts/theme/runtime/catalog';

const CSS_ROOT = resolve(process.cwd(), 'src/foundation/tokens/css');
const SKIN = 'src/foundation/tokens/css/presentation/components/skin';
const NORMALIZED = '--ds-radius-scale-normalized';
const REST = '--ds-radius-scale-rest';
/** The one site that DEFINES the channel rather than reading it. */
const DEFINITION = 'foundation/themes/default/index.css';

interface DialRule {
  readonly family: string;
  readonly selector: string;
  readonly property: string;
  readonly value: string;
}

const RULES: readonly DialRule[] = [
  { family: 'chart-area', selector: '.ds-chart-area', property: '--_ds-area-marker-radius', value: 'calc(2px * var(--ds-radius-scale-normalized, 1))' },
  { family: 'chart-area', selector: ".ds-chart-area [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-area-marker-radius, 2px)' },
  { family: 'chart-bar', selector: '.ds-chart-bar', property: '--_ds-bar-marker-radius', value: 'calc(2px * var(--ds-radius-scale-normalized, 1))' },
  { family: 'chart-bar', selector: ".ds-chart-bar [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-bar-marker-radius, 2px)' },
  {
    family: 'chart-bullet',
    selector: ".ds-chart-bullet [data-part='legend-swatch'][data-variant='range']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-bullet',
    selector: ".ds-chart-bullet [data-part='legend-swatch'][data-variant='value']",
    property: 'border-radius',
    value: 'calc(1px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-c',
    selector: ".ds-chart-histogram [data-part='legend-item'][data-series='histogram'] [data-part='legend-swatch']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-c',
    selector: ".ds-chart-gauge [data-part='legend-swatch']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-c',
    selector: ".ds-chart-sankey [data-part='legend-swatch']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-c',
    selector: ".ds-chart-funnel [data-part='legend-swatch']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'chart-c',
    selector: ".ds-chart-network-graph [data-part='legend-swatch'][data-shape='square']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  { family: 'chart-radar', selector: ".ds-chart-radar [data-part='legend-swatch']", property: 'border-radius', value: 'calc(1px * var(--ds-radius-scale-normalized, 1))' },
  { family: 'chart-treemap', selector: ".ds-chart-treemap [data-part='legend-swatch']", property: 'border-radius', value: 'calc(2px * var(--ds-radius-scale-normalized, 1))' },
  {
    family: 'chart-waterfall',
    selector: ".ds-chart-waterfall [data-part='legend-swatch'][data-status='increase']",
    property: 'border-radius',
    value: 'calc(2px * var(--ds-radius-scale-normalized, 1)) calc(2px * var(--ds-radius-scale-normalized, 1)) 0 0',
  },
  {
    family: 'chart-waterfall',
    selector: ".ds-chart-waterfall [data-part='legend-swatch'][data-status='decrease']",
    property: 'border-radius',
    value: '0 0 calc(2px * var(--ds-radius-scale-normalized, 1)) calc(2px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'data-terminal-card',
    selector: ".ds-data-terminal-card[data-part='root'] [data-part='activity-bar']",
    property: 'border-radius',
    value: 'calc(1px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'edit-header',
    selector: ".ds-structure.ds-edit-header [data-part='back-button']",
    property: 'border-radius',
    value: 'calc(10px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'form-header',
    selector: ".ds-structure.ds-form-header[data-part='root'] [data-part='back-button']",
    property: 'border-radius',
    value: 'calc(10px * var(--ds-radius-scale-normalized, 1))',
  },
  {
    family: 'skeleton-anatomy',
    selector: ".ds-skeleton-anatomy[data-part='root'] [data-part='bone']",
    property: 'border-radius',
    value: 'var(--ds-skeleton-bone-radius, calc(6px * var(--ds-radius-scale-normalized, 1)))',
  },
  {
    family: 'skeleton-anatomy',
    selector: ".ds-skeleton-anatomy[data-part='root'] [data-part='bone'][data-bone='line']",
    property: 'border-radius',
    value: 'var(--ds-skeleton-line-radius, calc(4px * var(--ds-radius-scale-normalized, 1)))',
  },
  {
    family: 'skeleton-anatomy',
    selector: ".ds-skeleton-anatomy-rows [data-part='skeleton-bar']",
    property: 'border-radius',
    value: 'var(--ds-skeleton-line-radius, calc(4px * var(--ds-radius-scale-normalized, 1)))',
  },
];

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** The value of `property` in the first top-level rule written with exactly this selector. */
function declared(family: string, selector: string, property: string): string | undefined {
  const css = stripComments(readFileSync(resolve(process.cwd(), SKIN, family, 'index.css'), 'utf8'));
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = new RegExp(`(?:^|\\})\\s*${escape(selector)}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  return new RegExp(`(?:^|;)\\s*${escape(property)}\\s*:\\s*([^;]+);`).exec(body ?? '')?.[1]?.trim();
}

/** Every authored stylesheet under the CSS root, root-relative. The facade artifacts are generated snapshots, not authored sources. */
function styleFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (relative(CSS_ROOT, join(dir, entry)).startsWith('facade/artifacts/')) continue;
      const absolute = join(dir, entry);
      if (statSync(absolute).isDirectory()) walk(absolute);
      else if (entry.endsWith('.css')) found.push(relative(CSS_ROOT, absolute));
    }
  };
  walk(CSS_ROOT);
  return found.sort();
}

/** Every `property: value` declaration in a stylesheet, comments dropped. */
function declarations(css: string): { property: string; value: string }[] {
  return [...stripComments(css).matchAll(/(?:^|[;{])\s*(-{0,2}[a-zA-Z_][\w-]*)\s*:\s*([^;{}]+)/g)].map((match) => ({
    property: match[1]!,
    value: match[2]!.trim(),
  }));
}

const SHAPE_LONGHAND = /^border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius$/;
const reads = (value: string, name: string) => new RegExp(`var\\(\\s*${name}\\s*[,)]`).test(value);

describe('engine-agnostic skins -- shape reach through the radius dial', () => {
  it.each(RULES)('$family: $selector declares $property from the dial', ({ family, selector, property, value }) => {
    expect(declared(family, selector, property)).toBe(value);
  });

  /**
   * Population membership of the shape axis rests on a family AUTHORING a shape
   * longhand: the normalized channel is deliberately not a `produces` channel of
   * `shape.radius-scale`, so a reader that stopped painting a corner would leave
   * the denominator silently. Every reader must therefore end in a radius
   * longhand in its own file -- directly, or through the private socket it
   * declares.
   */
  it('every reader of the normalized channel authors a shape longhand', () => {
    const orphans: string[] = [];
    let readers = 0;
    for (const file of styleFiles()) {
      if (file === DEFINITION) continue;
      const decls = declarations(readFileSync(join(CSS_ROOT, file), 'utf8'));
      for (const decl of decls.filter((candidate) => reads(candidate.value, NORMALIZED))) {
        readers++;
        if (SHAPE_LONGHAND.test(decl.property)) continue;
        const painted =
          decl.property.startsWith('--') &&
          decls.some((other) => SHAPE_LONGHAND.test(other.property) && reads(other.value, decl.property));
        if (!painted) orphans.push(`${file}: ${decl.property}: ${decl.value}`);
      }
    }
    expect(readers, 'the reader census moved; re-anchor it with the movers named').toBe(19);
    expect(orphans).toEqual([]);
  });

  it('the foundation defines the normalized channel once, over the vertical rest', () => {
    const definitions = styleFiles().flatMap((file) =>
      declarations(readFileSync(join(CSS_ROOT, file), 'utf8'))
        .filter((decl) => decl.property === NORMALIZED || decl.property === REST)
        .map((decl) => `${file}: ${decl.property}: ${decl.value}`)
    );
    expect(definitions).toEqual([
      `${DEFINITION}: ${NORMALIZED}: calc(var(--ds-radius-scale, 1) / var(${REST}, 1))`,
    ]);
  });

  /**
   * Neither name is a decision: the rest is the vertical's own constant and the
   * normalized channel is a view of the dial. Listing either in the row's
   * `produces` would make every reader a head-channel member of the shape axis,
   * unexcludable by property.
   */
  it('keeps the rest and the normalized channel out of shape.radius-scale.produces', () => {
    const row = THEME_CONTROL_CATALOG.find((candidate) => candidate.id === 'shape.radius-scale');
    expect(row).toBeDefined();
    const everywhere = THEME_CONTROL_CATALOG.flatMap((candidate) => candidate.produces.channels);
    expect(everywhere).not.toContain(NORMALIZED);
    expect(everywhere).not.toContain(REST);
  });
});
