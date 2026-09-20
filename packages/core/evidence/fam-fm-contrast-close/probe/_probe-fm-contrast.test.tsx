/**
 * SCRATCH probe (WO-FAM contrast close, file-manager arms 2 + 3a).
 * Reads the crumb + delete-button pairings in six vertical/mode scopes through
 * the productive door into real Chromium, colours read via a 1x1 canvas.
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
  '--ds-card-bg', '--ds-surface-card', '--ds-color-primary', '--ds-color-text-primary',
  '--ds-color-error', '--ds-button-error-border', '--ds-button-error-bg', '--ds-color-bg-primary',
  '--ds-breadcrumb-current-bg', '--ds-breadcrumb-current-color', '--ds-breadcrumb-active-color',
  '--ds-breadcrumb-bg', '--ds-color-link', '--ds-file-manager-link-color',
  '--ds-card-elevated-bg', '--ds-card-bordered-bg', '--ds-card-flat-bg',
  '--ds-material-card-background', '--ds-card-color', '--ds-color-neutral-900',
  '--ds-color-bg-elevated', '--ds-surface-panel', '--ds-breadcrumb-hover-bg',
];

const NODES: Record<string, string> = {
  crumbLabel: "#fm-list [data-part='crumb'][data-current='true'] [data-part='label']",
  crumbChip: "#fm-list [data-part='crumb'][data-current='true']",
  crumbLink: "#fm-list [data-part='crumb'][data-clickable='true'] [data-part='label']",
  deleteA1: "#fm-list [data-part='item-action'][data-action='delete']",
  deleteA1Label: "#fm-list [data-part='item-action'][data-action='delete'] [data-part='label']",
  renameA1: "#fm-list [data-part='item-action'][data-action='rename'] [data-part='label']",
  folderName: "#fm-list [data-part='folder-link'] [data-part='label']",
  breadcrumbRoot: "#fm-list [data-part='breadcrumb'] [data-part='root']",
};

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'rottay', theme: 'light' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
];

describe('fm contrast probe', () => {
  it('reads every pairing', async () => {
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
          ({ markup, rootAttributes, surface, channels, nodes, theme }: any) => {
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
            const over = (fg: [number, number, number, number], bg: [number, number, number, number]): [number, number, number, number] => {
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
                const layer = parse(cs.backgroundColor) ?? [0, 0, 0, 0];
                acc = over(acc, layer);
                if (acc[3] >= 0.999) break;
                node = node.parentElement;
              }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              return acc;
            };
            const lum = (c: [number, number, number, number]) => {
              const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
              return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
            };
            const ratio = (a: [number, number, number, number], b: [number, number, number, number]) => {
              const l1 = lum(a), l2 = lum(b);
              return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            };
            const hex = (c: [number, number, number, number] | null) =>
              c ? `#${[c[0], c[1], c[2]].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            const root = document.documentElement;
            const rootCs = getComputedStyle(root);
            const channelValues: Record<string, string> = {};
            for (const ch of channels as string[]) {
              const raw = rootCs.getPropertyValue(ch).trim();
              channelValues[ch] = raw ? `${raw}${raw.startsWith('var(') || raw.includes('(') ? ` => ${hex(parse(raw))}` : ''}` : '';
            }
            const pairings: Record<string, unknown> = {};
            for (const [id, selector] of Object.entries(nodes as Record<string, string>)) {
              const el = main.querySelector(selector);
              if (!el) { pairings[id] = '<no match>'; continue; }
              const cs = getComputedStyle(el);
              const ink = parse(cs.color)!;
              const bg = effectiveBg(el);
              const host = el.closest('[data-tone],[data-variant]');
              pairings[id] = {
                ink: hex(ink),
                ground: hex(bg),
                ratio: ratio(ink, bg),
                ownBg: cs.backgroundColor,
                ownBgImage: cs.backgroundImage.slice(0, 160),
                tone: host?.getAttribute('data-tone') ?? null,
                variant: host?.getAttribute('data-variant') ?? null,
              };
            }
            // Arm-2 candidate drill: each candidate is applied inline on the
            // real crumb (inline beats every layer), then re-measured.
            const label = main.querySelector(nodes.crumbLabel) as HTMLElement | null;
            const chip = main.querySelector(nodes.crumbChip) as HTMLElement | null;
            const candidates: Record<string, unknown> = {};
            if (label && chip) {
              const baseInk = getComputedStyle(label).color;
              const baseChipBg = chip.style.background;
              const inkArms: Record<string, string> = {
                'ink=primary 72% into ground':
                  'color-mix(in srgb, var(--ds-color-primary) 72%, var(--ds-breadcrumb-current-bg))',
                'ink=text-primary 72% into ground':
                  'color-mix(in srgb, var(--ds-color-text-primary) 72%, var(--ds-breadcrumb-current-bg))',
              };
              for (const [id, value] of Object.entries(inkArms)) {
                label.style.color = value;
                const ink = parse(getComputedStyle(label).color)!;
                const bg = effectiveBg(label);
                candidates[id] = { ink: hex(ink), ground: hex(bg), ratio: ratio(ink, bg) };
              }
              label.style.color = '';
              const groundArms: Record<string, string> = {
                'ground=8% primary into --ds-color-bg-elevated':
                  'color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-color-bg-elevated))',
                'ground=8% primary into --ds-surface-card':
                  'color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))',
              };
              chip.style.setProperty('transition', 'none', 'important');
              const groundBefore = getComputedStyle(chip).backgroundColor;
              for (const [id, value] of Object.entries(groundArms)) {
                chip.style.setProperty('background-color', value, 'important');
                chip.style.setProperty('background-image', 'none', 'important');
                const applied = getComputedStyle(chip).backgroundColor;
                const ink = parse(getComputedStyle(label).color)!;
                const bg = effectiveBg(label);
                candidates[id] = {
                  ink: hex(ink),
                  ground: hex(bg),
                  ratio: ratio(ink, bg),
                  // Non-vacuity floor: the arm must actually have changed the node.
                  applied: applied !== groundBefore,
                  appliedValue: applied,
                };
              }
              chip.style.removeProperty('background-color');
              chip.style.removeProperty('background-image');
              chip.style.background = baseChipBg;
              candidates.restingInk = baseInk;
              // Where does the chip's own context resolve the ground chain?
              const chipCs = getComputedStyle(chip);
              candidates.chipContext = Object.fromEntries(
                ['--ds-card-bg', '--ds-surface-card', '--ds-color-bg-elevated', '--ds-color-white', '--ds-breadcrumb-current-bg']
                  .map((ch) => {
                    const raw = chipCs.getPropertyValue(ch).trim();
                    return [ch, `${raw} => ${hex(parse(raw))}`];
                  }),
              );
            }
            return { channels: channelValues, pairings, candidates };
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, channels: CHANNELS, nodes: NODES, theme: scope.theme },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    writeFileSync(
      resolve(__dirname, `../../evidence/fam-fm-contrast-close/probe/${process.env.PROBE_LABEL ?? 'reading'}.json`),
      `${JSON.stringify(out, null, 2)}\n`,
    );
    console.log(JSON.stringify(out, null, 2));
    expect(Object.keys(out)).toHaveLength(6);
  }, 600_000);
});
