/** SCRATCH capture (file-manager arms 2 + 3a): toolbar crumb + a row's actions. */
import React from 'react';
import { Writable } from 'node:stream';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernFileManager from '@/components/patterns/data/file-manager/engines/modern';
import type { FileItem, FolderItem } from '@/components/patterns/data/file-manager/contracts';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const noop = () => {};
const FOLDERS: FolderItem[] = [{ id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' }];
const FILES: FileItem[] = [
  { id: 'a1', name: 'offer-letter.pdf', type: 'file', mimeType: 'application/pdf', size: 512_000, modifiedAt: '2026-03-05T10:00:00.000Z' },
  { id: 'a2', name: 'headshot.png', type: 'file', mimeType: 'image/png', size: 128_000, modifiedAt: '2026-03-06T10:00:00.000Z' },
];
const TENANT: TenantConfig = {
  slug: 'file-manager-causality', name: 'File manager causality', theme: 'base', locale: 'en',
  fallbackLocale: 'en', plan: 'enterprise', features: [], branding: { companyName: 'File manager causality' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
      <ModernFileManager files={FILES} folders={FOLDERS} currentPath={['Workspace']} viewMode="list" selectedItems={['a1']}
        onNavigate={noop} onSelectionChange={noop} onViewModeChange={noop} onDelete={noop} onRename={noop} />
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude.pipe(new Writable({ write(c, _e, d) { html += c.toString(); d(); } })).on('finish', () => res()).on('error', rej);
  });
  return html;
}

const markup = `<div id="fm-list" style="inline-size:64rem">${await serverMarkup()}</div>`;
const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';
const LABEL = process.env.CAPTURE_LABEL ?? 'head';
const GROUND_FIX = process.env.CAPTURE_GROUND_FIX === '1';
const OUT = resolve(__dirname, `../../evidence/fam-fm-contrast-close/captures/${LABEL}`);

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
];

describe('fm capture', () => {
  it('captures the toolbar and the row actions', async () => {
    mkdirSync(OUT, { recursive: true });
    const req = createRequire(resolve(__dirname, '../../../showroom/package.json'));
    const { chromium } = req('@playwright/test') as { chromium: any };
    const browser = await chromium.launch();
    const applied: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1180, height: 700 } });
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>capture</title></head><body style="margin:0"></body></html>');
        await page.addStyleTag({ content: resolvedBaseCss() });
        await page.addStyleTag({ content: arm.css });
        if (GROUND_FIX) await page.addStyleTag({ content: '[data-ds-root]{--ds-card-bg: var(--ds-color-bg-elevated);}' });
        applied[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ markup, rootAttributes, surface, theme }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) document.documentElement.setAttribute(n, v);
            document.documentElement.setAttribute('data-theme', theme);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
            const chip = main.querySelector("[data-part='crumb'][data-current='true']")!;
            const del = main.querySelector("[data-part='item-action'][data-action='delete']")!;
            return {
              chipBg: getComputedStyle(chip).backgroundColor,
              deleteInk: getComputedStyle(del).color,
              deleteTone: del.getAttribute('data-tone'),
            };
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, theme: scope.theme },
        );
        await page.screenshot({ path: `${OUT}/${scope.vertical}-${scope.theme}.png`, clip: { x: 0, y: 0, width: 1100, height: 420 } });
        await page.close();
      }
    } finally {
      await browser.close();
    }
    console.log(LABEL, JSON.stringify(applied, null, 2));
    expect(Object.keys(applied)).toHaveLength(5);
  }, 600_000);
});
