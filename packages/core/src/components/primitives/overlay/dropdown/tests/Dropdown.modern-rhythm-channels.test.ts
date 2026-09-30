import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const CSS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../foundation/tokens/css');
const TOKENS = readFileSync(resolve(CSS_ROOT, 'presentation/components/dropdown/index.css'), 'utf8');
const SKIN = readFileSync(resolve(CSS_ROOT, 'runtime/engines/modern/skin/dropdown/index.css'), 'utf8');

const DENSITY_CHANNELS: ReadonlyArray<readonly [name: string, restingValue: string]> = [
  ['--ds-dropdown-surface-padding', '0.375rem'],
  ['--ds-dropdown-item-gap', '0.2rem'],
  ['--ds-dropdown-item-height', '2.4rem'],
  ['--ds-dropdown-item-padding-y', '0.45rem'],
  ['--ds-dropdown-item-padding-x', '0.55rem'],
  ['--ds-dropdown-group-margin-start', '0.35rem'],
  ['--ds-dropdown-group-margin-end', '0.15rem'],
  ['--ds-dropdown-group-padding-y', '0.38rem'],
  ['--ds-dropdown-group-padding-x', '0.6rem'],
  ['--ds-dropdown-divider-margin-y', '0.35rem'],
  ['--ds-dropdown-divider-margin-x', '0.3rem'],
];

const declaration = (css: string, name: string): string | undefined =>
  new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm').exec(css)?.[1]?.trim();

describe('Dropdown menu rhythm rides the density scale', () => {
  it.each(DENSITY_CHANNELS)('%s scales %s by the effective density', (name, restingValue) => {
    expect(declaration(TOKENS, name)).toBe(`calc(${restingValue} * var(--ds-density-effective-scale))`);
  });

  it('pads the surface and the submenu through the Modern channel, not the Classic token', () => {
    expect(SKIN.match(/padding: var\(--ds-dropdown-surface-padding\);/g)).toHaveLength(2);
    expect(SKIN).not.toContain('var(--ds-dropdown-padding)');
  });
});
