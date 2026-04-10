/**
 * @fileoverview Wave I0 — Inventory And Test Net
 *
 * Protects current outputs before any physical moves or contract changes.
 * 1. Public CSS export surface — driven from real package.json exports
 * 2. First-party artifact integrity — tenant CSS files with richness checks
 * 3. H3 contract field presence — every contract field checked per vertical
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from '../../tokens/ts/brand-themes';
import type { BrandTheme } from '../../contracts/themes';

const DIST = resolve(__dirname, '../../../dist');
const CSS_SRC = resolve(__dirname, '../../tokens/css');
const PKG_JSON = JSON.parse(readFileSync(resolve(__dirname, '../../../package.json'), 'utf-8'));

// ══════════════════════════════════════════════════════════
// SECTION 1: Public CSS Export Surface (driven from package.json)
// ══════════════════════════════════════════════════════════

describe('public CSS export surface (from package.json)', () => {
  // Extract all style subpaths and their dist targets from real exports
  const styleExports: Array<[string, string]> = [];
  for (const [subpath, value] of Object.entries(PKG_JSON.exports ?? {})) {
    if (!subpath.startsWith('./styles') && subpath !== './dist/*.css') continue;
    if (subpath === './dist/*.css') continue; // glob, not a specific file
    const target = typeof value === 'string' ? value : (value as any)?.style ?? (value as any)?.default;
    if (target && typeof target === 'string') {
      styleExports.push([subpath, target.replace('./', '')]);
    }
  }

  it('package.json has at least 7 style exports', () => {
    expect(styleExports.length).toBeGreaterThanOrEqual(7);
  });

  it.each(styleExports)(
    'export %s -> %s exists and is non-empty',
    (_subpath, distTarget) => {
      const path = resolve(__dirname, '../../..', distTarget);
      expect(existsSync(path), `${distTarget} must exist`).toBe(true);
      const content = readFileSync(path, 'utf-8');
      expect(content.length).toBeGreaterThan(1000);
    }
  );

  it('./styles/rottay and ./styles/platform resolve to same dist file', () => {
    const rottayTarget = styleExports.find(([s]) => s === './styles/rottay')?.[1];
    const platformTarget = styleExports.find(([s]) => s === './styles/platform')?.[1];
    expect(rottayTarget).toBe(platformTarget);
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 2: First-Party Artifact Integrity
// ══════════════════════════════════════════════════════════

describe('first-party artifact integrity', () => {
  const TENANTS = ['rottay', 'bithire', 'evnto'] as const;

  it.each(TENANTS)('%s/index.css artifact exists', (tenant) => {
    expect(existsSync(resolve(CSS_SRC, `tenants/${tenant}/index.css`))).toBe(true);
  });

  it('rottay artifact is richest (400+ unique --ds-* vars)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/rottay/index.css'), 'utf-8');
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(400);
  });

  it('bithire artifact has substantial coverage (80+)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/bithire/index.css'), 'utf-8');
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(80);
  });

  it('evnto artifact has substantial coverage (60+)', () => {
    const css = readFileSync(resolve(CSS_SRC, 'tenants/evnto/index.css'), 'utf-8');
    expect(new Set(css.match(/--ds-[\w-]+/g)).size).toBeGreaterThan(60);
  });

  it('legacy tenant (themanagementmiami) exists', () => {
    expect(existsSync(resolve(CSS_SRC, 'tenants/themanagementmiami/index.css'))).toBe(true);
  });

  it('public entrypoint source files exist', () => {
    for (const f of ['index.css', 'rottay.css', 'bithire.css', 'evnto.css', 'platform.css']) {
      expect(existsSync(resolve(CSS_SRC, f)), `${f} must exist`).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════
// SECTION 3: H3 Contract — every field, every vertical
// Green for present fields, it.skip for documented gaps.
// ══════════════════════════════════════════════════════════

// ── Shared checkers for fields present in ALL three verticals ──

function checkPaletteBase(bt: BrandTheme, name: string) {
  describe(`${name} palette (base)`, () => {
    it('primaryColor', () => expect(bt.palette?.primaryColor).toBeTruthy());
    it('secondaryColor', () => expect(bt.palette?.secondaryColor).toBeTruthy());
    it('accentColor', () => expect(bt.palette?.accentColor).toBeTruthy());
    it('darkPrimaryColor', () => expect(bt.palette?.darkPrimaryColor).toBeTruthy());
    it('darkSecondaryColor', () => expect(bt.palette?.darkSecondaryColor).toBeTruthy());
    it('darkBackgroundColor', () => expect(bt.palette?.darkBackgroundColor).toBeTruthy());
  });
}

function checkTypography(bt: BrandTheme, name: string) {
  describe(`${name} typography`, () => {
    it('fontFamilyBase', () => expect(bt.typography?.fontFamilyBase).toBeTruthy());
    it('fontFamilyHeading', () => expect(bt.typography?.fontFamilyHeading).toBeTruthy());
    it('fontFamilyMono', () => expect(bt.typography?.fontFamilyMono).toBeTruthy());
    it('headingWeightBias', () => expect(bt.typography?.headingWeightBias).toBeTruthy());
    it('headingLetterSpacing', () => expect(bt.typography?.headingLetterSpacing).toBeTruthy());
    it('labelStyle', () => expect(bt.typography?.labelStyle).toBeTruthy());
  });
}

function checkMotion(bt: BrandTheme, name: string) {
  describe(`${name} motion`, () => {
    it('intensity', () => expect(bt.motion?.intensity).toBeDefined());
    it('entrance', () => expect(bt.motion?.entrance).toBeTruthy());
    it('entranceDuration', () => expect(bt.motion?.entranceDuration).toBeDefined());
    it('hoverLift', () => expect(bt.motion?.hoverLift).toBeDefined());
    it('hoverScale', () => expect(bt.motion?.hoverScale).toBeDefined());
    it('useSpring', () => expect(bt.motion?.useSpring).toBeDefined());
    it('springTension', () => expect(bt.motion?.springTension).toBeDefined());
    it('springFriction', () => expect(bt.motion?.springFriction).toBeDefined());
    it('staggerDelay', () => expect(bt.motion?.staggerDelay).toBeDefined());
    it('staggerMax', () => expect(bt.motion?.staggerMax).toBeDefined());
    it('pulseSpeed', () => expect(bt.motion?.pulseSpeed).toBeTruthy());
    it('skeletonStyle', () => expect(bt.motion?.skeletonStyle).toBeTruthy());
    it('countUpEnabled', () => expect(bt.motion?.countUpEnabled).toBeDefined());
  });
}

function checkCharts(bt: BrandTheme, name: string) {
  describe(`${name} charts`, () => {
    it('lineStyle', () => expect(bt.charts?.lineStyle).toBeTruthy());
    it('tooltipStyle', () => expect(bt.charts?.tooltipStyle).toBeTruthy());
    it('useGradientFill', () => expect(bt.charts?.useGradientFill).toBeDefined());
    it('showDots', () => expect(bt.charts?.showDots).toBeDefined());
    it('animateOnMount', () => expect(bt.charts?.animateOnMount).toBeDefined());
    it('mountDuration', () => expect(bt.charts?.mountDuration).toBeDefined());
  });
}

function checkSidebar(bt: BrandTheme, name: string) {
  describe(`${name} chrome.sidebar`, () => {
    it('bg', () => expect(bt.chrome?.sidebar?.bg).toBeTruthy());
    it('text', () => expect(bt.chrome?.sidebar?.text).toBeTruthy());
    it('textMuted', () => expect(bt.chrome?.sidebar?.textMuted).toBeTruthy());
    it('groupFontSize', () => expect(bt.chrome?.sidebar?.groupFontSize).toBeTruthy());
    it('groupFontWeight', () => expect(bt.chrome?.sidebar?.groupFontWeight).toBeDefined());
    it('groupColor', () => expect(bt.chrome?.sidebar?.groupColor).toBeTruthy());
    it('groupLetterSpacing', () => expect(bt.chrome?.sidebar?.groupLetterSpacing).toBeTruthy());
    it('itemFontSize', () => expect(bt.chrome?.sidebar?.itemFontSize).toBeTruthy());
    it('itemFontWeight', () => expect(bt.chrome?.sidebar?.itemFontWeight).toBeDefined());
    it('itemFontWeightActive', () => expect(bt.chrome?.sidebar?.itemFontWeightActive).toBeDefined());
    it('itemColor', () => expect(bt.chrome?.sidebar?.itemColor).toBeTruthy());
    it('itemColorActive', () => expect(bt.chrome?.sidebar?.itemColorActive).toBeTruthy());
    it('itemBgActive', () => expect(bt.chrome?.sidebar?.itemBgActive).toBeTruthy());
    it('itemBgHover', () => expect(bt.chrome?.sidebar?.itemBgHover).toBeTruthy());
    it('itemPadding', () => expect(bt.chrome?.sidebar?.itemPadding).toBeTruthy());
    it('iconSize', () => expect(bt.chrome?.sidebar?.iconSize).toBeTruthy());
  });
}

// ── Rottay ──

describe('H3 contract: rottay', () => {
  checkPaletteBase(rottayBrandTheme, 'rottay');
  checkTypography(rottayBrandTheme, 'rottay');
  checkMotion(rottayBrandTheme, 'rottay');
  checkCharts(rottayBrandTheme, 'rottay');
  checkSidebar(rottayBrandTheme, 'rottay');

  describe('rottay surfaces', () => {
    it('densityScale', () => expect(rottayBrandTheme.surfaces?.densityScale).toBeDefined());
    it.skip('borderRadius — gap, target I4', () => {});
    it.skip('shadows — gap, target I4', () => {});
    it.skip('glass — gap, target I4', () => {});
    it.skip('gradients — gap, target I4', () => {});
    it.skip('overlays — gap, target I4', () => {});
  });

  describe('rottay chrome.layout', () => {
    it('bg', () => expect(rottayBrandTheme.chrome?.layout?.bg).toBeTruthy());
    it('headerBg', () => expect(rottayBrandTheme.chrome?.layout?.headerBg).toBeTruthy());
    it('headerBackdrop', () => expect(rottayBrandTheme.chrome?.layout?.headerBackdrop).toBeTruthy());
    it('headerBorder', () => expect(rottayBrandTheme.chrome?.layout?.headerBorder).toBeTruthy());
    it('siderBg', () => expect(rottayBrandTheme.chrome?.layout?.siderBg).toBeTruthy());
    it('siderBorder', () => expect(rottayBrandTheme.chrome?.layout?.siderBorder).toBeTruthy());
  });

  describe('rottay chrome.shell', () => {
    it('gridSize', () => expect(rottayBrandTheme.chrome?.shell?.gridSize).toBeTruthy());
    it('gridLine', () => expect(rottayBrandTheme.chrome?.shell?.gridLine).toBeTruthy());
    it('gridOpacity', () => expect(rottayBrandTheme.chrome?.shell?.gridOpacity).toBeDefined());
  });

  describe('rottay chrome.controls', () => {
    it('buttonPrimary.bg', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('buttonPrimary.bgHover', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.bgHover).toBeTruthy());
    it('buttonPrimary.text', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.text).toBeTruthy());
    it('buttonPrimary.border', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.border).toBeTruthy());
    it('buttonPrimary.shadow', () => expect(rottayBrandTheme.chrome?.controls?.buttonPrimary?.shadow).toBeTruthy());
    it('buttonSecondary.bg', () => expect(rottayBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('buttonSecondary.bgHover', () => expect(rottayBrandTheme.chrome?.controls?.buttonSecondary?.bgHover).toBeTruthy());
    it('buttonSecondary.text', () => expect(rottayBrandTheme.chrome?.controls?.buttonSecondary?.text).toBeTruthy());
    it('buttonSecondary.border', () => expect(rottayBrandTheme.chrome?.controls?.buttonSecondary?.border).toBeTruthy());
    it('buttonDefault.bg', () => expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.bg).toBeTruthy());
    it('buttonDefault.bgHover', () => expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.bgHover).toBeTruthy());
    it('buttonDefault.text', () => expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.text).toBeTruthy());
    it('buttonDefault.border', () => expect(rottayBrandTheme.chrome?.controls?.buttonDefault?.border).toBeTruthy());
    it('buttonGhost.bg', () => expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.bg).toBeTruthy());
    it('buttonGhost.bgHover', () => expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.bgHover).toBeTruthy());
    it('buttonGhost.text', () => expect(rottayBrandTheme.chrome?.controls?.buttonGhost?.text).toBeTruthy());
    it.skip('input.bg — gap, target I4', () => {});
    it.skip('input.border — gap, target I4', () => {});
    it.skip('input.borderFocus — gap, target I4', () => {});
    it.skip('input.shadowFocus — gap, target I4', () => {});
  });

  describe('rottay chrome.table', () => {
    it('headerBg', () => expect(rottayBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it('headerColor', () => expect(rottayBrandTheme.chrome?.table?.headerColor).toBeTruthy());
    it('headerFontWeight', () => expect(rottayBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
    it('headerFontSize', () => expect(rottayBrandTheme.chrome?.table?.headerFontSize).toBeTruthy());
  });

  describe('rottay palette (gaps)', () => {
    it.skip('successColor — gap, target I4', () => {});
    it.skip('warningColor — gap, target I4', () => {});
    it.skip('errorColor — gap, target I4', () => {});
    it.skip('infoColor — gap, target I4', () => {});
  });

  describe('rottay cross-cutting (gaps)', () => {
    it.skip('dark-mode authored chrome — gap, target I4', () => {});
    it.skip('state-semantics authored — gap, target I4', () => {});
  });
});

// ── BitHire ──

describe('H3 contract: bithire', () => {
  checkPaletteBase(bithireBrandTheme, 'bithire');
  checkTypography(bithireBrandTheme, 'bithire');
  checkMotion(bithireBrandTheme, 'bithire');
  checkCharts(bithireBrandTheme, 'bithire');
  checkSidebar(bithireBrandTheme, 'bithire');

  describe('bithire palette (semantic — present)', () => {
    it('successColor', () => expect(bithireBrandTheme.palette?.successColor).toBeTruthy());
    it('warningColor', () => expect(bithireBrandTheme.palette?.warningColor).toBeTruthy());
    it('errorColor', () => expect(bithireBrandTheme.palette?.errorColor).toBeTruthy());
    it('infoColor', () => expect(bithireBrandTheme.palette?.infoColor).toBeTruthy());
  });

  describe('bithire surfaces', () => {
    it('densityScale', () => expect(bithireBrandTheme.surfaces?.densityScale).toBeDefined());
    it.skip('borderRadius — gap, target I5', () => {});
    it.skip('shadows — gap, target I5', () => {});
    it.skip('glass — gap, target I5', () => {});
    it.skip('gradients — gap, target I5', () => {});
    it.skip('overlays — gap, target I5', () => {});
  });

  describe('bithire chrome.controls', () => {
    it('buttonPrimary.bg', () => expect(bithireBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('buttonPrimary.bgHover', () => expect(bithireBrandTheme.chrome?.controls?.buttonPrimary?.bgHover).toBeTruthy());
    it('buttonPrimary.text', () => expect(bithireBrandTheme.chrome?.controls?.buttonPrimary?.text).toBeTruthy());
    it.skip('buttonPrimary.border — gap, target I5', () => {});
    it.skip('buttonPrimary.shadow — gap, target I5', () => {});
    it('buttonSecondary.bg', () => expect(bithireBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('buttonSecondary.bgHover', () => expect(bithireBrandTheme.chrome?.controls?.buttonSecondary?.bgHover).toBeTruthy());
    it('buttonSecondary.text', () => expect(bithireBrandTheme.chrome?.controls?.buttonSecondary?.text).toBeTruthy());
    it('buttonSecondary.border', () => expect(bithireBrandTheme.chrome?.controls?.buttonSecondary?.border).toBeTruthy());
    it.skip('buttonDefault — gap, target I5', () => {});
    it.skip('buttonGhost — gap, target I5', () => {});
    it('input.bg', () => expect(bithireBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
    it('input.border', () => expect(bithireBrandTheme.chrome?.controls?.input?.border).toBeTruthy());
    it('input.borderFocus', () => expect(bithireBrandTheme.chrome?.controls?.input?.borderFocus).toBeTruthy());
    it('input.shadowFocus', () => expect(bithireBrandTheme.chrome?.controls?.input?.shadowFocus).toBeTruthy());
  });

  describe('bithire chrome.table', () => {
    it('headerBg', () => expect(bithireBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it('headerColor', () => expect(bithireBrandTheme.chrome?.table?.headerColor).toBeTruthy());
    it('headerFontWeight', () => expect(bithireBrandTheme.chrome?.table?.headerFontWeight).toBeDefined());
    it('headerFontSize', () => expect(bithireBrandTheme.chrome?.table?.headerFontSize).toBeTruthy());
  });

  describe('bithire chrome (gaps)', () => {
    it.skip('layout — all 6 fields, target I5', () => {});
    it.skip('shell — all 3 fields, target I5', () => {});
  });

  describe('bithire cross-cutting (gaps)', () => {
    it.skip('dark-mode authored chrome — gap, target I5', () => {});
    it.skip('state-semantics authored — gap, target I5', () => {});
  });
});

// ── Evnto ──

describe('H3 contract: evnto', () => {
  checkPaletteBase(evntoBrandTheme, 'evnto');
  checkTypography(evntoBrandTheme, 'evnto');
  checkMotion(evntoBrandTheme, 'evnto');
  checkCharts(evntoBrandTheme, 'evnto');
  checkSidebar(evntoBrandTheme, 'evnto');

  describe('evnto surfaces', () => {
    it('densityScale', () => expect(evntoBrandTheme.surfaces?.densityScale).toBeDefined());
    it('borderRadius', () => expect(evntoBrandTheme.surfaces?.borderRadius).toBeTruthy());
    it.skip('shadows — gap, target I6', () => {});
    it.skip('glass — gap, target I6', () => {});
    it.skip('gradients — gap, target I6', () => {});
    it.skip('overlays — gap, target I6', () => {});
  });

  describe('evnto chrome.controls', () => {
    it('buttonPrimary.bg', () => expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.bg).toBeTruthy());
    it('buttonPrimary.bgHover', () => expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.bgHover).toBeTruthy());
    it('buttonPrimary.text', () => expect(evntoBrandTheme.chrome?.controls?.buttonPrimary?.text).toBeTruthy());
    it.skip('buttonPrimary.border — gap, target I6', () => {});
    it.skip('buttonPrimary.shadow — gap, target I6', () => {});
    it('buttonSecondary.bg', () => expect(evntoBrandTheme.chrome?.controls?.buttonSecondary?.bg).toBeTruthy());
    it('buttonSecondary.bgHover', () => expect(evntoBrandTheme.chrome?.controls?.buttonSecondary?.bgHover).toBeTruthy());
    it('buttonSecondary.text', () => expect(evntoBrandTheme.chrome?.controls?.buttonSecondary?.text).toBeTruthy());
    it('buttonSecondary.border', () => expect(evntoBrandTheme.chrome?.controls?.buttonSecondary?.border).toBeTruthy());
    it.skip('buttonDefault — gap, target I6', () => {});
    it.skip('buttonGhost — gap, target I6', () => {});
    it('input.bg', () => expect(evntoBrandTheme.chrome?.controls?.input?.bg).toBeTruthy());
    it('input.border', () => expect(evntoBrandTheme.chrome?.controls?.input?.border).toBeTruthy());
    it('input.borderFocus', () => expect(evntoBrandTheme.chrome?.controls?.input?.borderFocus).toBeTruthy());
    it('input.shadowFocus', () => expect(evntoBrandTheme.chrome?.controls?.input?.shadowFocus).toBeTruthy());
  });

  describe('evnto chrome.table', () => {
    it('headerBg', () => expect(evntoBrandTheme.chrome?.table?.headerBg).toBeTruthy());
    it.skip('headerColor — gap, target I6', () => {});
    it.skip('headerFontWeight — gap, target I6', () => {});
    it.skip('headerFontSize — gap, target I6', () => {});
  });

  describe('evnto palette (gaps)', () => {
    it.skip('successColor — gap, target I6', () => {});
    it.skip('warningColor — gap, target I6', () => {});
    it.skip('errorColor — gap, target I6', () => {});
    it.skip('infoColor — gap, target I6', () => {});
  });

  describe('evnto chrome (gaps)', () => {
    it.skip('layout — all 6 fields, target I6', () => {});
    it.skip('shell — all 3 fields, target I6', () => {});
  });

  describe('evnto cross-cutting (gaps)', () => {
    it.skip('dark-mode authored chrome — gap, target I6', () => {});
    it.skip('state-semantics authored — gap, target I6', () => {});
  });
});
