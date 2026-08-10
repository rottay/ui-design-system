/** No test environment here runs a real bidi reordering/mirroring engine, so bidi claims are
 *  proven against authored CSS text plus DOM structure, never against laid-out glyphs. */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonoStat, TreeView } from '../../../../entrypoints/commercial';

function mockReducedMotion(reduce: boolean): void {
  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') ? reduce : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

const HERE = dirname(fileURLToPath(import.meta.url));
const TREE_VIEW_DIR = resolve(HERE, '../presentation/content/tree-view');
const MONO_STAT_DIR = resolve(HERE, '../presentation/proof/mono-stat');
const treeViewCss = readFileSync(resolve(TREE_VIEW_DIR, 'TreeView.css'), 'utf8');
const monoStatSource = readFileSync(resolve(MONO_STAT_DIR, 'index.tsx'), 'utf8');

function stripBlockComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** Single-selector rules only: a comma-grouped selector is skipped because `,` follows the
 *  name instead of `{`, so lookups land on that selector's own later single rule. */
function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  return match?.[1] ?? '';
}

describe('TreeView connector -- bidi isolation (canon defect C1)', () => {
  const css = stripBlockComments(treeViewCss);

  it('pins the connector layer to an isolated LTR bidi context, so its box-drawing glyphs cannot be reordered or mirror-flipped by an ambient RTL document', () => {
    const connectorRule = ruleBody(css, '.rt-tree-view__connector');
    // Anti-vacuity: fails if the selector itself went missing from the stylesheet.
    expect(connectorRule).not.toBe('');
    expect(connectorRule).toMatch(/direction:\s*ltr\s*;/);
    expect(connectorRule).toMatch(/unicode-bidi:\s*isolate\s*;/);
  });

  it('leaves the label layer unpinned, so a label carrying natural-language RTL text (e.g. Arabic) keeps following its own/the ambient direction instead of being forced LTR', () => {
    const labelRule = ruleBody(css, '.rt-tree-view__label');
    expect(labelRule).not.toBe('');
    expect(labelRule).not.toMatch(/direction\s*:/);
    expect(labelRule).not.toMatch(/unicode-bidi\s*:/);
  });

  it('does not push the LTR pin up to the row or the root either -- the isolation stays scoped to exactly the connector element, not inherited onto its siblings', () => {
    expect(ruleBody(css, '.rt-tree-view__row')).not.toMatch(/direction\s*:|unicode-bidi\s*:/);
    expect(ruleBody(css, '.rt-tree-view')).not.toMatch(/direction\s*:|unicode-bidi\s*:/);
  });

  it('keeps the connector and the label as two separate elements, so the selector-scoped LTR pin cannot bleed onto the label through a shared node', () => {
    const { container } = render(
      <TreeView data={{ label: 'root', children: [{ label: 'مرحبا', href: '/docs/child' }] }} />,
    );
    const connector = container.querySelector('[data-part="connector"]')!;
    const label = container.querySelector('[data-part="label"]')!;
    expect(connector).not.toBeNull();
    expect(label).not.toBeNull();
    expect(connector).not.toBe(label);
    expect(connector.contains(label)).toBe(false);
    expect(label.contains(connector)).toBe(false);
  });

  it('never mixes an RTL label\'s characters into the connector run, and never mixes connector glyphs into the label text', () => {
    // A single-item ARRAY root still renders its own connector, so this is the minimal fixture
    // with exactly one connector and one label, pairable without ambiguity.
    const { container } = render(<TreeView data={[{ label: 'مرحبا بالعالم' }]} />);
    const connector = container.querySelector('[data-part="connector"]');
    const label = container.querySelector('[data-part="label"]');
    expect(connector?.textContent).not.toContain('مرحبا');
    expect(label?.textContent).toBe('مرحبا بالعالم');
    expect(label?.textContent).not.toMatch(/[├└│─]/);
  });

  it('keeps the connector aria-hidden and the label an ordinary readable node -- the bidi pin is a visual/layout-only concern and must not change the accessible reading order or name', () => {
    const { container } = render(
      <TreeView
        aria-label="Repository structure"
        data={{ label: 'root', children: [{ label: 'child', href: '/docs/child' }] }}
      />,
    );
    expect(container.querySelector('[data-part="connector"]')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[data-part="label"]')).not.toHaveAttribute('aria-hidden');
    const link = container.querySelector('[data-part="link"]');
    expect(link).toHaveTextContent('child');
    expect(link).toHaveAttribute('href', '/docs/child');
  });

  it('documents the bidi treatment accurately in TreeView.css -- an inaccurate or missing claim here is itself treated as a defect in this codebase', () => {
    expect(treeViewCss).toMatch(/direction:\s*ltr/);
    expect(treeViewCss).toMatch(/unicode-bidi:\s*isolate/);
    // The comment must name the actual mechanism (mirroring/reordering of neutral box-drawing
    // glyphs under an ambient RTL context), not just restate the property names.
    expect(treeViewCss.toLowerCase()).toMatch(/mirror|reorder/);
  });
});

/* Bidi isolation and geometric orientation are orthogonal: C1 bought stable character order, but
   the unpinned flex row still reverses and box-drawing glyphs are not in Unicode's mirroring set. */
describe('TreeView connector -- RTL geometry, not just bidi isolation (canon defect C1b)', () => {
  const css = stripBlockComments(treeViewCss);

  it('mirrors the connector box under an RTL root, so the branch arm points back at the label it joins instead of away from it', () => {
    const mirrorRule = ruleBody(css, '.rt-tree-view:dir(rtl) .rt-tree-view__connector');
    expect(mirrorRule).not.toBe('');
    // scaleX(-1) maps `├`->`┤` and `└`->`┘` while `─`/`│` are already symmetric.
    expect(mirrorRule).toMatch(/transform:\s*scaleX\(-1\)\s*;/);
  });

  it('keys the mirror on the ambient ROOT and never on the connector itself -- the connector declares direction:ltr, so a self-keyed `:dir(rtl)` would be a permanently dormant selector', () => {
    expect(css).not.toMatch(/\.rt-tree-view__connector:dir\(/);
    // ...and the pin that would make that form dormant is still in force: the mirror is ADDITIVE
    // to the isolation, never a replacement for it.
    expect(ruleBody(css, '.rt-tree-view__connector')).toMatch(/direction:\s*ltr\s*;/);
  });

  it('leaves the tree root free of any `direction` declaration, which is precisely what lets the root-keyed selector track the ambient document direction', () => {
    expect(ruleBody(css, '.rt-tree-view')).not.toMatch(/direction\s*:/);
  });

  it('mirrors ONLY the connector: a transform on the row or the label would flip real RTL label text into unreadable mirror writing', () => {
    expect(ruleBody(css, '.rt-tree-view__label')).not.toMatch(/transform\s*:/);
    expect(ruleBody(css, '.rt-tree-view__row')).not.toMatch(/transform\s*:/);
    // Anti-vacuity: the UNCONDITIONAL connector rule must not carry the mirror, or LTR documents
    // would get flipped glyphs too.
    expect(ruleBody(css, '.rt-tree-view__connector')).not.toMatch(/transform\s*:/);
  });

  it('keeps the connector a blockified flex item, which is the only reason a transform applies to it at all (transforms are ignored on non-replaced inline boxes)', () => {
    expect(ruleBody(css, '.rt-tree-view__row')).toMatch(/display:\s*flex\s*;/);
    expect(ruleBody(css, '.rt-tree-view__connector')).toMatch(/flex:\s*none\s*;/);
    const { container } = render(<TreeView data={[{ label: 'مرحبا' }]} />);
    const row = container.querySelector('[data-part="row"]')!;
    const connector = container.querySelector('[data-part="connector"]')!;
    // The mirror targets a direct flex child of the row; a nested wrapper would blockify
    // differently and silently change what scaleX(-1) applies to.
    expect(connector.parentElement).toBe(row);
  });
});

describe('MonoStat default formatter -- SSR/CSR locale determinism (canon defect C2, conservative disposition)', () => {
  it('documents the SSR/CSR locale-instability constraint in the component docblock (RED before this round: the prior docblock said nothing about SSR, hydration, or locale)', () => {
    expect(monoStatSource).toMatch(/SSR/);
    expect(monoStatSource).toMatch(/hydrat/i);
    expect(monoStatSource).toMatch(/locale/i);
    expect(monoStatSource).toMatch(/explicit/i);
  });

  it("pins today's contract: with no `format` prop, MonoStat's accessible final value is exactly Intl.NumberFormat(undefined, ...)'s output -- the CURRENT runtime's ambient default locale, not a fixed one", () => {
    mockReducedMotion(true);
    const value = 12345;
    const { container } = render(<MonoStat value={value} label="use cases" />);
    const expected = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      Math.round(value) || 0,
    );
    expect(container.querySelector('.rt-mono-stat__visually-hidden')?.textContent).toBe(expected);
  });

  it('demonstrates the divergence mechanism the docblock warns about: the SAME number formats to DIFFERENT strings under different resolved locales -- exactly what "undefined" is exposed to across a server host and a browser host', () => {
    const value = 12345;
    const enUS = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    const deDE = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(value);
    // Anti-vacuity: if these ever coincided for this input, the "different locale -> different
    // group/decimal separators" premise the defect rests on would not hold here.
    expect(enUS).not.toBe(deDE);
    expect(enUS).toBe('12,345');
    expect(deDE).toBe('12.345');
  });

  it('gives a localized surface a deterministic escape hatch: an explicit `format` prop bypasses ambient locale resolution entirely, regardless of host', () => {
    mockReducedMotion(true);
    const pinned = (n: number): string =>
      new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n);
    const { container } = render(<MonoStat value={12345} label="use cases" format={pinned} />);
    expect(container.querySelector('.rt-mono-stat__visually-hidden')?.textContent).toBe('12.345');
  });
});
