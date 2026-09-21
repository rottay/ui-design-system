/**
 * SCRATCH capture (the `#e5e5e5` ground-side exit): the two representative
 * wells the brief names — the `GuidedDraftFormSurface` draft-status chip
 * (`background: var(--ds-color-bg-tertiary)`) and a filled `Card`
 * (`--ds-card-flat-bg -> var(--ds-surface-panel)`) carrying supporting ink —
 * server-rendered and shot in real Chromium at 2x, bithire light and evnto
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
import { Card } from '@/components/primitives/display/card';
import { Text } from '@/components/primitives/display/typography/compound/text';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const LABEL = process.env.CAPTURE_LABEL ?? 'head';
const OUT = resolve(__dirname, `../captures/${LABEL}`);

const TENANT: TenantConfig = {
  slug: 'ground-well-exit', name: 'Ground well exit', theme: 'base', locale: 'en',
  fallbackLocale: 'en', plan: 'enterprise', features: [], branding: { companyName: 'Ground well exit' },
};

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
    ]}
    draftStatus="saved"
    lastSavedAt="12:30"
    validationIssues={[{ field: 'Name', message: 'Required', severity: 'error', sectionKey: 'schedule' }]}
    secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: () => undefined }]}
    submitLabel="Create"
    onSubmit={() => undefined}
  />,
);

const panel = await render(
  <Card variant="filled" padding="lg">
    <Text as="h3" size="lg" weight="semibold">Retention panel</Text>
    <Text size="sm" color="secondary">Secondary supporting line on the panel ground</Text>
    <Text size="sm" color="muted">Muted supporting line — the rung the exit repairs (4.20 to 4.52)</Text>
    <Text size="xs" color="tertiary">Tertiary caption on the same ground</Text>
  </Card>,
);

const markup =
  `<section id="form" style="inline-size:60rem">${form}</section>` +
  `<section id="panel" style="inline-size:36rem">${panel}</section>`;

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 20px; display:grid; gap:24px;';

const SCOPES: Array<{ vertical: 'bithire' | 'evnto'; theme: 'light' }> = [
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'evnto', theme: 'light' },
];

describe('ground well capture', () => {
  it('captures the draft-status chip and a filled panel in two light scopes', async () => {
    mkdirSync(OUT, { recursive: true });
    const req = createRequire(resolve(__dirname, '../../../../showroom/package.json'));
    const { chromium } = req('@playwright/test') as { chromium: any };
    const browser = await chromium.launch();
    try {
      const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1060, height: 1200 } });
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
        // A tight read of the chip: the one well whose ground is neat bg-tertiary.
        const chip = await page.$("#form [data-part='draft-status']");
        if (chip) {
          const box = await chip.boundingBox();
          if (box) {
            await page.screenshot({
              path: resolve(OUT, `${name}-chip.png`),
              clip: { x: Math.max(0, box.x - 24), y: Math.max(0, box.y - 18), width: Math.min(420, box.width + 260), height: box.height + 36 },
            });
          }
        }
        writeFileSync(resolve(OUT, `${name}.png.txt`), `${LABEL} ${scope.vertical} ${scope.theme} 1060px\n`);
        await page.close();
      }
    } finally {
      await browser.close();
    }
    expect(SCOPES).toHaveLength(2);
  }, 600_000);
});
