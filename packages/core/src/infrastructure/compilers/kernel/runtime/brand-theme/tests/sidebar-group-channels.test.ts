/**
 * C6.8-4B: the sidebar group channels are wired, not decorative.
 *
 * These five channels were reported as orphans because the tenant-channel
 * consumer gate scans DS `src/` only, so a channel read by the reference
 * adoption app looks dead. Four were wired into the Modern menu skin (the
 * Modern sidebar IS the Menu) and one was retired for having a shape no typed
 * contract can validate.
 *
 * Each assertion is causal: a typed edit must move the emitted channel, and the
 * skin must read that exact channel with a fallback that reproduces the
 * geometry a tenant who sets nothing gets today.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

import { compileBrandTheme } from '../index';

const here = dirname(fileURLToPath(import.meta.url));
const MENU_SKIN = readFileSync(
  join(here, '../../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu.css'),
  'utf-8'
);

const base: BrandTheme = {
  id: 'sidebar-fixture',
  name: 'Sidebar fixture',
  palette: { primaryColor: '#336699' },
};

const compile = (theme: BrandTheme) =>
  compileBrandTheme({ brandTheme: theme, tenantSlug: 'fixture' }).cssVariables;

describe('sidebar group channels are wired to the Modern menu skin', () => {
  it.each([
    ['groupMarginTop', '--ds-sidebar-group-margin-top', '0.5px'],
    ['groupMarginBottom', '--ds-sidebar-group-margin-bottom', '0.5px'],
    ['groupPaddingTop', '--ds-sidebar-group-padding-top', '6px'],
    ['itemIndent', '--ds-sidebar-item-indent', '0px'],
  ])('%s reaches %s and the skin reads it with the pre-wiring default', (field, channel, fallback) => {
    const sentinel = '37px';
    const emitted = compile({
      ...base,
      chrome: { sidebar: { [field]: sentinel } },
    } as BrandTheme);
    expect(emitted[channel]).toBe(sentinel);
    // The unedited theme must NOT contain the sentinel: without this the
    // assertion above would pass on a compiler that emits a constant.
    expect(Object.values(compile(base))).not.toContain(sentinel);

    // The skin reads exactly this channel, and its fallback is the literal the
    // rule used before wiring, so an unset tenant keeps today's geometry.
    expect(MENU_SKIN).toContain(`var(${channel}, ${fallback})`);
  });

  it('retires groupBorder: no contract field, no emission, no reader', () => {
    const emitted = compile({
      ...base,
      // A retired field must not resurrect through a loose cast.
      chrome: { sidebar: { groupBorder: '1px solid #FF0000' } },
    } as unknown as BrandTheme);
    expect(emitted['--ds-sidebar-group-border']).toBeUndefined();
    expect(MENU_SKIN).not.toContain('--ds-sidebar-group-border');
  });
});
