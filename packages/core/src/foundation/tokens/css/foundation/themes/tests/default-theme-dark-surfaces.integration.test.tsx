/**
 * The sheet's dark scope answers for the surface channels its light `:root`
 * states as literals. A light surface literal with no dark leg keeps painting
 * white under the dark ink, so the pair is unreadable; measured on rottay,
 * whose mount stamps the dark scope, in a real browser.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernBadge from '@/components/primitives/display/badge/engines/modern';
import ModernTable from '@/components/primitives/display/table/engines/modern';
import RusticAutoComplete from '@/components/primitives/inputs/auto-complete/engines/rustic';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { measureArms } from '@tests/support/family-causality';

const THEME_CSS = readFileSync(resolve(__dirname, '../default/index.css'), 'utf8');
const RUSTIC_AUTOCOMPLETE_SKIN = readFileSync(
  resolve(__dirname, '../../../runtime/engines/rustic/skin/autocomplete/index.css'),
  'utf8',
);
const DARK_START = THEME_CSS.indexOf(":root[data-theme='dark']");

function declarations(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const match of css.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)) map.set(match[1]!, match[2]!.trim());
  return map;
}

const markup =
  `<style>${RUSTIC_AUTOCOMPLETE_SKIN}</style>` +
  renderToStaticMarkup(
    <I18nProvider>
      <div id="table">
        <ModernTable
          columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }] as never}
          dataSource={[{ id: 'a', name: 'Alpha' }] as never}
          rowKey="id"
        />
      </div>
      <div id="badge">
        <ModernBadge badgeStyle="soft" variant="success">Done</ModernBadge>
      </div>
      <div id="autocomplete">
        <RusticAutoComplete options={[{ value: 'Lisbon' }]} defaultValue="Lisbon" open aria-label="City" />
      </div>
    </I18nProvider>,
  );

function rgb(value: string): [number, number, number] {
  const srgb = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255];
  const legacy = value.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
  if (!legacy) throw new Error(`unparsed colour: ${value}`);
  if (legacy[4] !== undefined && Number(legacy[4]) < 1) throw new Error(`translucent ground: ${value}`);
  return [Number(legacy[1]), Number(legacy[2]), Number(legacy[3])];
}

function contrast(a: string, b: string): number {
  const luminance = (value: string) => {
    const [r, g, bl] = rgb(value).map((channel) => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('default theme dark surfaces', () => {
  it('paints every measured surface dark enough to carry its dark-mode ink', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'tableGround', selector: "#table [data-part='scroll-container']", property: 'background-color' },
        { id: 'cellInk', selector: "#table [data-part='cell']", property: 'color' },
        { id: 'headerGround', selector: '#table th', property: 'background-color' },
        { id: 'headerInk', selector: "#table [data-part='header-title']", property: 'color' },
        { id: 'badgeGround', selector: "#badge [data-part='root']", property: 'background-color' },
        { id: 'badgeInk', selector: "#badge [data-part='root']", property: 'color' },
        { id: 'fieldGround', selector: "#autocomplete [data-part='input']", property: 'background-color' },
        { id: 'fieldInk', selector: "#autocomplete [data-part='input']", property: 'color' },
        { id: 'popupGround', selector: "#autocomplete [data-part='dropdown']", property: 'background-color' },
        { id: 'optionInk', selector: "#autocomplete [data-part='option']", property: 'color' },
      ],
    });
    const r = readings.base!;
    const pairs = {
      table: contrast(r.tableGround!, r.cellInk!),
      header: contrast(r.headerGround!, r.headerInk!),
      badge: contrast(r.badgeGround!, r.badgeInk!),
      field: contrast(r.fieldGround!, r.fieldInk!),
      popup: contrast(r.popupGround!, r.optionInk!),
    };
    for (const [pair, ratio] of Object.entries(pairs)) {
      expect(ratio, `${pair}: ${JSON.stringify(r)}`).toBeGreaterThanOrEqual(4.5);
    }
  }, 120_000);

  it('states each repaired surface as a mode-aware reference, never a dark literal', () => {
    const dark = declarations(THEME_CSS.slice(DARK_START));
    const repaired = [
      '--ds-table-bg',
      '--ds-table-header-bg',
      '--ds-table-row-bg',
      '--ds-table-row-bg-striped',
      '--ds-table-loading-overlay-bg',
      '--ds-table-header-color',
      '--ds-table-border',
      '--ds-table-row-border',
      '--ds-autocomplete-bg',
      '--ds-autocomplete-dropdown-bg',
    ];
    for (const channel of repaired) {
      expect(dark.get(channel), channel).toMatch(/var\(--ds-/);
      expect(dark.get(channel), channel).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });

  it('gives each status wash a dark leg and leaves the ramps and roles alone', () => {
    const root = declarations(THEME_CSS.slice(0, DARK_START));
    const ownDark = declarations(THEME_CSS.slice(DARK_START));
    const hex = (value: string) => {
      const [, r, g, b] = value.match(/^#(..)(..)(..)$/)!;
      return `rgb(${parseInt(r!, 16)}, ${parseInt(g!, 16)}, ${parseInt(b!, 16)})`;
    };
    for (const tone of ['success', 'warning', 'info']) {
      const wash = ownDark.get(`--ds-color-${tone}-bg`);
      expect(wash, `${tone}-bg`).toBeDefined();
      // Darker than the light ramp's darkest stop, so the dark ink reads on it.
      expect(contrast(hex(wash!), 'rgb(0, 0, 0)')).toBeLessThan(contrast(hex(root.get(`--ds-color-${tone}-900`)!), 'rgb(0, 0, 0)'));
      // Solid fills under white ink read these steps; the dark scope must not move them.
      expect([...ownDark.keys()].filter((name) => name.startsWith(`--ds-color-${tone}-`) && name !== `--ds-color-${tone}-bg`)).toEqual([]);
      expect(ownDark.has(`--ds-color-${tone}`)).toBe(false);
    }
  });
});
