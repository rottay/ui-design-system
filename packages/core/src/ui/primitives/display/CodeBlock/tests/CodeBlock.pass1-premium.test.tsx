import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes';
import { themanagementmiamiBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/fixtures/themanagementmiami';
import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';

import { CodeBlock } from '../index';

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

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// The inline style objects own the STATIC parts; the interactive copy-button
// part and the scroll region's focus ring are owned by the family skin
// (presentation/components/skin/code-block.css). These assertions pin the
// Pass-1/2 ownership contract -- canonical --ds-* tokens only (no phantom
// tokens, no rgba/hex litter) and logical directional properties only
// (no marginRight/textAlign:'right').
const source = readFileSync(join(__dirname, '..', 'index.tsx'), 'utf8');
const skin = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/presentation/components/skin/code-block.css',
  ),
  'utf8',
);

const modernTheme = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/theme.css'),
  'utf8',
);
const personality = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/personality.css'),
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

    // Static paint transcribed verbatim; ghost-hover law with the family
    // escape hatch; focus ring on both the button and the scroll region;
    // forced-colors contract.
    expect(skin).toContain('border: 1px solid var(--ds-color-border)');
    expect(skin).toContain('color: var(--ds-color-text-secondary)');
    expect(skin).toContain(
      'background: var(--ds-code-block-copy-bg-hover, var(--ds-button-ghost-bg-hover, var(--ds-surface-inset)))',
    );
    expect(skin).toContain("[data-part='copy-button']:not(:disabled):hover");
    expect(skin).toContain("[data-part='copy-button']:focus-visible");
    expect(skin).toContain("[data-part='scroll']:focus-visible");
    expect(skin).toContain('color-mix(in srgb, var(--ds-color-primary) 24%, transparent)');
    expect(skin).toContain('@media (forced-colors: active)');
    expect(skin).not.toContain('!important');
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

  it('measures the gutter ink pair on both governed sources (CONTRAST LAW, R2)', () => {
    // Escape hatch + mix pinned in the source.
    expect(source).toContain('--ds-code-block-gutter-ink');
    expect(source).toContain(
      'color-mix(in srgb, var(--ds-color-text-tertiary) 55%, var(--ds-color-text-primary))',
    );

    const bithire = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
    const tmm = compileBrandTheme({
      brandTheme: themanagementmiamiBrandTheme,
      tenantSlug: 'themanagementmiami',
    });

    // The bithire vertical's light tertiary ink; TMM DB declares no override
    // in its compiled variables, so it rides the same vertical base.
    const tertiary = '#7f859b';
    const surface = bithire.cssVariables['--ds-surface-inset'];
    expect(surface).toBe('#EDF3F7');

    // The defect, measured: raw tertiary fails AA on the inset surface.
    expect(contrastRatio(tertiary, surface)).toBeLessThan(4.5);

    // The fix, measured on both sources' own primary text ink.
    const bithireInk = srgbMix(tertiary, bithire.cssVariables['--ds-color-text-primary'], 0.55);
    const tmmInk = srgbMix(tertiary, tmm.cssVariables['--ds-color-text-primary'], 0.55);
    expect(contrastRatio(bithireInk, surface)).toBeGreaterThanOrEqual(4.5);
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
