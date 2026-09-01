import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const skin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tooltip/index.css'),
  'utf8',
);

describe('Tooltip modern premium ground', () => {
  it('reads a material role for its shadow, being the one floating object', () => {
    // The licensed exception to no-shadow-at-rest is a ROLE, not an elevation step.
    const bordered = skin.slice(
      skin.indexOf('--ds-tooltip-bordered-shadow'),
      skin.indexOf('--ds-tooltip-bordered-shadow') + 220,
    );
    expect(bordered).toContain('--ds-material-overlay-shadow');
  });

  it('puts the rich recipe on the raised role', () => {
    expect(skin).toMatch(/--ds-material-raised-shadow[^;]*--ds-shadow-xl/);
  });

  it('owns a real ground, unlike the unframed display primitives', () => {
    expect(skin).toContain('--ds-tooltip-surface');
    expect(skin).toMatch(/border:\s*var\(--ds-tooltip-edge-width\) solid var\(--ds-tooltip-edge\)/);
  });
});
