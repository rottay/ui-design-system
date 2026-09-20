/** TEMPORARY measurement probe (WO-FAM-08/10 contrast drain). Delete before handoff. */
import React from 'react';
import { Writable } from 'node:stream';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
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
import { AXE_SCOPES, auditAxe, seriousFindings } from '@tests/support/family-causality';

const noop = () => {};

async function drain(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(node);
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude
      .pipe(new Writable({ write(c, _e, d) { html += c.toString(); d(); } }))
      .on('finish', () => res())
      .on('error', rej);
  });
  return html;
}

const TENANT = (slug: string): TenantConfig => ({
  slug, name: slug, theme: 'base', locale: 'en', fallbackLocale: 'en',
  plan: 'enterprise', features: [], branding: { companyName: slug },
});

/* ---- column-settings ---- */
const csMarkup = await drain(
  <EngineProvider defaultEngine="modern">
    <ModernColumnSettingsDropdown
      allColumns={[{ key: 'name', header: 'Name' }, { key: 'status', header: 'Status' }, { key: 'owner', header: 'Owner' }]}
      visibleColumns={['name', 'status']}
      lockedColumns={[]}
      columnOrder={['name', 'status', 'owner']}
      pinnedColumns={{ left: [], right: [] }}
      onToggleVisibility={noop} onReorder={noop} onTogglePin={noop} onReset={noop}
    />
  </EngineProvider>,
);

/* ---- file-manager ---- */
const FOLDERS: FolderItem[] = [{ id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' }];
const FILES: FileItem[] = [
  { id: 'a1', name: 'offer-letter.pdf', type: 'file', mimeType: 'application/pdf', size: 512_000, modifiedAt: '2026-03-05T10:00:00.000Z' },
  { id: 'a2', name: 'headshot.png', type: 'file', mimeType: 'image/png', size: 128_000, modifiedAt: '2026-03-06T10:00:00.000Z' },
];
async function fmMarkup(viewMode: 'list' | 'grid') {
  return drain(
    <DesignSystemProvider tenantConfig={TENANT('file-manager-causality')} forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
      <ModernFileManager files={FILES} folders={FOLDERS} currentPath={['Workspace']} viewMode={viewMode}
        selectedItems={['a1']} onNavigate={noop} onSelectionChange={noop} onViewModeChange={noop}
        onDelete={noop} onRename={noop} />
    </DesignSystemProvider>,
  );
}
const fmList = await fmMarkup('list');
const fmGrid = await fmMarkup('grid');
const fmFull = `<div id="fm-list" style="inline-size:64rem">${fmList}</div><div id="fm-grid" style="inline-size:64rem">${fmGrid}</div>`;

/* ---- record ---- */
const recRendered = await drain(
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
);
const recMarkup = `<div id="page" style="inline-size:64rem">${recRendered}</div>`;

const OUT = resolve(__dirname, '../../../evidence/fam-contrast-drain/measurements');

describe('axe debt probe', () => {
  it('dumps every serious finding with fg/bg/ratio', async () => {
    mkdirSync(OUT, { recursive: true });
    const families = { 'column-settings': csMarkup, 'file-manager': fmFull, record: recMarkup };
    const report: Record<string, unknown> = {};
    for (const [family, markup] of Object.entries(families)) {
      for (const scope of AXE_SCOPES) {
        const findings = seriousFindings(await auditAxe({ ...scope, markup }));
        if (findings.length === 0) continue;
        report[`${family} :: ${scope.vertical} ${scope.theme}`] = findings.map((f) => ({
          id: f.id,
          nodes: f.targets.map((t) => ({ target: t.target, fg: t.foreground, bg: t.background, ratio: t.ratio })),
        }));
      }
    }
    const tag = process.env.PROBE_TAG ?? 'run';
    writeFileSync(resolve(OUT, `${tag}.json`), JSON.stringify(report, null, 2));
    console.log(`[probe] wrote ${resolve(OUT, `${tag}.json`)}`);
  }, 900_000);
});
