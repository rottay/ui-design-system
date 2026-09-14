import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernButton from '../../../../../inputs/button/engines/modern';
import {
  AnatomySkeleton,
  SKELETON_PART_ROLES,
  readAnatomyBones,
  resolvePartRole,
} from '..';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '../../../../../../..');
const SKIN = resolve(SRC, 'foundation/tokens/css/presentation/components/skin/skeleton-anatomy/index.css');

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

interface FixturePart {
  part?: string;
  rect: [number, number, number, number];
  children?: FixturePart[];
  text?: string;
}

/** A family whose stamped anatomy the test controls part by part. */
function FixtureFamily({ anatomy }: { anatomy: FixturePart[] }) {
  const renderPart = (node: FixturePart, index: number): React.ReactNode => (
    <div key={index} data-part={node.part} data-rect={node.rect.join(',')}>
      {node.text}
      {node.children?.map(renderPart)}
    </div>
  );
  return <div data-rect="0,0,320,200">{anatomy.map(renderPart)}</div>;
}

const sourceParts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-part='bone']")).map(
    (bone) => `${bone.dataset.sourcePart}:${bone.dataset.bone}`,
  );

/**
 * Rects a test moves without touching the DOM, keyed by the element's declared
 * `data-rect`. A layout that changes with no mutation is exactly what a
 * `data-part`-only observer cannot see.
 */
const movedRects = new Map<string, string>();

beforeEach(() => {
  movedRects.clear();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const declared = this.closest('[data-rect]')?.getAttribute('data-rect') ?? '0,0,0,0';
    const [x, y, width, height] = (movedRects.get(declared) ?? declared).split(',').map(Number);
    return { x, y, left: x, top: y, width, height, right: x + width, bottom: y + height, toJSON: () => ({}) } as DOMRect;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const CARD_LIKE: FixturePart[] = [
  {
    part: 'root',
    rect: [0, 0, 320, 200],
    children: [
      {
        part: 'header',
        rect: [16, 16, 288, 40],
        children: [
          { part: 'icon', rect: [16, 16, 24, 24] },
          { part: 'title', rect: [48, 16, 200, 24], text: 'Quarterly report' },
        ],
      },
      {
        part: 'spinner',
        rect: [150, 90, 20, 20],
        children: [{ part: 'label', rect: [150, 90, 20, 20], text: 'Loading' }],
      },
      {
        rect: [16, 140, 288, 44],
        children: [
          { part: 'trigger', rect: [16, 140, 120, 44], children: [{ part: 'label', rect: [24, 150, 80, 20], text: 'Open' }] },
        ],
      },
    ],
  },
];

describe('AnatomySkeleton builds the loading state from the stamped data-part anatomy', () => {
  it('draws one bone per part, by role, in document order', () => {
    const { container } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );

    expect(sourceParts(container)).toEqual(['root:frame', 'icon:round', 'title:line', 'trigger:block']);
    const title = container.querySelector<HTMLElement>("[data-source-part='title']")!;
    expect(title.style.getPropertyValue('--ds-skeleton-bone-x')).toBe('48px');
    expect(title.style.getPropertyValue('--ds-skeleton-bone-y')).toBe('16px');
    expect(title.style.getPropertyValue('--ds-skeleton-bone-width')).toBe('200px');
    expect(title.style.getPropertyValue('--ds-skeleton-bone-height')).toBe('24px');
  });

  it('follows the family when the family changes its anatomy, with no change to the renderer', () => {
    const { container, rerender } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    expect(sourceParts(container)).toEqual(['root:frame', 'icon:round', 'title:line', 'trigger:block']);

    const changed: FixturePart[] = [
      {
        part: 'root',
        rect: [0, 0, 320, 200],
        children: [
          { part: 'cover', rect: [0, 0, 320, 96] },
          { part: 'title', rect: [16, 104, 200, 24] },
          { part: 'description', rect: [16, 132, 288, 20] },
        ],
      },
    ];
    rerender(
      <AnatomySkeleton>
        <FixtureFamily anatomy={changed} />
      </AnatomySkeleton>,
    );

    expect(sourceParts(container)).toEqual(['root:frame', 'cover:block', 'title:line', 'description:line']);
  });

  it('reads a real family: the modern Button stands in as one trigger-sized block', () => {
    const { container } = render(
      <AnatomySkeleton>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    expect(sourceParts(container)).toEqual(['trigger:block']);
  });

  it('gives every part the rostered button family stamps a role', () => {
    for (const part of ['trigger', 'content-frame', 'content', 'label', 'icon', 'prefix', 'suffix', 'busy-content', 'accessible-label', 'spinner', 'spinner-track', 'spinner-indicator', 'group']) {
      expect(SKELETON_PART_ROLES[part], part).toBeDefined();
    }
    expect(resolvePartRole('never-stamped')).toBe('block');
  });

  it('reads the anatomy directly from a DOM subtree', () => {
    const host = document.createElement('div');
    host.setAttribute('data-rect', '10,10,100,40');
    host.innerHTML = "<span data-part='avatar' data-rect='10,10,40,40'></span><span data-part='text' data-rect='60,20,50,20'></span>";
    document.body.appendChild(host);
    expect(readAnatomyBones(host).map((bone) => [bone.part, bone.role, bone.x, bone.y])).toEqual([
      ['avatar', 'round', 0, 0],
      ['text', 'line', 50, 10],
    ]);
    host.remove();
  });
});

/** A ResizeObserver the test drives, so the observed set and the callback are both readable. */
class RecordingResizeObserver {
  static last: RecordingResizeObserver | undefined;

  readonly observed = new Set<Element>();

  disconnected = 0;

  constructor(readonly callback: () => void) {
    RecordingResizeObserver.last = this;
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
    this.disconnected += 1;
  }
}

const observedParts = () =>
  [...(RecordingResizeObserver.last?.observed ?? [])].map((element) => element.getAttribute('data-part') ?? '(unstamped)');

const boneWidth = (container: HTMLElement, part: string) =>
  container
    .querySelector<HTMLElement>(`[data-source-part='${part}']`)!
    .style.getPropertyValue('--ds-skeleton-bone-width');

describe('AnatomySkeleton keeps the bones on the geometry it copied', () => {
  let previous: typeof ResizeObserver;

  beforeEach(() => {
    previous = globalThis.ResizeObserver;
    RecordingResizeObserver.last = undefined;
    globalThis.ResizeObserver = RecordingResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = previous;
  });

  it('observes the source wrapper and every element it measures, and nothing it omits', () => {
    render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    const parts = observedParts();
    expect(parts).toContain('source');
    expect(parts).toEqual(expect.arrayContaining(['root', 'header', 'icon', 'title', 'trigger']));
    expect(parts).not.toContain('spinner');
    expect(parts).not.toContain('label');
  });

  it('catches up when a descendant resizes and the wrapper bounds do not change', () => {
    const { container } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    expect(boneWidth(container, 'title')).toBe('200px');
    const observer = RecordingResizeObserver.last!;
    expect(observer.observed.has(container.querySelector("[data-part='title']")!)).toBe(true);

    movedRects.set('48,16,200,24', '48,16,120,24');
    act(() => {
      observer.callback();
    });

    expect(boneWidth(container, 'title')).toBe('120px');
    expect(boneWidth(container, 'root')).toBe('320px');
  });

  it('catches up when a descendant changes class with no data-part mutation', async () => {
    const { container } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    movedRects.set('16,140,120,44', '16,140,240,44');
    container.querySelector<HTMLElement>("[data-part='trigger']")!.classList.add('is-wide');

    await waitFor(() => expect(boneWidth(container, 'trigger')).toBe('240px'));
  });

  it('catches up when the document direction flips', async () => {
    const { container } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    movedRects.set('16,16,24,24', '280,16,24,24');
    document.documentElement.setAttribute('dir', 'rtl');

    try {
      await waitFor(() =>
        expect(
          container
            .querySelector<HTMLElement>("[data-source-part='icon']")!
            .style.getPropertyValue('--ds-skeleton-bone-x'),
        ).toBe('280px'),
      );
    } finally {
      document.documentElement.removeAttribute('dir');
    }
  });

  /** Stands in for `document.fonts`, whose readiness the test controls. */
  const withFontFaceSet = async (
    run: (fonts: EventTarget, settle: () => void) => Promise<void>,
  ) => {
    let settle = () => {};
    const fonts = new EventTarget() as EventTarget & { ready: Promise<unknown> };
    fonts.ready = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const descriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
    try {
      await run(fonts, settle);
    } finally {
      if (descriptor) Object.defineProperty(document, 'fonts', descriptor);
      else delete (document as unknown as { fonts?: unknown }).fonts;
    }
  };

  it('catches up when a delayed font finishes loading', async () => {
    await withFontFaceSet(async (fonts) => {
      const { container } = render(
        <AnatomySkeleton>
          <FixtureFamily anatomy={CARD_LIKE} />
        </AnatomySkeleton>,
      );
      movedRects.set('48,16,200,24', '48,16,164,24');
      act(() => {
        fonts.dispatchEvent(new Event('loadingdone'));
      });

      expect(boneWidth(container, 'title')).toBe('164px');
    });
  });

  it('catches up when font readiness resolves after the first measure', async () => {
    await withFontFaceSet(async (_fonts, settle) => {
      const { container } = render(
        <AnatomySkeleton>
          <FixtureFamily anatomy={CARD_LIKE} />
        </AnatomySkeleton>,
      );
      expect(boneWidth(container, 'title')).toBe('200px');
      movedRects.set('48,16,200,24', '48,16,148,24');
      settle();

      await waitFor(() => expect(boneWidth(container, 'title')).toBe('148px'));
    });
  });

  it('drops a removed part from the watch and picks up an inserted one', () => {
    const { rerender } = render(
      <AnatomySkeleton>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    expect(observedParts()).toContain('icon');

    rerender(
      <AnatomySkeleton>
        <FixtureFamily
          anatomy={[
            {
              part: 'root',
              rect: [0, 0, 320, 200],
              children: [{ part: 'cover', rect: [0, 0, 320, 96] }],
            },
          ]}
        />
      </AnatomySkeleton>,
    );

    expect(observedParts()).toContain('cover');
    expect(observedParts()).not.toContain('icon');
  });

  it('stops watching once loading ends', () => {
    const { rerender } = render(
      <AnatomySkeleton loading>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );
    const observer = RecordingResizeObserver.last!;
    expect(observer.observed.size).toBeGreaterThan(1);

    rerender(
      <AnatomySkeleton loading={false}>
        <FixtureFamily anatomy={CARD_LIKE} />
      </AnatomySkeleton>,
    );

    expect(observer.disconnected).toBe(1);
    expect(observer.observed.size).toBe(0);
  });
});

describe('AnatomySkeleton loading contract', () => {
  it('hides the stand-in from assistive technology and interaction while loading', () => {
    const { container } = render(
      <AnatomySkeleton>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    const root = container.querySelector<HTMLElement>('.ds-skeleton-anatomy')!;
    const source = root.querySelector<HTMLElement>("[data-part='source']")!;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(source).toHaveAttribute('aria-hidden', 'true');
    expect(source.hasAttribute('inert')).toBe(true);
    expect(root.querySelector("[data-part='bones']")).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
  });

  it('binds inert in the presence form both peer React majors serialize', () => {
    const { container, rerender } = render(
      <AnatomySkeleton>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    const source = () => container.querySelector<HTMLElement>("[data-part='source']")!;
    // React 19 normalises the presence form to ''; React 18 keeps the value it was given.
    expect(['', 'inert']).toContain(source().getAttribute('inert'));
    expect(source().inert).toBe(true);

    rerender(
      <AnatomySkeleton loading={false}>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    expect(source().hasAttribute('inert')).toBe(false);
  });

  it('serialises inert on the server and keeps the control out of the tab order', () => {
    const markup = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    expect(markup).toMatch(/data-part="source"[^>]*\sinert(="[^"]*")?/);
    expect(renderToStaticMarkup(
      <AnatomySkeleton loading={false}>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    )).not.toMatch(/\sinert[=\s>]/);
  });

  it('hands the real component back once loading ends', () => {
    const { container, rerender } = render(
      <AnatomySkeleton loading>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    rerender(
      <AnatomySkeleton loading={false}>
        <ModernButton>Save changes</ModernButton>
      </AnatomySkeleton>,
    );
    const root = container.querySelector<HTMLElement>('.ds-skeleton-anatomy')!;
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).not.toHaveAttribute('aria-busy');
    expect(root.querySelector("[data-part='source']")!.hasAttribute('inert')).toBe(false);
    expect(screen.getByRole('button', { name: 'Save changes' })).toHaveAccessibleName('Save changes');
  });

  it('consumes skeletonStyle: shimmer by default, pulse on request, static when disabled', () => {
    const view = (animation?: 'pulse' | 'wave' | false) =>
      render(
        <AnatomySkeleton animation={animation}>
          <FixtureFamily anatomy={CARD_LIKE} />
        </AnatomySkeleton>,
      ).container.querySelector('.ds-skeleton-anatomy')!;
    expect(view()).toHaveAttribute('data-animation', 'shimmer');
    expect(view('pulse')).toHaveAttribute('data-animation', 'pulse');
    expect(view(false)).not.toHaveAttribute('data-animation');
  });
});

describe('the shimmer rides the motion vocabulary', () => {
  const css = stripComments(readFileSync(SKIN, 'utf8'));

  it('declares no keyframe and animates only on foundation keyframes and --ds-motion-* timing', () => {
    expect(css).not.toContain('@keyframes');
    const animations = [...css.matchAll(/(?:^|[;{\s])animation\s*:\s*([^;]+);/g)].map((match) => match[1].trim());
    expect(animations.length).toBeGreaterThan(0);
    for (const value of animations) {
      if (value === 'none') continue;
      expect(value).toMatch(/^ds-foundation-(?:pulse|shimmer) calc\(var\(--ds-motion-attention\) \* 5\) var\(--ds-motion-ease-in-out\) infinite$/);
    }
    for (const match of css.matchAll(/transition\s*:\s*([^;]+);/g)) {
      const value = match[1].trim();
      if (value === 'none') continue;
      expect(value).toMatch(/^opacity var\(--ds-motion-[a-z-]+\) var\(--ds-motion-[a-z-]+(?:, var\(--ds-motion-[a-z-]+\))?\)$/);
    }
    expect(css).not.toMatch(/ds-skeleton-(?:pulse|shimmer|wave)(?![\w-])/);
  });

  it('paints every drawn bone through the shimmer and the pulse', () => {
    expect(css).toContain(".ds-skeleton-anatomy[data-part='root'][data-loading='true'][data-animation='shimmer'] [data-part='bone']:not([data-bone='frame'])");
    expect(css).toContain(".ds-skeleton-anatomy[data-part='root'][data-loading='true'][data-animation='pulse'] [data-part='bone']:not([data-bone='frame'])");
  });

  it('gates every animation declaration on the loading state, so a finished loader runs no loop', () => {
    const animating = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .map((rule) => ({ selectors: rule[1].trim(), body: rule[2] }))
      .filter((rule) => /(?:^|[;\s])animation[a-z-]*\s*:/.test(rule.body))
      .filter((rule) => !/animation\s*:\s*none/.test(rule.body));

    expect(animating.length).toBeGreaterThan(0);
    for (const rule of animating) {
      for (const selector of rule.selectors.split(',')) {
        expect(selector.trim(), rule.body.trim()).toContain("[data-loading='true']");
      }
    }
    expect(css).not.toMatch(/\[data-loading='false'\][^{}]*\{[^{}]*animation/);
  });

  it('is a static surface under reduced motion, not a slower shimmer', () => {
    const media = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(css);
    expect(media).not.toBeNull();
    const block = media![1];
    const shimmer = ".ds-skeleton-anatomy[data-part='root'][data-loading='true'][data-animation='shimmer'] [data-part='bone']:not([data-bone='frame'])";
    const pulse = ".ds-skeleton-anatomy[data-part='root'][data-loading='true'][data-animation='pulse'] [data-part='bone']:not([data-bone='frame'])";
    expect(block).toContain(shimmer);
    expect(block).toContain(pulse);
    expect(block).toContain('animation-iteration-count: 1 !important;');
    const flat = block.slice(block.lastIndexOf(shimmer));
    expect(flat).toMatch(/background: var\(\s*--ds-skeleton-bg/);
    expect(block).not.toMatch(/gradient|background-size|animation: ds-/);

    const runtime = css.slice(css.indexOf(`html[data-ds-motion='reduced'] ${shimmer}`));
    expect(runtime.length).toBeLessThan(css.length);
    expect(runtime.slice(0, runtime.indexOf('}'))).toMatch(/background: var\(\s*--ds-skeleton-bg/);
  });

  it('leaves no hand-made compound or compound skin behind', () => {
    expect(existsSync(resolve(HERE, '../../../compound'))).toBe(false);
    expect(existsSync(resolve(SRC, 'foundation/tokens/css/presentation/components/skin/skeleton-compounds'))).toBe(false);
  });
});
