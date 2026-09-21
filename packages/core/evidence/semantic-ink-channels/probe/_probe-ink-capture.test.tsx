/**
 * SCRATCH capture (the semantic tone-ink channels): the `GuidedDraftFormSurface`
 * draft-status chip in all three tones (saved/unsaved/error) plus the other
 * call sites, server-rendered and shot in real Chromium at 2x, in the two
 * scopes the pins name — evnto light and bithire dark.
 * `CAPTURE_LABEL=before|after` selects the output folder.
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
import { Button, Card, Flex, Stack, Text } from '@/components/primitives';

import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const LABEL = process.env.CAPTURE_LABEL ?? 'head';
const OUT = resolve(__dirname, `../captures/${LABEL}`);

const TENANT: TenantConfig = {
  slug: 'semantic-ink-channels', name: 'Semantic ink channels', theme: 'base', locale: 'en',
  fallbackLocale: 'en', plan: 'enterprise', features: [], branding: { companyName: 'Semantic ink channels' },
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

function form(status: 'saved' | 'unsaved' | 'error'): React.ReactElement {
  return (
    <GuidedDraftFormSurface
      title="Create event"
      subtitle="Drafts save as you type"
      sections={[
        { key: 'info', title: 'Basic info', description: 'What is this event called', isComplete: true, render: () => <div>Info fields</div> },
        { key: 'schedule', title: 'Schedule', hasErrors: true, render: () => <div>Schedule fields</div> },
      ]}
      draftStatus={status}
      lastSavedAt="12:30"
      validationIssues={[
        { field: 'Name', message: 'Required', severity: 'error' },
        { field: 'Capacity', message: 'Looks low', severity: 'warning' },
      ]}
      submitLabel="Create"
      onSubmit={() => undefined}
    />
  );
}

function others(): React.ReactElement {
  return (
    <Stack spacing="md">
      <Card className="ds-import-export__error-card" variant="outlined">
        <Card.Body>
          <Text weight="semibold" color="error" data-part="error-title">Validation Errors</Text>
        </Card.Body>
      </Card>
      <Card variant="filled">
        <Card.Body>
          <Flex gap={8} align="center">
            <Text weight="semibold" color="success" data-part="success-message">Import completed successfully</Text>
          </Flex>
        </Card.Body>
      </Card>
      <Card variant="elevated">
        <Card.Body>
          <Button variant="ghost" size="sm">
            <Text className="ds-notification__destructive-text" color="error">Delete</Text>
          </Button>
        </Card.Body>
      </Card>
      <Card variant="filled">
        <Card.Body>
          <Stack spacing="xs">
            <Text size="sm" color="warning">Bounce rate 48%</Text>
            <Text size="sm" color="success">Conversion 12%</Text>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

const SURFACE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 20px; display:grid; gap:24px;';

const SCOPES: Array<{ vertical: 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
];

describe('tone ink capture', () => {
  it('captures the three draft-status chips and the other call sites in the two pinned scopes', async () => {
    const markup =
      `<section id="saved" style="inline-size:60rem">${await render(form('saved'))}</section>` +
      `<section id="unsaved" style="inline-size:60rem">${await render(form('unsaved'))}</section>` +
      `<section id="errored" style="inline-size:60rem">${await render(form('error'))}</section>` +
      `<section id="others" style="inline-size:36rem">${await render(others())}</section>`;

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
            if (theme === 'dark') document.documentElement.classList.add('dark');
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);
          },
          { markup, rootAttributes: arm.rootAttributes, surface: SURFACE, theme: scope.theme },
        );
        const name = `${scope.vertical}-${scope.theme}`;
        await page.screenshot({ path: resolve(OUT, `${name}.png`), fullPage: true });
        for (const [id, file] of [['#saved', 'chip-success'], ['#unsaved', 'chip-warning'], ['#errored', 'chip-error']] as const) {
          const chip = await page.$(`${id} [data-part='draft-status']`);
          if (!chip) continue;
          await chip.scrollIntoViewIfNeeded();
          const box = await chip.boundingBox();
          if (!box) continue;
          await page.screenshot({
            path: resolve(OUT, `${name}-${file}.png`),
            clip: { x: Math.max(0, box.x - 24), y: Math.max(0, box.y - 18), width: Math.min(420, box.width + 260), height: box.height + 36 },
          });
        }
        const others = await page.$('#others');
        if (others) await others.screenshot({ path: resolve(OUT, `${name}-call-sites.png`) });
        writeFileSync(resolve(OUT, `${name}.png.txt`), `${LABEL} ${scope.vertical} ${scope.theme} 1060px\n`);
        await page.close();
      }
    } finally {
      await browser.close();
    }
    expect(SCOPES).toHaveLength(2);
  }, 600_000);
});
