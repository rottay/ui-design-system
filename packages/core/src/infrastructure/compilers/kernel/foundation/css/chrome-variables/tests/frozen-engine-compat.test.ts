import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { lowerBrandThemeFixture } from '@tests/support/theme-lowering';
import { rottayBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/rottay';
import { FROZEN_ENGINE_COMPAT_CHANNELS, chromeToVariables } from '..';

const RUSTIC_SKINS = resolve(process.cwd(), 'src/foundation/tokens/css/runtime/engines/rustic/skin');

describe('frozen engine compatibility channels', () => {
  it('restates an authored family channel under its pre-cut name, and nothing unauthored', () => {
    const vars = chromeToVariables({ controls: { autocomplete: { bg: '#010203' } } });
    expect(vars['--ds-auto-complete-bg']).toBe('#010203');
    expect(vars['--ds-autocomplete-bg']).toBe('#010203');
    expect(vars['--ds-autocomplete-border']).toBeUndefined();
  });

  it('names only pre-cut channels a frozen Rustic skin still reads', () => {
    const skins = ['autocomplete', 'date-picker', 'time-picker']
      .map((skin) => readFileSync(resolve(RUSTIC_SKINS, skin, 'index.css'), 'utf8'))
      .join('\n');
    for (const legacy of Object.keys(FROZEN_ENGINE_COMPAT_CHANNELS)) {
      expect(skins, legacy).toContain(`var(${legacy}`);
    }
  });

  it('gives the rottay dark artifact its authored Rustic autocomplete surface back', () => {
    const compiled = lowerBrandThemeFixture({ brandTheme: rottayBrandTheme as never, tenantSlug: 'rottay' });
    expect(compiled.colorScheme).toBe('dark');
    expect(compiled.cssVariables['--ds-autocomplete-bg']).toBe('#131316');
    expect(compiled.cssString).toContain('--ds-autocomplete-bg: #131316;');
  });
});
