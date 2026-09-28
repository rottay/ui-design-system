/**
 * The in-tree surface anchors to the trigger edge its placement names and stays
 * inside the viewport in both reading directions, read from a real Chromium box
 * at a narrow and a wide viewport.
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';
import type { DropdownPlacement } from '../contracts';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

type Box = { left: number; right: number; top: number; bottom: number; width: number; height: number };
type Scene = { trigger: Box; surface: Box; viewport: number };

interface GeometryPage {
  setContent(html: string): Promise<void>;
  addStyleTag(options: { content: string }): Promise<unknown>;
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
}

interface GeometryBrowser {
  newContext(options: { viewport: { width: number; height: number } }): Promise<{ newPage(): Promise<GeometryPage> }>;
  close(): Promise<void>;
}

const MENU = { items: [{ key: 'edit', label: 'Edit' }, { key: 'duplicate', label: 'Duplicate' }] };
const PLACEMENTS = ['bottomLeft', 'bottomRight', 'topLeft', 'topRight', 'bottom', 'top'] as const;
const VIEWPORTS = [360, 1280] as const;
const DIRECTIONS = ['ltr', 'rtl'] as const;

function markupFor(placement: DropdownPlacement): string {
  const view = render(
    <ModernDropdown open placement={placement} menu={MENU}>
      <button type="button">Actions</button>
    </ModernDropdown>,
  );
  const html = view.container.innerHTML;
  view.unmount();
  return html;
}

function launch(): Promise<GeometryBrowser> {
  const root = resolve(__dirname, '../../../../../../package.json');
  for (const base of [root, resolve(root, '../../package.json'), resolve(root, '../showroom/package.json')]) {
    for (const specifier of ['playwright', '@playwright/test']) {
      try {
        const module = createRequire(base)(specifier) as { chromium?: { launch(): Promise<GeometryBrowser> } };
        if (module.chromium) return module.chromium.launch();
      } catch {
        // try the next resolution root
      }
    }
  }
  throw new Error('dropdown rtl-anchor: no Playwright chromium is resolvable');
}

/**
 * The trigger sits at the edge its placement grows away from: an inline-end
 * placement at the inline end, an inline-start one at the inline start, a
 * centred one in the middle -- the positions where a wrong anchor overflows.
 */
function justifyFor(placement: DropdownPlacement): string {
  if (placement.endsWith('Right')) return 'flex-end';
  if (placement.endsWith('Left')) return 'flex-start';
  return 'center';
}

async function measure(): Promise<Record<string, Scene>> {
  const browser = await launch();
  const scenes: Record<string, Scene> = {};
  try {
    const arm = await mountArm('bithire', {});
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport, height: 640 } });
      const page = await context.newPage();
      await page.setContent('<!doctype html><html><head></head><body style="margin:0"></body></html>');
      await page.addStyleTag({ content: resolvedBaseCss() });
      await page.addStyleTag({ content: arm.css });
      for (const placement of PLACEMENTS) {
        for (const dir of DIRECTIONS) {
          scenes[`${viewport}/${dir}/${placement}`] = await page.evaluate(
            ({ markup, rootAttributes, dir: direction, justify }) => {
              for (const [name, value] of Object.entries(rootAttributes)) {
                document.documentElement.setAttribute(name, value);
              }
              const host = document.createElement('div');
              host.setAttribute('dir', direction);
              host.setAttribute('style', `display:flex;justify-content:${justify};padding:160px 8px`);
              host.innerHTML = markup;
              document.body.append(host);
              // The entrance scales the surface; its resting box is the finished animation's.
              for (const animation of host.getAnimations({ subtree: true })) animation.finish();
              const box = (selector: string) => {
                const r = host.querySelector(selector)!.getBoundingClientRect();
                return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
              };
              const scene = {
                trigger: box("[data-part='trigger']"),
                surface: box("[data-part='surface']"),
                viewport: document.documentElement.clientWidth,
              };
              host.remove();
              return scene;
            },
            { markup: markupFor(placement), rootAttributes: arm.rootAttributes, dir, justify: justifyFor(placement) },
          );
        }
      }
    }
  } finally {
    await browser.close();
  }
  if (process.env.DS_DROPDOWN_RTL_ANCHOR_DUMP) {
    process.stdout.write(`DROPDOWN_RTL_ANCHOR ${JSON.stringify(scenes)}\n`);
  }
  return scenes;
}

describe('dropdown in-tree anchor in both reading directions', () => {
  it('anchors the named edge and stays inside a narrow and a wide viewport', async () => {
    const scenes = await measure();
    for (const [key, { trigger, surface, viewport }] of Object.entries(scenes)) {
      const [, dir, placement] = key.split('/');
      expect(surface.left, `${key}: inside the start of the viewport`).toBeGreaterThanOrEqual(0);
      expect(surface.right, `${key}: inside the end of the viewport`).toBeLessThanOrEqual(viewport);
      const inlineEnd = placement!.endsWith('Right');
      const inlineStart = placement!.endsWith('Left');
      if (inlineStart) {
        const edge = dir === 'rtl' ? 'right' : 'left';
        expect(surface[edge], `${key}: reading-start edge`).toBeCloseTo(trigger[edge], 1);
      } else if (inlineEnd) {
        const edge = dir === 'rtl' ? 'left' : 'right';
        expect(surface[edge], `${key}: reading-end edge`).toBeCloseTo(trigger[edge], 1);
      } else {
        const centre = (b: Box) => (b.left + b.right) / 2;
        expect(centre(surface), `${key}: centred on the trigger`).toBeCloseTo(centre(trigger), 1);
      }
      const above = placement!.startsWith('top');
      expect(above ? surface.bottom < trigger.top : surface.top > trigger.bottom, `${key}: block side`).toBe(true);
    }
  }, 120_000);
});
