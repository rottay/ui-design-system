/**
 * @fileoverview Where the boundaries sit (B-1, workspace-shell in P-1) and what
 * their fallback holds (B-2): one boundary around each shell's content slot
 * and none around chrome; the fallback is the slot element itself, empty, so
 * every skin rule that sizes the slot sizes the fallback too.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/structures/shell/app-shell';
import { PageShellSurface } from '@/components/structures/shell/page-shell-surface';
import { WorkspaceShell } from '@/components/structures/shell/workspace-shell';
import {
  CONTENT_BOUNDARY_PLACEMENTS,
  type ContentBoundaryRegion,
} from '@/components/structures/foundation/content-boundary/policy';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

import { completeHtml, mountHtml, serverThrowingFamily, textFamily, warmServerRender } from '../harness';

const placement = vi.hoisted(() => ({ regions: [] as readonly ContentBoundaryRegion[] }));
vi.mock('@/components/structures/foundation/content-boundary/policy', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  activeContentBoundaryRegions: () => placement.regions,
}));

const Throws = serverThrowingFamily('ScbShapeThrows');
const Content = textFamily('ScbShapeContent');
const SKINS = resolve(__dirname, '../../../../src/foundation/tokens/css/presentation/components/skin');

const withEngine = (node: ReactNode) => <EngineProvider defaultEngine="modern">{node}</EngineProvider>;

const SHELLS = [
  {
    name: 'AppShell',
    skin: 'app-shell',
    slot: 'main.ds-app-shell__content[data-part="content"]',
    holder: '.ds-app-shell > [data-part="main-area"] > [data-part="content"]',
    page: (content: ReactNode) =>
      withEngine(
        <AppShell
          adapt={{ phone: { navigation: 'sidebar' }, tablet: { navigation: 'sidebar' } }}
          sidebar={{ nav: <span>Navigation</span> }}
          header={{ left: <span>Header</span> }}
          footer={<span>Footer</span>}
        >
          {content}
        </AppShell>,
      ),
  },
  {
    name: 'PageShellSurface',
    skin: 'page-shell-surface',
    slot: '.ds-page-shell-surface[data-part="body"]',
    holder: ".ds-surface.ds-page-shell-surface[data-part='body']",
    page: (content: ReactNode) =>
      withEngine(
        <PageShellSurface chrome={{ title: 'Records' }} actions={<span>Actions</span>}>
          {content}
        </PageShellSurface>,
      ),
  },
] as const;

interface Boundary {
  marker: string;
  elements: Element[];
}

/** Every Suspense boundary in server markup, with the elements directly inside it. */
function boundaries(root: Node): Boundary[] {
  const found: Boundary[] = [];
  const walk = (parent: Node) => {
    const stack: Boundary[] = [];
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === Node.COMMENT_NODE) {
        const data = (node as Comment).data;
        if (data === '$' || data === '$?' || data === '$!') stack.push({ marker: data, elements: [] });
        else if (data === '/$') found.push(stack.pop()!);
        continue;
      }
      if (node instanceof Element) {
        if (stack.length > 0 && node.tagName !== 'TEMPLATE') stack[stack.length - 1].elements.push(node);
        walk(node);
      }
    }
  };
  walk(root);
  return found;
}

/** Rule selectors of a skin file, split on top-level commas; at-rule preludes are skipped. */
function skinSelectors(file: string): string[] {
  const css = readFileSync(resolve(SKINS, file, 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors: string[] = [];
  for (const [, prelude] of css.matchAll(/([^{};]+)\{[^{}]*\}/g)) {
    let depth = 0;
    let current = '';
    for (const char of prelude.trim()) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        selectors.push(current.trim());
        current = '';
      } else current += char;
    }
    selectors.push(current.trim());
  }
  return selectors.filter((selector) => selector && !selector.startsWith('@'));
}

function matches(element: Element, selector: string): boolean | 'unsupported' {
  try {
    return element.matches(selector);
  } catch {
    return 'unsupported';
  }
}

describe('shell content-boundary placement', () => {
  describe.each(SHELLS)('$name', ({ page, slot, skin, holder }) => {
    it('B-1 dark: the shell renders no boundary of its own', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS.off;
      const container = mountHtml(completeHtml(await warmServerRender(() => page(<Content text="page" />))));
      expect(boundaries(container)).toEqual([]);
    });

    it('B-1 under content-slot: exactly one boundary, around the content slot element and nothing else', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['content-slot'];
      const container = mountHtml(completeHtml(await warmServerRender(() => page(<Content text="page" />))));
      const found = boundaries(container);

      expect(found).toHaveLength(1);
      expect(found[0].marker).toBe('$');
      expect(found[0].elements).toHaveLength(1);
      expect(found[0].elements[0].matches(slot)).toBe(true);
      expect(found[0].elements[0].textContent).toBe('page');
    });

    it('B-2 the fallback is the slot element, empty: same tag, class and part, no id or focus stop, busy', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['content-slot'];
      const served = mountHtml(completeHtml(await warmServerRender(() => page(<Content text="page" />))));
      const failed = mountHtml(completeHtml(await warmServerRender(() => page(<Throws />))));
      const real = served.querySelector(slot)!;
      const fallback = failed.querySelector('[data-content-fallback="content-slot"]');

      expect(fallback).not.toBeNull();
      expect(fallback!.tagName).toBe(real.tagName);
      expect(fallback!.className).toBe(real.className);
      expect(fallback!.getAttribute('data-part')).toBe(real.getAttribute('data-part'));
      expect(fallback!.parentElement!.getAttribute('data-part')).toBe(real.parentElement!.getAttribute('data-part'));
      expect(fallback!.hasAttribute('id')).toBe(false);
      expect(fallback!.hasAttribute('tabindex')).toBe(false);
      expect(fallback!.getAttribute('aria-busy')).toBe('true');
      expect(fallback!.childNodes).toHaveLength(0);
    });

    it(`B-2 geometry: every ${skin} skin rule that styles the slot also styles the fallback`, async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS['content-slot'];
      const served = mountHtml(completeHtml(await warmServerRender(() => page(<Content text="page" />))));
      const failed = mountHtml(completeHtml(await warmServerRender(() => page(<Throws />))));
      const real = served.querySelector(slot)!;
      const fallback = failed.querySelector('[data-content-fallback="content-slot"]')!;

      const slotRules = skinSelectors(skin).filter((selector) => matches(real, selector) === true);
      expect(slotRules).toContain(holder);
      for (const selector of slotRules) expect([selector, matches(fallback, selector)]).toEqual([selector, true]);
    });
  });

  it('the AppShell slot rule the fallback inherits is the block-size holder (flex: 1 in the main column)', () => {
    const css = readFileSync(resolve(SKINS, 'app-shell', 'index.css'), 'utf8');
    expect(css).toMatch(/\.ds-app-shell > \[data-part="main-area"\] > \[data-part="content"\] \{\s*flex: 1;/);
  });

  describe('WorkspaceShell (a page-content slot; its particle Suspense stays decorative)', () => {
    const workspace = () =>
      withEngine(
        <WorkspaceShell variant="ai-field">
          <Content text="workspace" />
        </WorkspaceShell>,
      );

    it('carries no boundary of its own while dark', async () => {
      placement.regions = CONTENT_BOUNDARY_PLACEMENTS.off;
      const container = mountHtml(completeHtml(await warmServerRender(workspace)));
      expect(boundaries(container)).toEqual([]);
    });

    it.each(['content-slot', 'structure-regions'] as const)(
      'under %s carries one boundary around its content box; the field and overlay stay outside',
      async (name) => {
        placement.regions = CONTENT_BOUNDARY_PLACEMENTS[name];
        const container = mountHtml(completeHtml(await warmServerRender(workspace)));
        const found = boundaries(container);

        expect(found).toHaveLength(1);
        expect(found[0].elements).toHaveLength(1);
        expect(found[0].elements[0].matches('.ds-collection-shell__content[data-part="content"]')).toBe(true);
        expect(container.querySelector('[data-part="particle-field-static-fallback"]')?.closest('.ds-collection-shell__content')).toBeNull();
        expect(container.querySelector('[data-part="overlay"]')?.closest('.ds-collection-shell__content')).toBeNull();
      },
    );
  });
});
