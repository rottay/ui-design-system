/** TEMPORARY ratio/channel probe (WO-FAM-08/10 contrast drain). Delete before handoff. */
import React from 'react';
import { Writable } from 'node:stream';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernColumnSettingsDropdown from '@/components/patterns/data/column-settings/engines/modern';
import ModernFileManager from '@/components/patterns/data/file-manager/engines/modern';
import type { FileItem, FolderItem } from '@/components/patterns/data/file-manager/contracts';
import { RecordField } from '@/components/structures/record/field';
import { RecordFieldGrid } from '@/components/structures/record/field-grid';
import { RecordSummaryStrip } from '@/components/structures/record/summary-strip';
import { RecordActionBar } from '@/components/structures/record/action-bar';
import { RecordPanel } from '@/components/structures/record/panel';
import { AXE_SCOPES, mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const noop = () => {};
const CORE_ROOT = resolve(__dirname, '../../..');

async function drain(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(node);
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude.pipe(new Writable({ write(c, _e, d) { html += c.toString(); d(); } }))
      .on('finish', () => res()).on('error', rej);
  });
  return html;
}
const TENANT = (slug: string): TenantConfig => ({
  slug, name: slug, theme: 'base', locale: 'en', fallbackLocale: 'en',
  plan: 'enterprise', features: [], branding: { companyName: slug },
});

const csMarkup = await drain(
  <EngineProvider defaultEngine="modern">
    <ModernColumnSettingsDropdown
      allColumns={[{ key: 'name', header: 'Name' }, { key: 'status', header: 'Status' }, { key: 'owner', header: 'Owner' }]}
      visibleColumns={['name', 'status']} lockedColumns={[]} columnOrder={['name', 'status', 'owner']}
      pinnedColumns={{ left: [], right: [] }}
      onToggleVisibility={noop} onReorder={noop} onTogglePin={noop} onReset={noop} />
  </EngineProvider>,
);

const FOLDERS: FolderItem[] = [{ id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' }];
const FILES: FileItem[] = [
  { id: 'a1', name: 'offer-letter.pdf', type: 'file', mimeType: 'application/pdf', size: 512_000, modifiedAt: '2026-03-05T10:00:00.000Z' },
  { id: 'a2', name: 'headshot.png', type: 'file', mimeType: 'image/png', size: 128_000, modifiedAt: '2026-03-06T10:00:00.000Z' },
];
const fmMarkup = async (viewMode: 'list' | 'grid') => drain(
  <DesignSystemProvider tenantConfig={TENANT('file-manager-causality')} forceEngine="modern"
    engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
    <ModernFileManager files={FILES} folders={FOLDERS} currentPath={['Workspace']} viewMode={viewMode}
      selectedItems={['a1']} onNavigate={noop} onSelectionChange={noop} onViewModeChange={noop}
      onDelete={noop} onRename={noop} />
  </DesignSystemProvider>,
);
const fmFull = `<div id="fm-list" style="inline-size:64rem">${await fmMarkup('list')}</div><div id="fm-grid" style="inline-size:64rem">${await fmMarkup('grid')}</div>`;

const recMarkup = `<div id="page" style="inline-size:64rem">${await drain(
  <DesignSystemProvider tenantConfig={TENANT('record-causality')} forceEngine="modern"
    engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
    <RecordSummaryStrip variant="default" items={[{ label: 'Status', value: 'Active', helper: 'Since yesterday' }]} />
    <RecordSummaryStrip variant="metrics" items={[{ label: 'Revenue', value: '$1.2M' }, { label: 'Count', value: '42', mono: true }]} />
    <RecordFieldGrid>
      <RecordField label="Name" value="Ada Lovelace" />
      <RecordField label="Reference" value="REC-1" mono copyValue="REC-1" href="/refs/rec-1" />
    </RecordFieldGrid>
    <RecordPanel><span>Panel body</span></RecordPanel>
    <RecordActionBar meta="3 unsaved changes" actions={<span>Save</span>} />
  </DesignSystemProvider>,
)}</div>`;

const PAIRINGS: Record<string, { markup: string; nodes: Record<string, string> }> = {
  'column-settings': {
    markup: csMarkup,
    nodes: {
      counter: "[data-part='counter']",
      hiddenLabel: "[data-part='row'][data-visible='false'] [data-part='label']",
      visibleLabel: "[data-part='row'][data-visible='true'] [data-part='label']",
      title: "[data-part='title']",
      searchInput: "input",
      footerButton: "[data-part='footer'] .ds-button",
    },
  },
  'file-manager': {
    markup: fmFull,
    nodes: {
      th: "#fm-list [data-part='list-table'] th[data-part='column-size']",
      thPlain: "#fm-list [data-part='list-table'] thead th:nth-child(2)",
      sizeCell: "#fm-list [data-part='row']:not([data-selected='true']) [data-part='size-cell']",
      dateCell: "#fm-list [data-part='row']:not([data-selected='true']) [data-part='date-cell']",
      sizeCellSelected: "#fm-list [data-part='row'][data-selected='true'] [data-part='size-cell']",
      dateCellSelected: "#fm-list [data-part='row'][data-selected='true'] [data-part='date-cell']",
      nameCellInk: "#fm-list [data-part='row'] [data-part='name-cell']",
      crumb: "#fm-list [data-part='breadcrumb'] [data-current='true'] [data-part='label']",
      deleteLabel: "#fm-list [id$='-a1-delete'] [data-part='label']",
      folderLinkLabel: "#fm-list [id$='-f1-name'] [data-part='label']",
    },
  },
  record: {
    markup: recMarkup,
    nodes: {
      summaryLabelDefault: "[data-variant='default'] [data-part='summary-item-label']",
      summaryLabelMetrics: "[data-variant='metrics'] [data-part='summary-item-label']",
      summaryHelper: "[data-part='summary-item-helper']",
      summaryValue: "[data-part='summary-item-value']",
      fieldLabel: "[data-part='field'] [data-part='field-label']",
      fieldValue: "[data-part='field'] [data-part='field-value']",
      metaLabel: "[data-part='action-bar-meta-label']",
      metaText: "[data-part='action-bar-meta-text']",
    },
  },
};

const CHANNELS = [
  '--ds-color-text-primary', '--ds-color-text-secondary', '--ds-color-text-muted',
  '--ds-color-text-tertiary', '--ds-color-bg-primary', '--ds-color-bg-secondary',
  '--ds-surface-card', '--ds-surface-canvas', '--ds-surface-panel', '--ds-color-primary',
];

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';

function chromium() {
  for (const root of [resolve(CORE_ROOT, 'package.json'), resolve(CORE_ROOT, '../../package.json')]) {
    for (const s of ['playwright', '@playwright/test']) {
      try { const m = createRequire(root)(s) as { chromium?: any }; if (m.chromium) return m.chromium; } catch { /* next */ }
    }
  }
  throw new Error('no chromium');
}

describe('ratio probe', () => {
  it('dumps ink/ground/ratio per pairing per scope', async () => {
    const OUT = resolve(CORE_ROOT, 'evidence/fam-contrast-drain/measurements');
    mkdirSync(OUT, { recursive: true });
    const browser = await chromium().launch();
    const report: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext();
      for (const scope of AXE_SCOPES) {
        const arm = await mountArm(scope.vertical, {});
        for (const [family, spec] of Object.entries(PAIRINGS)) {
          const page = await ctx.newPage();
          await page.setContent('<!doctype html><html lang="en"><head></head><body></body></html>');
          await page.addStyleTag({ content: resolvedBaseCss() });
          await page.addStyleTag({ content: arm.css });
          const out = await page.evaluate(({ markup, nodes, rootAttributes, surface, channels }: any) => {
            for (const [n, v] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, v as string);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
            const cv = document.createElement('canvas');
            cv.width = 1; cv.height = 1;
            const ctx = cv.getContext('2d', { willReadFrequently: true })!;
            // Canvas resolves EVERY css color syntax (rgb, color(srgb ...), oklab, ...)
            // to real channel bytes, which a regex over the serialization cannot.
            const parse = (c: string): number[] => {
              ctx.globalCompositeOperation = 'copy';
              ctx.fillStyle = c === '' ? 'transparent' : c;
              ctx.fillRect(0, 0, 1, 1);
              const d = ctx.getImageData(0, 0, 1, 1).data;
              const a = d[3] / 255;
              return [d[0], d[1], d[2], a];
            };
            const lum = ([r, g, b]: number[]) => {
              const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
              return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
            };
            /** Proper source-over: the accumulated layer stays translucent until an opaque one lands. */
            const over = (src: number[], dst: number[]) => {
              const a = src[3] + dst[3] * (1 - src[3]);
              if (a === 0) return [0, 0, 0, 0];
              return [
                (src[0] * src[3] + dst[0] * dst[3] * (1 - src[3])) / a,
                (src[1] * src[3] + dst[1] * dst[3] * (1 - src[3])) / a,
                (src[2] * src[3] + dst[2] * dst[3] * (1 - src[3])) / a,
                a,
              ];
            };
            const hex = (c: number[]) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
            const groundOf = (el: Element) => {
              let acc: number[] = [0, 0, 0, 0];
              let node: Element | null = el.parentElement;
              while (node) {
                const bg = parse(getComputedStyle(node).backgroundColor);
                if (bg[3] > 0) acc = over(acc, bg);
                if (acc[3] >= 1) return acc;
                node = node.parentElement;
              }
              return over(acc, [255, 255, 255, 1]);
            };
            const values: Record<string, unknown> = { channels: {} };
            const rootStyle = getComputedStyle(document.documentElement);
            for (const c of channels) (values.channels as any)[c] = rootStyle.getPropertyValue(c).trim();
            for (const [id, sel] of Object.entries(nodes as Record<string, string>)) {
              const el = main.querySelector(sel);
              if (!el) { values[id] = '<no match>'; continue; }
              const ink = parse(getComputedStyle(el).color);
              const own = parse(getComputedStyle(el).backgroundColor);
              const ground = own[3] >= 1 ? own : over(own, groundOf(el));
              const inkOn = over(ink, ground);
              const l1 = lum(inkOn), l2 = lum(ground);
              const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
              values[id] = { ink: hex(inkOn), ground: hex(ground), ratio: Math.round(ratio * 100) / 100 };
            }
            return values;
          }, {
            markup: spec.markup, nodes: spec.nodes, surface: SURFACE, channels: CHANNELS,
            rootAttributes: { ...arm.rootAttributes, 'data-theme': scope.theme },
          });
          report[`${family} :: ${scope.vertical} ${scope.theme}`] = out;
          await page.close();
        }
      }
    } finally { await browser.close(); }
    const tag = process.env.PROBE_TAG ?? 'run';
    writeFileSync(resolve(OUT, `ratios-${tag}.json`), JSON.stringify(report, null, 2));
    console.log(`[probe] wrote ratios-${tag}.json`);
  }, 900_000);
});
