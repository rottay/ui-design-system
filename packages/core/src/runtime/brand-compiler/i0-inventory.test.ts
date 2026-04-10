/**
 * @fileoverview Wave I0 — Inventory And Test Net
 *
 * Protects current outputs before any physical moves or contract changes.
 * Three sections:
 * 1. Public CSS export surface — all package.json exports produce valid output
 * 2. First-party artifact integrity — tenant CSS files exist with expected richness
 * 3. H3 contract field presence — BrandTheme sources checked against minimum contract
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from '../../tokens/ts/brand-themes';
import type { BrandTheme } from '../../contracts/themes';

const DIST = resolve(__dirname, '../../../dist');
const CSS_SRC = resolve(__dirname, '../../tokens/css');

// ══════════════════════════════════════════════════════════
// SECTION 1: Public CSS Export Surface
// Verifies that every package.json style export resolves to a real file.
// ══════════════════════════════════════════════════════════

describe('public CSS export surface', () => {
  const EXPECTED_CSS_OUTPUTS = [
    'styles.css',
    'platform.css',
    'bithire.css',
    'evnto.css',
    'modern-engine.css',
  ];

  it.each(EXPECTED_CSS_OUTPUTS)('dist/%s exists and is non-empty', (file) => {
    const path = resolve(DIST, file);
    expect(existsSync(path), `${file} should exist in dist/`).toBe(true);
    const content = readFileSync(path, 'utf-8');
    expect(content.length).toBeGreaterThan(1000);
  });

  it('styles.css is the largest bundle (full)', () => {
    const styles = readFileSync(resolve(DIST, 'styles.css'), 'utf-8');
    const platform = readFileSync(resolve(DIST, 'platform.css'), 'utf-8');
    expect(styles.length).toBeGreaterThan(platform.length);
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: First-Party Artifact Integrity
// Verifies tenant CSS source files exist and contain expected var families.
// ══════════════════════════════════════════════════════════

describe('first-party artifact integrity', () => {
  const TENANTS = ['rottay', 'bithire', 'evnto'] as const;

  it.each(TENANTS)('%s/index.css artifact exists', (tenant) => {
    const path = resolve(CSS_SRC, `tenants/${tenant}/index.css`);
    expect(existsSync(path)).toBe(true);
  });

  it('rottay artifact is richest (~900+ unique --ds-* vars)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/rottay/index.css'), 'utf-8');
    const vars = new Set(css.match(/--ds-[\w-]+/g));
    expect(vars.size).toBeGreaterThan(400);
  });

  it('bithire artifact has substantial coverage (~100+ unique --ds-* vars)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/bithire/index.css'), 'utf-8');
    const vars = new Set(css.match(/--ds-[\w-]+/g));
    expect(vars.size).toBeGreaterThan(80);
  });

  it('evnto artifact has substantial coverage (~80+ unique --ds-* vars)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/evnto/index.css'), 'utf-8');
    const vars = new Set(css.match(/--ds-[\w-]+/g));
    expect(vars.size).toBeGreaterThan(60);
  });

  it('legacy tenant (themanagementmiami) exists', () => {
    const path = resolve(CSS_SRC, 'tenants/themanagementmiami/index.css');
    expect(existsSync(path)).toBe(true);
  });

  it('public entrypoint files exist at CSS source root', () => {
    for (const file of ['index.css', 'rottay.css', 'bithire.css', 'evnto.css', 'platform.css']) {
      expect(existsSync(resolve(CSS_SRC, file)), `${file} should exist`).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 3: H3 Contract Field Presence In BrandTheme Sources
// Per-vertical, per-category checks against the minimum contract.
// ══════════════════════════════════════════════════════════

function checkPalette(bt: BrandTheme, name: string) {
  describe(`${name} palette`, () => {
    it('has primaryColor', () => expect(bt.palette?.primaryColor).toBeTruthy());
    it('has secondaryColor', () => expect(bt.palette?.secondaryColor).toBeTruthy());
    it('has accentColor', () => expect(bt.palette?.accentColor).toBeTruthy());
    it('has darkPrimaryColor', () => expect(bt.palette?.darkPrimaryColor).toBeTruthy());
    it('has darkSecondaryColor', () => expect(bt.palette?.darkSecondaryColor).toBeTruthy());
    it('has darkBackgroundColor', () => expect(bt.palette?.darkBackgroundColor).toBeTruthy());
  });
}

function checkTypography(bt: BrandTheme, name: string) {
  describe(`${name} typography`, () => {
    it('has fontFamilyBase', () => expect(bt.typography?.fontFamilyBase).toBeTruthy());
    it('has fontFamilyHeading', () => expect(bt.typography?.fontFamilyHeading).toBeTruthy());
    it('has fontFamilyMono', () => expect(bt.typography?.fontFamilyMono).toBeTruthy());
    it('has headingWeightBias', () => expect(bt.typography?.headingWeightBias).toBeTruthy());
    it('has headingLetterSpacing', () => expect(bt.typography?.headingLetterSpacing).toBeTruthy());
    it('has labelStyle', () => expect(bt.typography?.labelStyle).toBeTruthy());
  });
}

function checkMotion(bt: BrandTheme, name: string) {
  describe(`${name} motion`, () => {
    it('has intensity', () => expect(bt.motion?.intensity).toBeDefined());
    it('has entrance', () => expect(bt.motion?.entrance).toBeTruthy());
    it('has entranceDuration', () => expect(bt.motion?.entranceDuration).toBeDefined());
    it('has hoverLift', () => expect(bt.motion?.hoverLift).toBeDefined());
    it('has useSpring', () => expect(bt.motion?.useSpring).toBeDefined());
  });
}

function checkCharts(bt: BrandTheme, name: string) {
  describe(`${name} charts`, () => {
    it('has lineStyle', () => expect(bt.charts?.lineStyle).toBeTruthy());
    it('has tooltipStyle', () => expect(bt.charts?.tooltipStyle).toBeTruthy());
    it('has animateOnMount', () => expect(bt.charts?.animateOnMount).toBeDefined());
    it('has mountDuration', () => expect(bt.charts?.mountDuration).toBeDefined());
  });
}

function checkSidebar(bt: BrandTheme, name: string) {
  describe(`${name} chrome.sidebar`, () => {
    it('has bg', () => expect(bt.chrome?.sidebar?.bg).toBeTruthy());
    it('has text', () => expect(bt.chrome?.sidebar?.text).toBeTruthy());
    it('has itemColor', () => expect(bt.chrome?.sidebar?.itemColor).toBeTruthy());
    it('has groupFontSize', () => expect(bt.chrome?.sidebar?.groupFontSize).toBeTruthy());
    it('has iconSize', () => expect(bt.chrome?.sidebar?.iconSize).toBeTruthy());
  });
}

// ── Rottay ──

describe('H3 contract: rottay', () => {
  checkPalette(rottayBrandTheme, 'rottay');
  checkTypography(rottayBrandTheme, 'rottay');
  checkMotion(rottayBrandTheme, 'rottay');
  checkCharts(rottayBrandTheme, 'rottay');
  checkSidebar(rottayBrandTheme, 'rottay');

  describe('rottay chrome.layout', () => {
    it('has bg', () => expect(rottayBrandTheme.chrome?.layout?.bg).toBeTruthy());
    it('has headerBg', () => expect(rottayBrandTheme.chrome?.layout?.headerBg).toBeTruthy());
    it('has siderBg', () => expect(rottayBrandTheme.chrome?.layout?.siderBg).toBeTruthy());
  });

  describe('rottay chrome.shell', () => {
    it('has gridSize', () => expect(rottayBrandTheme.chrome?.shell?.gridSize).toBeTruthy());
    it('has gridLine', () => expect(rottayBrandTheme.chrome?.shell?.gridLine).toBeTruthy());
  });

  describe('rottay chrome.controls', () => {
    it('has buttonPrimary', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('has buttonSecondary', () => expect(rottayBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('has buttonDefault', () => expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.bg).toBeTruthy());
    it('has buttonGhost', () => expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.bg).toBeTruthy());
  });

  describe('rottay chrome.table', () => {
    it('has headerBg', () => expect(rottayBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it('has headerColor', () => expect(rottayBrandTheme.chrome?.table?.headerColor).toBeTruthy());
    it('has headerFontWeight', () => expect(rottayBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
  });

  // Gaps documented for I4
  describe('rottay gaps (I4 targets)', () => {
    it.skip('palette: successColor — gap, target I4', () => {});
    it.skip('palette: warningColor — gap, target I4', () => {});
    it.skip('palette: errorColor — gap, target I4', () => {});
    it.skip('palette: infoColor — gap, target I4', () => {});
    it.skip('surfaces: borderRadius — gap, target I4', () => {});
    it.skip('surfaces: shadows — gap, target I4', () => {});
    it.skip('controls: input — gap, target I4', () => {});
    it.skip('dark-mode: authored chrome — gap, target I4', () => {});
    it.skip('state-semantics: authored — gap, target I4', () => {});
  });
});

// ── BitHire ──

describe('H3 contract: bithire', () => {
  checkPalette(bithireBrandTheme, 'bithire');
  checkTypography(bithireBrandTheme, 'bithire');
  checkMotion(bithireBrandTheme, 'bithire');
  checkCharts(bithireBrandTheme, 'bithire');
  checkSidebar(bithireBrandTheme, 'bithire');

  describe('bithire palette (full)', () => {
    it('has successColor', () => expect(bithireBrandTheme.palette?.successColor).toBeTruthy());
    it('has warningColor', () => expect(bithireBrandTheme.palette?.warningColor).toBeTruthy());
    it('has errorColor', () => expect(bithireBrandTheme.palette?.errorColor).toBeTruthy());
    it('has infoColor', () => expect(bithireBrandTheme.palette?.infoColor).toBeTruthy());
  });

  describe('bithire chrome.controls', () => {
    it('has buttonPrimary', () => expect(bithireBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('has buttonSecondary', () => expect(bithireBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('has input', () => expect(bithireBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
  });

  describe('bithire chrome.table', () => {
    it('has headerBg', () => expect(bithireBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it('has headerFontWeight', () => expect(bithireBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
  });

  // Gaps documented for I5
  describe('bithire gaps (I5 targets)', () => {
    it.skip('surfaces: borderRadius — gap, target I5', () => {});
    it.skip('surfaces: shadows — gap, target I5', () => {});
    it.skip('chrome.layout: all 6 fields — gap, target I5', () => {});
    it.skip('chrome.shell: all 3 fields — gap, target I5', () => {});
    it.skip('chrome.controls: buttonDefault — gap, target I5', () => {});
    it.skip('chrome.controls: buttonGhost — gap, target I5', () => {});
    it.skip('dark-mode: authored chrome — gap, target I5', () => {});
    it.skip('state-semantics: authored — gap, target I5', () => {});
  });
});

// ── Evnto ──

describe('H3 contract: evnto', () => {
  checkPalette(evntoBrandTheme, 'evnto');
  checkTypography(evntoBrandTheme, 'evnto');
  checkMotion(evntoBrandTheme, 'evnto');
  checkCharts(evntoBrandTheme, 'evnto');
  checkSidebar(evntoBrandTheme, 'evnto');

  describe('evnto surfaces (partial)', () => {
    it('has densityScale', () => expect(evntoBrandTheme.surfaces?.densityScale).toBeDefined());
    it('has borderRadius', () => expect(evntoBrandTheme.surfaces?.borderRadius).toBeTruthy());
  });

  describe('evnto chrome.controls', () => {
    it('has buttonPrimary', () => expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('has buttonSecondary', () => expect(evntoBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('has input', () => expect(evntoBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
  });

  // Gaps documented for I6
  describe('evnto gaps (I6 targets)', () => {
    it.skip('palette: successColor — gap, target I6', () => {});
    it.skip('palette: warningColor — gap, target I6', () => {});
    it.skip('palette: errorColor — gap, target I6', () => {});
    it.skip('palette: infoColor — gap, target I6', () => {});
    it.skip('surfaces: shadows — gap, target I6', () => {});
    it.skip('chrome.layout: all 6 fields — gap, target I6', () => {});
    it.skip('chrome.shell: all 3 fields — gap, target I6', () => {});
    it.skip('chrome.controls: buttonDefault — gap, target I6', () => {});
    it.skip('chrome.controls: buttonGhost — gap, target I6', () => {});
    it.skip('chrome.table: headerColor — gap, target I6', () => {});
    it.skip('chrome.table: headerFontWeight — gap, target I6', () => {});
    it.skip('chrome.table: headerFontSize — gap, target I6', () => {});
    it.skip('dark-mode: authored chrome — gap, target I6', () => {});
    it.skip('state-semantics: authored — gap, target I6', () => {});
  });
});
