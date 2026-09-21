/**
 * SCRATCH capture (WO contrast arm 3b): the danger surfaces this regrade
 * repaints, server-rendered and shot in real Chromium at 2x, one file per
 * vertical x mode. The file-manager row is shot twice: as it ships today, and
 * with the FOLLOW-UP family half emulated in the page (the delete Button
 * stamped `data-tone='danger'` and the skin's `color: var(--ds-color-error)`
 * neutralised), because that is the state this packet's legs were chosen for.
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
import { Button } from '@/components/primitives/inputs/button';
import { Alert } from '@/components/primitives/feedback/alert';
import { Tooltip } from '@/components/primitives/display/tooltip';
import ModernFileManager from '@/components/patterns/data/file-manager/engines/modern';
import type { FileItem, FolderItem } from '@/components/patterns/data/file-manager/contracts';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const noop = () => {};
const LABEL = process.env.CAPTURE_LABEL ?? 'head';
const OUT = resolve(__dirname, `../../../evidence/fam-error-mode-regrade/captures/${LABEL}`);

const FOLDERS: FolderItem[] = [{ id: 'f1', name: 'Contracts', type: 'folder', modifiedAt: '2026-03-02T10:00:00.000Z' }];
const FILES: FileItem[] = [
  { id: 'a1', name: 'offer-letter.pdf', type: 'file', mimeType: 'application/pdf', size: 512_000, modifiedAt: '2026-03-05T10:00:00.000Z' },
];
const TENANT: TenantConfig = {
  slug: 'error-regrade', name: 'Error regrade', theme: 'base', locale: 'en',
  fallbackLocale: 'en', plan: 'enterprise', features: [], branding: { companyName: 'Error regrade' },
};

function Panel(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="danger">Delete account</Button>
        <span data-probe="solid-hover"><Button variant="danger">Delete (hover)</Button></span>
        <span data-probe="solid-pressed"><Button variant="danger">Delete (pressed)</Button></span>
        <Button variant="ghost" danger>Delete</Button>
        <span data-probe="quiet-hover"><Button variant="ghost" danger>Delete (hover)</Button></span>
        <span data-probe="quiet-pressed"><Button variant="ghost" danger>Delete (pressed)</Button></span>
        <Button variant="outline" danger>Remove</Button>
      </div>
      <Alert type="error" message="Upload failed" description="The signed offer letter could not be stored. Try again." showIcon />
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <Tooltip title="This field is required" color="error" open placement="bottom">
          <Button variant="outline">Tooltip anchor</Button>
        </Tooltip>
      </div>
    </div>
  );
}

async function render(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" engineVisual={firstPartyEngineVisual('rottay', 'modern')} skipCssLoading ssrViewport="desktop">
      {node}
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude.pipe(new Writable({ write(c, _e, d) { html += c.toString(); d(); } })).on('finish', () => res()).on('error', rej);
  });
  return html;
}

const panel = await render(<Panel />);
const fm = await render(
  <ModernFileManager files={FILES} folders={FOLDERS} currentPath={['Workspace']} viewMode="list" selectedItems={['a1']}
    onNavigate={noop} onSelectionChange={noop} onViewModeChange={noop} onDelete={noop} onRename={noop} />,
);
const markup =
  `<section id="panel">${panel}</section>` +
  `<section id="fm-today" style="inline-size:60rem">${fm}</section>` +
  `<section id="fm-family-half" style="inline-size:60rem">${fm}</section>`;

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 20px; display:grid; gap:22px;';

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'rottay', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
];

describe('error regrade capture', () => {
  it('captures the danger surfaces in six scopes', async () => {
    mkdirSync(OUT, { recursive: true });
    const req = createRequire(resolve(__dirname, '../../../../showroom/package.json'));
    const { chromium } = req('@playwright/test') as { chromium: any };
    const browser = await chromium.launch();
    const readings: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1180, height: 1180 } });
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>capture</title></head><body style="margin:0"></body></html>');
        await page.addStyleTag({ content: resolvedBaseCss() });
        await page.addStyleTag({ content: arm.css });
        // The FOLLOW-UP family half, emulated for the right-hand file-manager
        // only: the skin's fill-role-as-ink statement is neutralised so the
        // Button's own governed danger ink reaches the label.
        await page.addStyleTag({ content:
          `#fm-family-half [data-part='item-action'][data-action='delete']{color: var(--ds-button-error-border) !important;}` });
        readings[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ markup, rootAttributes, surface, theme }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) document.documentElement.setAttribute(n, v);
            document.documentElement.setAttribute('data-theme', theme);
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
            // Stamp the interaction states the skin paints, so hover/pressed
            // are in the same frame as rest.
            const stamp = (probe: string, state: string) => {
              const el = document.querySelector(`[data-probe='${probe}'] .ds-button`);
              if (el) { el.setAttribute('data-state', state); (el as HTMLElement).style.transition = 'none'; }
            };
            stamp('solid-hover', 'hovered'); stamp('solid-pressed', 'pressed');
            stamp('quiet-hover', 'hovered'); stamp('quiet-pressed', 'pressed');
            const del = document.querySelector("#fm-family-half [data-part='item-action'][data-action='delete']");
            del?.setAttribute('data-tone', 'danger');
            const read = (sel: string, prop: string) => {
              const el = document.querySelector(sel);
              return el ? getComputedStyle(el).getPropertyValue(prop) : '<no match>';
            };
            return {
              solidRestBg: read('#panel .ds-button[data-variant="danger"]', 'background-color'),
              quietRestInk: read("#panel [data-probe='quiet-hover'] .ds-button", 'color'),
              alertWell: read('#panel .ds-alert', 'background-color'),
              fmTodayInk: read("#fm-today [data-part='item-action'][data-action='delete']", 'color'),
              fmHalfInk: read("#fm-family-half [data-part='item-action'][data-action='delete']", 'color'),
            };
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, theme: scope.theme },
        );
        await page.screenshot({ path: `${OUT}/${scope.vertical}-${scope.theme}.png`, fullPage: true });
        await page.close();
      }
    } finally {
      await browser.close();
    }
    writeFileSync(`${OUT}/readings.json`, `${JSON.stringify(readings, null, 2)}\n`);
    expect(Object.keys(readings)).toHaveLength(6);
  }, 600_000);
});
