/**
 * APCA text-contrast autocorrect proof (W4-C1).
 *
 * Proves the pass is pure and deterministic, never mutates its input, leaves
 * passing pairs untouched, snaps failing pairs to threshold with honest
 * adjustment rows, reports non-hex pairs as unverifiable instead of skipping
 * them, and (property, 200 seeded random pairs) always either reaches the
 * threshold or lands on the strongest achievable extreme fallback.
 */
import { describe, expect, it } from 'vitest';

import { apcaContrast } from '../..';
import { hexToOklch } from '../../../../color/oklch';
import {
  TEXT_CONTRAST_FALLBACK_CANDIDATES,
  TEXT_CONTRAST_PAIRINGS,
  TEXT_CONTRAST_PRIMARY_TEXT_MIN_LC,
  enforceTextContrast,
} from '../index';

/** mulberry32: deterministic 32-bit PRNG (integer ops only, no Math.random). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomHex(next: () => number): string {
  const byte = () =>
    Math.floor(next() * 256)
      .toString(16)
      .padStart(2, '0');
  return `#${byte()}${byte()}${byte()}`;
}

describe('enforceTextContrast', () => {
  it('leaves a passing pair untouched with no rows', () => {
    const variables = {
      '--ds-button-primary-color': '#FFFFFF',
      '--ds-button-primary-bg': '#1A5FB4',
    };
    const result = enforceTextContrast(variables, {});
    expect(result.variables).toEqual(variables);
    expect(result.adjustments).toEqual([]);
    expect(result.unverifiable).toEqual([]);
  });

  it('never mutates the input map', () => {
    const variables = {
      '--ds-button-primary-color': '#9AA3AC',
      '--ds-button-primary-bg': '#FFFFFF',
    };
    const frozen = JSON.stringify(variables);
    enforceTextContrast(variables, {});
    expect(JSON.stringify(variables)).toBe(frozen);
  });

  it('snaps a failing chrome pair to its Lc 60 threshold with an honest row', () => {
    const from = '#7FB2E5';
    const variables = {
      '--ds-button-primary-color': from,
      '--ds-button-primary-bg': '#FFFFFF',
    };
    const result = enforceTextContrast(variables, {});

    expect(result.adjustments).toHaveLength(1);
    const row = result.adjustments[0];
    expect(row.token).toBe('--ds-button-primary-color');
    expect(row.pairedWith).toBe('--ds-button-primary-bg');
    expect(row.from).toBe(from);
    expect(row.to).toBe(result.variables['--ds-button-primary-color']);
    expect(row.to).not.toBe(from);
    expect(row.lcBefore).toBe(apcaContrast(from, '#FFFFFF'));
    expect(Math.abs(row.lcBefore)).toBeLessThan(60);
    expect(row.lcAfter).toBe(apcaContrast(row.to, '#FFFFFF'));
    expect(Math.abs(row.lcAfter)).toBeGreaterThanOrEqual(60);
    // Ground never adjusted.
    expect(result.variables['--ds-button-primary-bg']).toBe('#FFFFFF');
  });

  it('darkens against a lighter ground and preserves hue', () => {
    const from = '#7FB2E5';
    const result = enforceTextContrast(
      { '--ds-card-title-color': from, '--ds-card-bg': '#FFFFFF' },
      {}
    );
    const to = result.variables['--ds-card-title-color'];
    expect(hexToOklch(to).l).toBeLessThan(hexToOklch(from).l);
    const hueDelta = Math.abs(hexToOklch(to).h - hexToOklch(from).h);
    expect(Math.min(hueDelta, 360 - hueDelta)).toBeLessThan(4);
  });

  it('lightens against a darker ground', () => {
    const from = '#3A4148';
    const result = enforceTextContrast(
      { '--ds-sidebar-text': from, '--ds-sidebar-bg': '#14161A' },
      {}
    );
    const to = result.variables['--ds-sidebar-text'];
    expect(hexToOklch(to).l).toBeGreaterThan(hexToOklch(from).l);
    expect(Math.abs(apcaContrast(to, '#14161A'))).toBeGreaterThanOrEqual(60);
  });

  it('falls back to the strongest extreme on a mid-gray ground neither extreme can beat', () => {
    const ground = '#A6A6A6';
    const [white, nearBlack] = TEXT_CONTRAST_FALLBACK_CANDIDATES;
    const whiteLc = Math.abs(apcaContrast(white, ground));
    const nearBlackLc = Math.abs(apcaContrast(nearBlack, ground));
    // Precondition for this fixture: the ground defeats both extremes at Lc 60.
    expect(whiteLc).toBeLessThan(60);
    expect(nearBlackLc).toBeLessThan(60);

    const result = enforceTextContrast(
      { '--ds-table-header-color': '#999999', '--ds-table-header-bg': ground },
      {}
    );
    expect(result.adjustments).toHaveLength(1);
    const row = result.adjustments[0];
    const expected = whiteLc >= nearBlackLc ? white : nearBlack;
    expect(row.to).toBe(expected);
    expect(Math.abs(row.lcAfter)).toBe(Math.max(whiteLc, nearBlackLc));
  });

  it('reports a non-hex foreground as unverifiable instead of skipping silently', () => {
    const result = enforceTextContrast(
      {
        '--ds-sidebar-text': 'var(--ds-color-text-primary)',
        '--ds-sidebar-bg': '#1B1E24',
      },
      {}
    );
    expect(result.adjustments).toEqual([]);
    expect(result.unverifiable).toEqual([
      {
        token: '--ds-sidebar-text',
        pairedWith: '--ds-sidebar-bg',
        value: 'var(--ds-color-text-primary)',
        reason: 'non-hex-foreground',
      },
    ]);
    expect(result.variables['--ds-sidebar-text']).toBe('var(--ds-color-text-primary)');
  });

  it('reports a non-hex ground as unverifiable', () => {
    const result = enforceTextContrast(
      {
        '--ds-button-error-color': '#FFFFFF',
        '--ds-button-error-bg': 'color-mix(in oklch, #B4232A 80%, #000000)',
      },
      {}
    );
    expect(result.unverifiable).toEqual([
      {
        token: '--ds-button-error-color',
        pairedWith: '--ds-button-error-bg',
        value: 'color-mix(in oklch, #B4232A 80%, #000000)',
        reason: 'non-hex-ground',
      },
    ]);
  });

  it('is inapplicable when a chrome ground chain is entirely unauthored', () => {
    const variables = { '--ds-button-primary-color': '#CCCCCC' };
    const result = enforceTextContrast(variables, {});
    expect(result.variables).toEqual(variables);
    expect(result.adjustments).toEqual([]);
    expect(result.unverifiable).toEqual([]);
  });

  it('verifies text-primary against the default light page ground when unauthored', () => {
    const result = enforceTextContrast({ '--ds-color-text-primary': '#CCCCCC' }, {});
    expect(result.adjustments).toHaveLength(1);
    const row = result.adjustments[0];
    expect(row.pairedWith).toBe('default:#FFFFFF');
    expect(Math.abs(apcaContrast(row.to, '#FFFFFF'))).toBeGreaterThanOrEqual(
      TEXT_CONTRAST_PRIMARY_TEXT_MIN_LC
    );
  });

  it('verifies text-primary against the default dark page ground in dark mode', () => {
    const result = enforceTextContrast(
      { '--ds-color-text-primary': '#4A4A4A' },
      { general: { palette: { backgroundMode: 'dark' } } }
    );
    expect(result.adjustments).toHaveLength(1);
    const row = result.adjustments[0];
    expect(row.pairedWith).toBe('default:#0C0C0E');
    expect(hexToOklch(row.to).l).toBeGreaterThan(hexToOklch('#4A4A4A').l);
    expect(Math.abs(apcaContrast(row.to, '#0C0C0E'))).toBeGreaterThanOrEqual(
      TEXT_CONTRAST_PRIMARY_TEXT_MIN_LC
    );
  });

  it('resolves the text-primary ground through the authored chain in order', () => {
    const result = enforceTextContrast(
      {
        '--ds-color-text-primary': '#AFAFAF',
        '--ds-color-background': '#F4F6F8',
      },
      {}
    );
    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0].pairedWith).toBe('--ds-color-background');
  });

  it('uses the Lc 75 threshold for text-primary', () => {
    // #777777 on white: |Lc| sits between 60 and 75, so only the stricter
    // text-primary pairing corrects it.
    const fg = '#777777';
    const lc = Math.abs(apcaContrast(fg, '#FFFFFF'));
    expect(lc).toBeGreaterThanOrEqual(60);
    expect(lc).toBeLessThan(75);

    const asCardTitle = enforceTextContrast(
      { '--ds-card-title-color': fg, '--ds-card-bg': '#FFFFFF' },
      {}
    );
    expect(asCardTitle.adjustments).toEqual([]);

    const asTextPrimary = enforceTextContrast(
      { '--ds-color-text-primary': fg, '--ds-color-bg-primary': '#FFFFFF' },
      {}
    );
    expect(asTextPrimary.adjustments).toHaveLength(1);
  });

  it('checks every governed pairing family', () => {
    const tokens = TEXT_CONTRAST_PAIRINGS.map((pairing) => pairing.token);
    for (const variant of ['primary', 'secondary', 'success', 'warning', 'error', 'info']) {
      expect(tokens).toContain(`--ds-button-${variant}-color`);
    }
    expect(tokens).toContain('--ds-table-header-color');
    expect(tokens).toContain('--ds-sidebar-text');
    expect(tokens).toContain('--ds-sidebar-item-color-active');
    expect(tokens).toContain('--ds-color-text-primary');
    expect(tokens).toContain('--ds-color-text-secondary');
    expect(tokens).toContain('--ds-color-text-muted');
    expect(tokens).toContain('--ds-color-text-disabled');
    for (const role of ['canvas', 'shell', 'panel', 'card', 'inset', 'control', 'raised', 'overlay']) {
      expect(tokens).toContain(`--ds-material-${role}-foreground`);
      expect(tokens).toContain(`--ds-material-${role}-foreground-muted`);
      expect(tokens).toContain(`--ds-material-${role}-foreground-disabled`);
    }
    expect(tokens).toContain('--ds-card-title-color');
    expect(tokens).toContain('--ds-card-body-color');
  });

  it('is deterministic: identical inputs produce byte-identical results', () => {
    const variables = {
      '--ds-button-primary-color': '#8FA0B5',
      '--ds-button-primary-bg': '#EDF1F6',
      '--ds-color-text-primary': '#B0B4BA',
    };
    const first = enforceTextContrast(variables, { general: { palette: { backgroundMode: 'light' } } });
    const second = enforceTextContrast(variables, { general: { palette: { backgroundMode: 'light' } } });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('property: 200 seeded random pairs all reach threshold or the strongest achievable fallback', () => {
    const next = mulberry32(0x5eed);
    const [white, nearBlack] = TEXT_CONTRAST_FALLBACK_CANDIDATES;

    for (let i = 0; i < 200; i += 1) {
      const fg = randomHex(next);
      const bg = randomHex(next);
      const result = enforceTextContrast(
        { '--ds-button-primary-color': fg, '--ds-button-primary-bg': bg },
        {}
      );

      expect(result.unverifiable).toEqual([]);

      if (result.adjustments.length === 0) {
        expect(Math.abs(apcaContrast(fg, bg))).toBeGreaterThanOrEqual(60);
        expect(result.variables['--ds-button-primary-color']).toBe(fg);
        continue;
      }

      expect(result.adjustments).toHaveLength(1);
      const row = result.adjustments[0];
      const applied = result.variables['--ds-button-primary-color'];
      expect(row.to).toBe(applied);
      expect(row.lcAfter).toBe(apcaContrast(applied, bg));

      if (Math.abs(row.lcAfter) >= 60) continue;

      // Below threshold is honest only when NO extreme can reach it either.
      const bestExtreme = Math.max(
        Math.abs(apcaContrast(white, bg)),
        Math.abs(apcaContrast(nearBlack, bg))
      );
      expect(bestExtreme).toBeLessThan(60);
      expect(Math.abs(row.lcAfter)).toBe(bestExtreme);
    }
  });
});
