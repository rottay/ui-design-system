import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { contrastRatio } from '@/foundation/kernel/color/contrast';
import { cleanup, render, screen } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { themanagementmiamiFlatTheme } from '@tests/fixtures/brand-themes/themanagementmiami';
import { firstPartyFixture } from "@tests/support/theme-lowering";
import { compileFlatThemeThroughDoor } from "@tests/support/theme-door";

import { CodeBlock } from '../index';
import { channelReads, renderedStyle, skinDeclaration } from './paint-reads';

const bithireFlatTheme = firstPartyFixture('bithire');

// --- WCAG helpers for the R2 contrast measurement --------------------------

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/** srgb mix: `weight` fraction of `a`, rest of `b` (mirrors CSS color-mix percentages). */
function srgbMix(a: string, b: string, weight: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return toHex([
    A[0] * weight + B[0] * (1 - weight),
    A[1] * weight + B[1] * (1 - weight),
    A[2] * weight + B[2] * (1 - weight),
  ]);
}

// The inline style objects own the STATIC parts; the interactive copy-button
// part and the scroll region's focus ring are owned by the family skin
// (presentation/components/skin/code-block/index.css). These assertions pin the
// Pass-1/2 ownership contract -- canonical --ds-* tokens only (no phantom
// tokens, no rgba/hex litter) and logical directional properties only
// (no marginRight/textAlign:'right').
const source = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');
const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/code-block/index.css',
  ),
  'utf8',
);

const modernTheme = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/theme/index.css'),
  'utf8',
);
const personality = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/personality/index.css'),
  'utf8',
);

const LABELS = { copyLabel: 'Copy', copiedLabel: 'Copied' };

afterEach(cleanup);

describe('CodeBlock premium contract — Pass 1', () => {
  it('keeps the inline style objects as the single paint owner (no theme.css/personality bridge)', () => {
    expect(modernTheme).not.toContain('.ds-code-block');
    expect(personality).not.toContain('.ds-code-block');
  });

  it('paints only through canonical --ds-* tokens: no phantom tokens, no rgba/hex fallback litter', () => {
    expect(source).not.toMatch(/rgba\(/);
    expect(source).not.toMatch(/#(?:[0-9a-fA-F]{3}){1,2}\b/);
    // Phantom tokens that previously fell through to the gray litter.
    expect(source).not.toContain('--ds-color-surface-sunken');
    expect(source).not.toContain('--ds-color-fill-secondary');
    expect(source).not.toContain('--ds-color-warning-subtle');
    // Canonical owners.
    expect(source).toContain('var(--ds-surface-inset)');
    expect(source).toContain('var(--ds-color-border)');
    expect(source).toContain('var(--ds-color-text-tertiary)');
  });

  it('uses logical directional properties for the gutter (RTL-safe without a markup branch)', () => {
    expect(source).not.toMatch(/margin(Right|Left)\b/);
    expect(source).not.toContain("textAlign: 'right'");
    expect(source).not.toContain("textAlign: 'left'");
    expect(source).toContain("marginInlineEnd: 'var(--ds-spacing-3)'");
    expect(source).toContain("textAlign: 'end'");
  });

  it('renders the gutter toward the code in both writing directions', () => {
    const code = 'one\ntwo\nthree';
    const { container, rerender } = render(
      <div dir="ltr">
        <CodeBlock code={code} showLineNumbers {...LABELS} />
      </div>,
    );
    expect(container.querySelectorAll('[data-part="line-number"]')).toHaveLength(3);

    rerender(
      <div dir="rtl">
        <CodeBlock code={code} showLineNumbers {...LABELS} />
      </div>,
    );
    // Same anatomy, no direction branch: the flip is carried by logical CSS.
    expect(container.querySelectorAll('[data-part="line-number"]')).toHaveLength(3);
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('marks highlighted lines through data attributes, with the band painted from the warning token', () => {
    const { container } = render(
      <CodeBlock code={'a\nb\nc'} highlightLines={[2]} {...LABELS} />,
    );
    const band = container.querySelector('[data-highlighted="true"]');
    expect(band).not.toBeNull();
    expect(source).toContain('color-mix(in srgb, var(--ds-color-warning) 14%, transparent)');
  });

  it('keeps long wrapped lines and empty lines intact in the DOM', () => {
    const longLine = `const endpoint = "${'https://api.example.test/'.repeat(6)}?page[size]=25";`;
    const { container } = render(
      <CodeBlock code={`first\n\n${longLine}\nlast`} wrap showLineNumbers {...LABELS} />,
    );
    // Four rendered lines: the empty line keeps its row via the zero-width space.
    expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(4);
    expect(container.textContent).toContain(longLine);
  });
});

describe('CodeBlock remediation (K4-B)', () => {
  it('moves the interactive copy-button part to the family skin with the certified hover grammar (Pass 2)', () => {
    const { container } = render(<CodeBlock code={'payload'} {...LABELS} />);
    const button = screen.getByRole('button', { name: 'Copy' });
    // No inline paint survives on the part: the skin owns it wholesale.
    expect(button.getAttribute('style')).toBeNull();
    expect(container.querySelector('[data-part="copy-button"]')).toBe(button);

    // Static paint transcribed verbatim; ghost-hover law; the press and the
    // focus ring (shared by the button and the scroll region) read governed
    // channels only; forced-colors contract.
    expect(skin).toContain('border: 1px solid var(--ds-color-border)');
    expect(skin).toContain('color: var(--ds-color-text-secondary)');
    const hover = skinDeclaration("[data-part='copy-button']:not(:disabled):hover", 'background');
    expect(channelReads(hover)).toEqual(['--ds-button-ghost-bg-hover', '--ds-surface-inset']);
    const hoverInk = skinDeclaration("[data-part='copy-button']:not(:disabled):hover", 'color');
    expect(hoverInk).toBe('var(--ds-color-text-primary)');
    const pressed = skinDeclaration("[data-part='copy-button']:active:not(:disabled)", 'background');
    expect(pressed).toBe('color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)');
    expect(channelReads(pressed)).toEqual(['--ds-color-text-primary']);
    expect(skin).toContain("[data-part='scroll']:focus-visible");
    const ring = skinDeclaration("[data-part='copy-button']:focus-visible", 'box-shadow');
    expect(ring).toBe('0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 24%, transparent)');
    expect(channelReads(ring)).toEqual(['--ds-focus-ring-width', '--ds-color-primary']);
    expect(skinDeclaration("[data-part='scroll']:focus-visible", 'box-shadow')).toBe(ring);
    expect(skin).toContain('@media (forced-colors: active)');
    // CI-1 checker fix: excludes the `@media (prefers-reduced-motion: reduce)`
    // block from the scan. `!important` there is the standard accessibility
    // pattern (449ad4ba95, 2026-08-10 -- predates this test's own last touch)
    // that guarantees the motion-kill wins regardless of any competing
    // specificity; it is not the K4-B remediation's own CSS gaining
    // unwanted specificity, which is what this assertion is actually
    // guarding against and still catches everywhere else in the file.
    expect(
      skin
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/, ''),
    ).not.toContain('!important');
  });

  it('makes the scroll region keyboard-focusable with an accessible name when scrolling can engage (axe scrollable-region-focusable, R4)', () => {
    const { container, rerender } = render(<CodeBlock code={'a\nb'} {...LABELS} />);
    let scroll = container.querySelector<HTMLElement>('[data-part="scroll"]')!;
    expect(scrollableAttr(scroll)).toEqual({ role: 'region', tabIndex: '0', name: 'Code block' });

    // wrap without maxHeight never scrolls: no tab stop, no landmark noise.
    rerender(<CodeBlock code={'a\nb'} wrap {...LABELS} />);
    scroll = container.querySelector<HTMLElement>('[data-part="scroll"]')!;
    expect(scroll.getAttribute('tabindex')).toBeNull();
    expect(scroll.getAttribute('role')).toBeNull();
    expect(scroll.getAttribute('aria-label')).toBeNull();

    // maxHeight engages vertical scrolling: the region is focusable again.
    rerender(<CodeBlock code={'a\nb'} wrap maxHeight={120} {...LABELS} />);
    scroll = container.querySelector<HTMLElement>('[data-part="scroll"]')!;
    expect(scrollableAttr(scroll)).toEqual({ role: 'region', tabIndex: '0', name: 'Code block' });
  });

  it('keeps scrolling on the focusable region when a host reset makes every pre a scroller', () => {
    // antd's reset ships `pre { overflow: auto }`; the unfocusable pre then
    // captured the scroll and axe reported scrollable-region-focusable.
    const reset = document.createElement('style');
    reset.textContent = 'pre { overflow: auto; }';
    document.head.appendChild(reset);
    try {
      const { container } = render(<CodeBlock code={'a\nb'} {...LABELS} />);
      const pre = container.querySelector<HTMLElement>('[data-part="pre"]')!;
      expect(pre.parentElement!.getAttribute('data-part')).toBe('scroll');
      // An inline declaration outranks any non-important author reset.
      expect(pre.style.overflow).toBe('visible');
      expect(getComputedStyle(pre).overflow).toBe('visible');
      expect(pre.hasAttribute('tabindex')).toBe(false);
    } finally {
      reset.remove();
    }
  });

  it('resolves the scroll-region name through the guarded i18n channel', () => {
    const { container } = render(
      <I18nProvider
        locale="es"
        customTranslations={{ components: { codeBlock: { regionLabel: 'Bloque de código' } } }}
      >
        <CodeBlock code={'a'} {...LABELS} />
      </I18nProvider>,
    );
    expect(
      container.querySelector<HTMLElement>('[data-part="scroll"]')!.getAttribute('aria-label'),
    ).toBe('Bloque de código');
  });

  it('measures the gutter ink pair on the source that still governs one (CONTRAST LAW, R2)', () => {
    // The gutter renders the measured mix, read from the two governed inks only.
    const gutterInk = renderedStyle(
      <CodeBlock code={'a\nb'} showLineNumbers {...LABELS} />,
      'line-number',
      'color',
    );
    expect(gutterInk).toBe(
      'color-mix(in srgb, var(--ds-color-text-tertiary) 55%, var(--ds-color-text-primary))',
    );
    expect(channelReads(gutterInk)).toEqual(['--ds-color-text-tertiary', '--ds-color-text-primary']);

    const bithire = compileFlatThemeThroughDoor({ flatTheme: bithireFlatTheme, tenantSlug: 'bithire' });
    const tmm = compileFlatThemeThroughDoor({
      flatTheme: themanagementmiamiFlatTheme,
      tenantSlug: 'themanagementmiami',
    });

    // WO-DER-06 derivation-lane registry (D6-2c-ii, 2026-09-15): --ds-surface-inset
    // and --ds-color-text-primary on the composed first-party baselines (pending
    // DT registration); pinned to the measured state until the lane lands.
    //
    // Tenant-document compiles over neutral + preset, and no preset decision
    // produces a surface role or a root ink, so the vertical declares neither the
    // inset surface it used to author (#EDF3F7) nor a primary ink. TMM rode that
    // vertical base for the surface and so has lost it too; its own primary ink
    // is authored and survives, which is the one governed pair left to measure.
    expect(bithire.cssVariables['--ds-surface-inset']).toBeUndefined();
    expect(bithire.cssVariables['--ds-color-text-primary']).toBeUndefined();
    expect(tmm.cssVariables['--ds-surface-inset']).toBeUndefined();

    // The vertical's light tertiary ink and the inset surface it used to author.
    // Held as literals now that neither source declares them: the law below is
    // arithmetic over a colour pair, and it is the arithmetic this file owns.
    const tertiary = '#7f859b';
    const surface = '#EDF3F7';

    // The defect, measured: raw tertiary fails AA on the inset surface.
    expect(contrastRatio(tertiary, surface)).toBeLessThan(4.5);

    // The fix, measured on the governed source's own primary text ink.
    const tmmInk = srgbMix(tertiary, tmm.cssVariables['--ds-color-text-primary'], 0.55);
    expect(contrastRatio(tmmInk, surface)).toBeGreaterThanOrEqual(4.5);
  });
});

function scrollableAttr(el: HTMLElement) {
  return {
    role: el.getAttribute('role'),
    tabIndex: el.getAttribute('tabindex'),
    name: el.getAttribute('aria-label'),
  };
}

describe('CodeBlock guarded i18n channel (K4-B)', () => {
  const code = 'const a = 1;';

  it('falls back to the English region label without a provider', () => {
    render(<CodeBlock code={code} {...LABELS} />);
    expect(screen.getByRole('group', { name: 'Code block' })).toBeInTheDocument();
  });

  it('keeps the English fallback when the key is missing in locale AND fallback locale (echo guard)', () => {
    // fr/pt JSONs do not carry the key yet; pinning both locales to fr keeps
    // the catalog silent so the guard must fall back.
    render(
      <I18nProvider locale="fr" fallbackLocale="fr">
        <CodeBlock code={code} {...LABELS} />
      </I18nProvider>,
    );
    expect(screen.getByRole('group', { name: 'Code block' })).toBeInTheDocument();
  });

  it('consumes components.codeBlock.regionLabel once the key lands', () => {
    render(
      <I18nProvider
        locale="es"
        customTranslations={{ components: { codeBlock: { regionLabel: 'Bloque de código' } } }}
      >
        <CodeBlock code={code} {...LABELS} />
      </I18nProvider>,
    );
    expect(screen.getByRole('group', { name: 'Bloque de código' })).toBeInTheDocument();
  });

  it('lets the explicit ariaLabel prop win over the catalog', () => {
    render(
      <I18nProvider
        locale="es"
        customTranslations={{ components: { codeBlock: { regionLabel: 'Bloque de código' } } }}
      >
        <CodeBlock code={code} ariaLabel="Fragmento de ejemplo" {...LABELS} />
      </I18nProvider>,
    );
    expect(screen.getByRole('group', { name: 'Fragmento de ejemplo' })).toBeInTheDocument();
  });
});
