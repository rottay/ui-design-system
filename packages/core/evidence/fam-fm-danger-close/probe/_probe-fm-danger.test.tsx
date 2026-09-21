/**
 * SCRATCH probe (file-manager arm 3a, the danger-ink family half).
 * Reads the three delete labels plus the controls in six vertical/mode scopes
 * through the productive door into real Chromium, colours via a 1x1 canvas.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernFileManager from '@/components/patterns/data/file-manager/engines/modern';
import type { FileItem, FolderItem } from '@/components/patterns/data/file-manager/contracts';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const noop = () => {};
const FOLDERS: FolderItem[] = [
  { id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' },
];
const FILES: FileItem[] = [
  { id: 'a1', name: 'offer-letter.pdf', type: 'file', mimeType: 'application/pdf', size: 512_000, modifiedAt: '2026-03-05T10:00:00.000Z' },
  { id: 'a2', name: 'headshot.png', type: 'file', mimeType: 'image/png', size: 128_000, modifiedAt: '2026-03-06T10:00:00.000Z' },
];
const TENANT: TenantConfig = {
  slug: 'file-manager-causality',
  name: 'File manager causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'File manager causality' },
};

async function serverMarkup(viewMode: 'list' | 'grid'): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernFileManager
        files={FILES}
        folders={FOLDERS}
        currentPath={['Workspace']}
        viewMode={viewMode}
        selectedItems={['a1']}
        onNavigate={noop}
        onSelectionChange={noop}
        onViewModeChange={noop}
        onDelete={noop}
        onRename={noop}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude.pipe(new Writable({ write(chunk, _e, done) { html += chunk.toString(); done(); } }))
      .on('finish', () => res()).on('error', rej);
  });
  return html;
}

const list = await serverMarkup('list');
const grid = await serverMarkup('grid');
const markup =
  `<div id="fm-list" style="inline-size:64rem">${list}</div>` +
  `<div id="fm-grid" style="inline-size:64rem">${grid}</div>`;

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';

function chromium() {
  const req = createRequire(resolve(__dirname, '../../../showroom/package.json'));
  return (req('@playwright/test') as { chromium: any }).chromium;
}

const CHANNELS = [
  '--ds-color-error', '--ds-color-error-400', '--ds-color-error-600', '--ds-color-error-700',
  '--ds-color-error-800', '--ds-color-error-900', '--ds-color-on-error',
  '--ds-button-error-border', '--ds-button-error-border-hover', '--ds-button-error-border-active',
  '--ds-button-error-bg', '--ds-button-default-bg', '--ds-material-control-background',
  '--ds-card-bg', '--ds-color-bg-primary', '--ds-color-text-primary', '--ds-color-link',
];

/** Every row axe pins, plus the controls that must not move. */
const NODES: Record<string, string> = {
  deleteA1Label: "#fm-list [data-part='item-action'][id$='-a1-delete'] [data-part='label']",
  deleteA2Label: "#fm-list [data-part='item-action'][id$='-a2-delete'] [data-part='label']",
  deleteF1Label: "#fm-list [data-part='item-action'][id$='-f1-delete'] [data-part='label']",
  deleteA1Button: "#fm-list [data-part='item-action'][id$='-a1-delete']",
  renameA1Label: "#fm-list [data-part='item-action'][id$='-a1-rename'] [data-part='label']",
  folderNameLabel: "#fm-list [data-part='folder-link'] [data-part='label']",
  crumbLabel: "#fm-list [data-part='crumb'][data-current='true'] [data-part='label']",
  toolbarDelete: "#fm-list [data-part='toolbar-action'][data-action='delete-selected'] [data-part='label']",
  nameCellA1: "#fm-list [data-part='name-cell']",
  sizeCellA1: "#fm-list [data-part='size-cell']",
};

/** The stateful arms of the delete button, stamped as the kernel stamps them. */
const STATE_ARMS: Array<{ id: string; state: string }> = [
  { id: 'hovered', state: 'visible hovered' },
  { id: 'pressed', state: 'visible pressed' },
];

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'light' },
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
];

describe('fm danger probe', () => {
  it('reads every delete pairing plus the controls', async () => {
    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext();
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>probe</title></head><body></body></html>');
        await page.addStyleTag({ content: resolvedBaseCss() });
        await page.addStyleTag({ content: arm.css });
        out[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ markup, rootAttributes, surface, channels, nodes, stateArms, theme }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);

            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const ctx2 = canvas.getContext('2d', { willReadFrequently: true })!;
            const parse = (value: string): [number, number, number, number] | null => {
              const v = (value || '').trim();
              if (!v || v === 'transparent' || v === 'none') return [0, 0, 0, 0];
              ctx2.clearRect(0, 0, 1, 1);
              ctx2.fillStyle = '#000000';
              try { ctx2.fillStyle = v; } catch { return null; }
              ctx2.clearRect(0, 0, 1, 1);
              ctx2.globalAlpha = 1;
              ctx2.fillRect(0, 0, 1, 1);
              const d = ctx2.getImageData(0, 0, 1, 1).data;
              return [d[0], d[1], d[2], d[3] / 255];
            };
            const over = (fg: any, bg: any): [number, number, number, number] => {
              const a = fg[3] + bg[3] * (1 - fg[3]);
              if (a === 0) return [0, 0, 0, 0];
              return [
                (fg[0] * fg[3] + bg[0] * bg[3] * (1 - fg[3])) / a,
                (fg[1] * fg[3] + bg[1] * bg[3] * (1 - fg[3])) / a,
                (fg[2] * fg[3] + bg[2] * bg[3] * (1 - fg[3])) / a,
                a,
              ];
            };
            const effectiveBg = (el: Element): [number, number, number, number] => {
              let acc: [number, number, number, number] = [0, 0, 0, 0];
              let node: Element | null = el;
              while (node) {
                const cs = getComputedStyle(node);
                acc = over(acc, parse(cs.backgroundColor) ?? [0, 0, 0, 0]);
                if (acc[3] >= 0.999) break;
                node = node.parentElement;
              }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              return acc;
            };
            const lum = (c: any) => {
              const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
              return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
            };
            const ratio = (a: any, b: any) => {
              const l1 = lum(a), l2 = lum(b);
              return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            };
            const hex = (c: any) =>
              c ? `#${[c[0], c[1], c[2]].map((x: number) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            const rootCs = getComputedStyle(document.documentElement);
            const channelValues: Record<string, string> = {};
            for (const ch of channels as string[]) {
              const raw = rootCs.getPropertyValue(ch).trim();
              channelValues[ch] = raw ? `${raw}${raw.includes('(') ? ` => ${hex(parse(raw))}` : ''}` : '';
            }

            const read = (el: Element) => {
              const cs = getComputedStyle(el);
              const ink = parse(cs.color)!;
              const bg = effectiveBg(el);
              const host = el.closest('[data-tone],[data-variant]');
              return {
                ink: hex(ink),
                ground: hex(bg),
                ratio: ratio(ink, bg),
                ownBg: cs.backgroundColor,
                tone: host?.getAttribute('data-tone') ?? null,
                variant: host?.getAttribute('data-variant') ?? null,
              };
            };

            const pairings: Record<string, unknown> = {};
            for (const [id, selector] of Object.entries(nodes as Record<string, string>)) {
              const el = main.querySelector(selector);
              pairings[id] = el ? read(el) : '<no match>';
            }

            // Stateful arms: stamp the kernel's own attribute on the button and
            // re-read the label. `transition: none` first -- a mid-flight read
            // serializes as oklab() and looks like a no-op.
            const button = main.querySelector(nodes.deleteA1Button) as HTMLElement | null;
            const label = main.querySelector(nodes.deleteA1Label) as HTMLElement | null;
            const states: Record<string, unknown> = {};
            if (button && label) {
              button.style.setProperty('transition', 'none', 'important');
              label.style.setProperty('transition', 'none', 'important');
              const restInk = getComputedStyle(label).color;
              for (const { id, state } of stateArms as Array<{ id: string; state: string }>) {
                button.setAttribute('data-state', state);
                const moved = getComputedStyle(label).color !== restInk
                  || getComputedStyle(button).backgroundColor !== 'rgba(0, 0, 0, 0)';
                states[id] = { ...read(label), applied: moved };
              }
              button.removeAttribute('data-state');
              button.style.removeProperty('transition');
              label.style.removeProperty('transition');
            }
            return { channels: channelValues, pairings, states };
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, channels: CHANNELS, nodes: NODES, stateArms: STATE_ARMS, theme: scope.theme },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    writeFileSync(
      resolve(__dirname, `../../evidence/fam-fm-danger-close/probe/${process.env.PROBE_LABEL ?? 'reading'}.json`),
      `${JSON.stringify(out, null, 2)}\n`,
    );
    expect(Object.keys(out)).toHaveLength(6);
  }, 600_000);
});
