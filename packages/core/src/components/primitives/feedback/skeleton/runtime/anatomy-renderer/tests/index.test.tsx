import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { render, screen } from '@testing-library/react';
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

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const [x, y, width, height] = (this.closest('[data-rect]')?.getAttribute('data-rect') ?? '0,0,0,0')
      .split(',')
      .map(Number);
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
    expect(css).toContain(".ds-skeleton-anatomy[data-part='root'][data-animation='shimmer'] [data-part='bone']:not([data-bone='frame'])");
    expect(css).toContain(".ds-skeleton-anatomy[data-part='root'][data-animation='pulse'] [data-part='bone']:not([data-bone='frame'])");
  });

  it('is a static surface under reduced motion, not a slower shimmer', () => {
    const media = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(css);
    expect(media).not.toBeNull();
    const block = media![1];
    const shimmer = ".ds-skeleton-anatomy[data-part='root'][data-animation='shimmer'] [data-part='bone']:not([data-bone='frame'])";
    const pulse = ".ds-skeleton-anatomy[data-part='root'][data-animation='pulse'] [data-part='bone']:not([data-bone='frame'])";
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
