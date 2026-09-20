/** TEMPORARY sighted-evidence capture (WO-FAM-08/10 contrast drain). Delete before handoff. */
import React from 'react';
import { Writable } from 'node:stream';
import { mkdirSync } from 'node:fs';
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
const fmList = await drain(
  <DesignSystemProvider tenantConfig={TENANT('fm')} forceEngine="modern"
    engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
    <ModernFileManager files={FILES} folders={FOLDERS} currentPath={['Workspace']} viewMode="list"
      selectedItems={['a1']} onNavigate={noop} onSelectionChange={noop} onViewModeChange={noop}
      onDelete={noop} onRename={noop} />
  </DesignSystemProvider>,
);

const recRendered = await drain(
  <DesignSystemProvider tenantConfig={TENANT('record')} forceEngine="modern"
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
);

const SCENES: Record<string, string> = {
  'column-settings': `<div style="inline-size:22rem">${csMarkup}</div>`,
  'file-manager': `<div style="inline-size:56rem">${fmList}</div>`,
  record: `<div style="inline-size:56rem">${recRendered}</div>`,
};
const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 24px; display:inline-block;';

function chromium() {
  for (const root of [resolve(CORE_ROOT, 'package.json'), resolve(CORE_ROOT, '../../package.json')]) {
    for (const s of ['playwright', '@playwright/test']) {
      try { const m = createRequire(root)(s) as { chromium?: any }; if (m.chromium) return m.chromium; } catch { /* next */ }
    }
  }
  throw new Error('no chromium');
}

describe('sighted capture', () => {
  it('captures every family in every gated scope', async () => {
    const tag = process.env.PROBE_TAG ?? 'run';
    const OUT = process.env.CAPTURE_OUT ?? resolve(CORE_ROOT, `evidence/fam-contrast-drain/${tag}`);
    mkdirSync(OUT, { recursive: true });
    const browser = await chromium().launch();
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2 });
      for (const scope of AXE_SCOPES) {
        const arm = await mountArm(scope.vertical, {});
        for (const [family, markup] of Object.entries(SCENES)) {
          const page = await ctx.newPage();
          await page.setViewportSize({ width: 1100, height: 900 });
          await page.setContent('<!doctype html><html lang="en"><head></head><body style="margin:0"></body></html>');
          await page.addStyleTag({ content: resolvedBaseCss() });
          await page.addStyleTag({ content: arm.css });
          await page.evaluate(({ markup, rootAttributes, surface }: any) => {
            for (const [n, v] of Object.entries(rootAttributes)) document.documentElement.setAttribute(n, v as string);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
          }, { markup, surface: SURFACE, rootAttributes: { ...arm.rootAttributes, 'data-theme': scope.theme } });
          const el = await page.$('main');
          await el!.screenshot({ path: resolve(OUT, `${family}--${scope.vertical}-${scope.theme}.png`) });
          await page.close();
        }
      }
    } finally { await browser.close(); }
    console.log('[capture] wrote to', OUT);
  }, 900_000);
});
