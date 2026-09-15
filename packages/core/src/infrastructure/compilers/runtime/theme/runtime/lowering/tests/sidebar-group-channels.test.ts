/**
 * C6.8-4B: the sidebar group channels are wired, not decorative.
 *
 * These five channels were reported as orphans because the tenant-channel
 * consumer gate scans DS `src/` only, so a channel read by the reference
 * adoption app looks dead. Four were wired into the Modern menu skin (the
 * Modern sidebar IS the Menu) and one was retired for having a shape no typed
 * contract can validate.
 *
 * Each assertion is causal: a typed edit must move the emitted channel, the
 * compiled chrome must chain that exact channel behind the `--ds-menu-*` name
 * the family owns, and the skin must read that name.
 *
 * The middle link is where the read MOVED. The skin used to read
 * `--ds-sidebar-*` directly; the family cut gave the menu family its own
 * channels, so the chrome deriver now emits `--ds-menu-group-margin-block`,
 * `--ds-menu-group-padding-block` and `--ds-menu-child-padding-inline` with the
 * sidebar channel as their first operand, and the skin reads those. The chain
 * is one link longer and asserted end to end rather than shortened.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { FlatTheme } from '@/foundation/contracts/composition/tenants/themes';

import { lowerFlatThemeFixture } from "@tests/support/theme-lowering";

const here = dirname(fileURLToPath(import.meta.url));
const MENU_SKIN = readFileSync(
  join(here, '../../../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu/index.css'),
  'utf-8'
);

const base: FlatTheme = {
  id: 'sidebar-fixture',
  name: 'Sidebar fixture',
  palette: { primaryColor: '#336699' },
};

const compile = (theme: FlatTheme) =>
  lowerFlatThemeFixture({ flatTheme: theme, tenantSlug: 'fixture' }).cssVariables;

describe('sidebar group channels are wired to the Modern menu skin', () => {
  it.each([
    [
      'groupMarginTop',
      '--ds-sidebar-group-margin-top',
      '--ds-menu-group-margin-block',
      'var(--ds-spacing-1)',
    ],
    [
      'groupMarginBottom',
      '--ds-sidebar-group-margin-bottom',
      '--ds-menu-group-margin-block',
      'var(--ds-spacing-1)',
    ],
    [
      'groupPaddingTop',
      '--ds-sidebar-group-padding-top',
      '--ds-menu-group-padding-block',
      'var(--ds-spacing-2)',
    ],
    [
      'itemIndent',
      '--ds-sidebar-item-indent',
      '--ds-menu-child-padding-inline',
      'var(--ds-spacing-2)',
    ],
  ])(
    '%s reaches %s, which %s chains with the unset-tenant default the skin reads',
    (field, channel, menuChannel, fallback) => {
      const sentinel = '37px';
      const emitted = compile({
        ...base,
        chrome: { sidebar: { [field]: sentinel } },
      } as FlatTheme);
      expect(emitted[channel]).toBe(sentinel);
      // The unedited theme must NOT contain the sentinel: without this the
      // assertion above would pass on a compiler that emits a constant.
      expect(Object.values(compile(base))).not.toContain(sentinel);

      // The compiled chrome chains the sidebar channel behind the menu name,
      // carrying the default an unset tenant gets.
      expect(emitted[menuChannel]).toContain(`var(${channel}, ${fallback})`);

      // And the skin reads the menu name, so the typed edit reaches paint.
      expect(MENU_SKIN).toContain(`var(${menuChannel},`);
    }
  );

  it('retires groupBorder: no contract field, no emission, no reader', () => {
    const emitted = compile({
      ...base,
      // A retired field must not resurrect through a loose cast.
      chrome: { sidebar: { groupBorder: '1px solid #FF0000' } },
    } as unknown as FlatTheme);
    expect(emitted['--ds-sidebar-group-border']).toBeUndefined();
    expect(MENU_SKIN).not.toContain('--ds-sidebar-group-border');
  });
});
