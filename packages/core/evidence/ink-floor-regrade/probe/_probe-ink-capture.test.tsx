/**
 * SCRATCH capture (supporting-ink floor): the two representative surfaces the
 * re-grade repaints — a quiet form section (`GuidedDraftFormSurface`, the
 * family this lot was routed from) and a data cell grid (`PatternDataTable`) —
 * server-rendered and shot in real Chromium at 2x, evnto light and bithire
 * light. `CAPTURE_LABEL=before|after` selects the output folder.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { GuidedDraftFormSurface } from '@/components/surfaces/presentation/pages/forms/guided-draft-form';
import { PatternDataTable } from '@/components/patterns/data/data-table';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const LABEL = process.env.CAPTURE_LABEL ?? 'head';
const OUT = resolve(__dirname, `../captures/${LABEL}`);

const TENANT: TenantConfig = {
  slug: 'ink-floor', name: 'Ink floor', theme: 'base', locale: 'en',
  fallbackLocale: 'en', plan: 'enterprise', features: [], branding: { companyName: 'Ink floor' },
};

const ROWS = [
  { id: 'r1', name: 'Amelia Hernandez-Walker', role: 'Senior Product Designer', location: 'Buenos Aires - Remote', signal: 96, status: 'Decision ready' },
  { id: 'r2', name: 'Noah Okafor', role: 'Staff ML Platform Engineer', location: 'Lagos - Hybrid', signal: 88, status: 'Panel review' },
  { id: 'r3', name: 'Mira Lindqvist', role: 'Design systems lead', location: 'Stockholm - Onsite', signal: 91, status: 'Offer planning' },
];
const COLUMNS = [
  { key: 'name', header: 'Candidate', accessorKey: 'name', sortable: true, minWidth: 210 },
  { key: 'role', header: 'Current focus', accessorKey: 'role', minWidth: 230 },
  { key: 'location', header: 'Location', accessorKey: 'location', minWidth: 200, priority: 'low' as const },
  { key: 'signal', header: 'Signal', accessorKey: 'signal', align: 'right' as const, sortable: true, minWidth: 90 },
  { key: 'status', header: 'Decision state', accessorKey: 'status', minWidth: 150 },
];

async function render(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
      {node}
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude.pipe(new Writable({ write(c, _e, d) { html += c.toString(); d(); } }))
      .on('finish', () => res()).on('error', rej);
  });
  return html;
}

const form = await render(
  <GuidedDraftFormSurface
    title="Create event"
    subtitle="Drafts save as you type"
    sections={[
      { key: 'info', title: 'Basic info', description: 'What is this event called and who is it for', isComplete: true, render: () => <div>Info fields</div> },
      { key: 'schedule', title: 'Schedule', description: 'When does it run', hasErrors: true, render: () => <div>Schedule fields</div> },
      { key: 'access', title: 'Access', description: 'Who can see the event page', render: () => <div>Access fields</div> },
    ]}
    draftStatus="saved"
    lastSavedAt="12:30"
    validationIssues={[{ field: 'Name', message: 'Required', severity: 'error', sectionKey: 'schedule' }]}
    secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: () => undefined }]}
    submitLabel="Create"
    onSubmit={() => undefined}
  />,
);
const table = await render(
  <PatternDataTable data={ROWS as never} columns={COLUMNS as never} rowKey="id" />,
);

const markup =
  `<section id="form" style="inline-size:62rem">${form}</section>` +
  `<section id="table" style="inline-size:62rem">${table}</section>`;

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 20px; display:grid; gap:28px;';

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' }> = [
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'bithire', theme: 'light' },
];

describe('ink floor capture', () => {
  it('captures the quiet form section and the data cells in two light scopes', async () => {
    mkdirSync(OUT, { recursive: true });
    const req = createRequire(resolve(__dirname, '../../../../showroom/package.json'));
    const { chromium } = req('@playwright/test') as { chromium: any };
    const browser = await chromium.launch();
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1180, height: 1400 } });
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>capture</title></head><body style="margin:0"></body></html>');
        await page.addStyleTag({ content: resolvedBaseCss() });
        await page.addStyleTag({ content: arm.css });
        await page.evaluate(
          ({ markup, rootAttributes, surface, theme }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, theme: scope.theme },
        );
        const name = `${scope.vertical}-${scope.theme}`;
        await page.screenshot({ path: resolve(OUT, `${name}.png`), fullPage: true });
        writeFileSync(resolve(OUT, `${name}.png.txt`), `${LABEL} ${scope.vertical} ${scope.theme} 1180px\n`);
        await page.close();
      }
    } finally {
      await browser.close();
    }
    expect(SCOPES).toHaveLength(2);
  }, 300_000);
});
