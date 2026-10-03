import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const COMPONENTS_ROOT = join(__dirname, '../../../../../../..');

const ACCENT_RAIL_OWNERS = [
  join(COMPONENTS_ROOT, 'structures/foundation/chrome'),
  join(COMPONENTS_ROOT, 'surfaces/presentation/pages'),
];

function productionSources(root: string): string[] {
  return readdirSync(root, { recursive: true, encoding: 'utf8' })
    .filter((entry) => /\.tsx?$/.test(entry) && !/(^|\/)tests\//.test(entry))
    .map((entry) => join(root, entry));
}

const ACCENT_BAR_SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../../../../foundation/tokens/css/presentation/components/skin/surface-accent-bar/index.css',
  ),
  'utf8',
);

describe('decorative accent-rail prohibition', () => {
  it('stamps no accent-rail anatomy from the surface chrome or the surface pages', () => {
    const sources = ACCENT_RAIL_OWNERS.flatMap(productionSources);

    expect(sources.length).toBeGreaterThan(0);
    expect(sources.filter((source) => readFileSync(source, 'utf8').includes('ds-accent-bar'))).toEqual([]);
  });

  it('keeps the legacy skin inert and free of decorative paint', () => {
    const declarations = ACCENT_BAR_SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(declarations).toMatch(/\.ds-surface\.ds-accent-bar\[data-part='bar'\]\s*\{\s*display:\s*none;/);
    expect(declarations).not.toMatch(/\b(?:background|border|animation|box-shadow)\s*:/);
    expect(declarations).not.toMatch(/--ds-color-|linear-gradient|radial-gradient/);
  });
});
