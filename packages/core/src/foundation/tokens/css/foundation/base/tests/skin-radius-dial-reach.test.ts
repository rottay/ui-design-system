/** Sub-rung corners follow the radius dial with the rung formula at their own size; unset paints the literal. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SKIN = 'src/foundation/tokens/css/presentation/components/skin';

interface DialRule {
  readonly family: string;
  readonly selector: string;
  readonly property: string;
  readonly value: string;
}

const RULES: readonly DialRule[] = [
  { family: 'chart-area', selector: '.ds-chart-area', property: '--_ds-area-marker-radius', value: 'calc(2px * var(--ds-radius-scale, 1))' },
  { family: 'chart-area', selector: ".ds-chart-area [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-area-marker-radius, 2px)' },
  { family: 'chart-bar', selector: '.ds-chart-bar', property: '--_ds-bar-marker-radius', value: 'calc(2px * var(--ds-radius-scale, 1))' },
  { family: 'chart-bar', selector: ".ds-chart-bar [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-bar-marker-radius, 2px)' },
  { family: 'chart-radar', selector: ".ds-chart-radar [data-part='legend-swatch']", property: 'border-radius', value: 'calc(1px * var(--ds-radius-scale, 1))' },
  { family: 'chart-treemap', selector: ".ds-chart-treemap [data-part='legend-swatch']", property: 'border-radius', value: 'calc(2px * var(--ds-radius-scale, 1))' },
  {
    family: 'data-terminal-card',
    selector: ".ds-data-terminal-card[data-part='root'] [data-part='activity-bar']",
    property: 'border-radius',
    value: 'calc(1px * var(--ds-radius-scale, 1))',
  },
];

/** The value of `property` in the first top-level rule written with exactly this selector. */
function declared(family: string, selector: string, property: string): string | undefined {
  const css = readFileSync(resolve(process.cwd(), SKIN, family, 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = new RegExp(`(?:^|\\})\\s*${escape(selector)}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  return new RegExp(`(?:^|;)\\s*${escape(property)}\\s*:\\s*([^;]+);`).exec(body ?? '')?.[1]?.trim();
}

describe('engine-agnostic skins -- shape reach through the radius dial', () => {
  it.each(RULES)('$family: $selector declares $property from the dial', ({ family, selector, property, value }) => {
    expect(declared(family, selector, property)).toBe(value);
  });
});
