/**
 * SCRATCH probe (the semantic tone-ink channels, contrast lane).
 *
 * Through the productive door (`documentThemeIntent -> compileThemeIntent ->
 * emitThemeCss`) into real Chromium, six vertical x mode scopes:
 *
 *  1. CHANNEL census - what `--ds-color-{tone}` and `--ds-color-{tone}-ink`
 *     resolve to per scope, so the swap is measured rather than argued.
 *  2. PINNED nodes - the real `span[data-part='draft-status-label']` from
 *     server markup of `GuidedDraftFormSurface`, one render per draft status
 *     so all three tones ride the same real chip ground.
 *  3. CALL-SITE table - every other production consumer of the typography
 *     tone rules: the two real `validation-issue-field` nodes from the same
 *     server markup, plus verbatim reconstructions of the remaining four
 *     sites (import-export x2, notification, brand-studio fixture) on the
 *     ground their source context paints.
 *
 * Colours resolve through the node's own computed style and are read through
 * a 1x1 canvas: `color-mix()` serializes as `color(srgb ...)`.
 */
import React from 'react';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { Writable } from 'node:stream';
import { writeFileSync, mkdirSync } from 'node:fs';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { GuidedDraftFormSurface } from '@/components/surfaces/presentation/pages/forms/guided-draft-form';
import { Button, Card, Flex, Stack, Text } from '@/components/primitives';
import { mountArm, resolvedBaseCss } from '@tests/support/family-causality';

const OUT = process.env.PROBE_OUT ?? resolve(__dirname, 'out.json');

function chromium() {
  const req = createRequire(resolve(__dirname, '../../../../showroom/package.json'));
  return (req('@playwright/test') as { chromium: any }).chromium;
}

const SCOPES: Array<{ vertical: 'rottay' | 'bithire' | 'evnto'; theme: 'light' | 'dark' }> = [
  { vertical: 'rottay', theme: 'light' },
  { vertical: 'rottay', theme: 'dark' },
  { vertical: 'bithire', theme: 'light' },
  { vertical: 'bithire', theme: 'dark' },
  { vertical: 'evnto', theme: 'light' },
  { vertical: 'evnto', theme: 'dark' },
];

const CHANNELS = [
  '--ds-color-success',
  '--ds-color-success-ink',
  '--ds-color-warning',
  '--ds-color-warning-ink',
  '--ds-color-error',
  '--ds-color-error-ink',
];

/**
 * Every production consumer of the three typography tone rules, by source
 * site. `real` rows are read out of server markup of the real surface; `recon`
 * rows are the source JSX verbatim on the ground its context paints, because
 * the node only exists behind client-side flow state.
 */
const SITES: Array<{ id: string; where: string; kind: 'real' | 'recon'; selector: string; tone: string }> = [
  { id: 'draft-status-label/success', where: 'guided-draft-form:242', kind: 'real', selector: "#saved span[data-part='draft-status-label']", tone: 'success' },
  { id: 'draft-status-label/warning', where: 'guided-draft-form:242', kind: 'real', selector: "#unsaved span[data-part='draft-status-label']", tone: 'warning' },
  { id: 'draft-status-label/error', where: 'guided-draft-form:242', kind: 'real', selector: "#errored span[data-part='draft-status-label']", tone: 'error' },
  { id: 'validation-issue-field/error', where: 'guided-draft-form:862', kind: 'real', selector: "#saved [data-probe-issue='error']", tone: 'error' },
  { id: 'validation-issue-field/warning', where: 'guided-draft-form:862', kind: 'real', selector: "#saved [data-probe-issue='warning']", tone: 'warning' },
  { id: 'import-export/error-title', where: 'admin/import-export:285', kind: 'recon', selector: "#recon [data-part='error-title']", tone: 'error' },
  { id: 'import-export/success-message', where: 'admin/import-export:351', kind: 'recon', selector: "#recon [data-part='success-message']", tone: 'success' },
  { id: 'notification/destructive-text', where: 'experience/notification:220', kind: 'recon', selector: '#recon .ds-notification__destructive-text', tone: 'error' },
  { id: 'brand-studio/metric-warning', where: 'brand-studio/visual-excellence:94', kind: 'recon', selector: "#recon [data-probe='fixture-warning']", tone: 'warning' },
  { id: 'brand-studio/metric-success', where: 'brand-studio/visual-excellence:94', kind: 'recon', selector: "#recon [data-probe='fixture-success']", tone: 'success' },
];

const TENANT: TenantConfig = {
  slug: 'semantic-ink-channels',
  name: 'Semantic ink channels',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Semantic ink channels' },
};

async function render(node: React.ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      {node}
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((res, rej) => {
    prelude
      .pipe(new Writable({ write(chunk, _e, done) { html += chunk.toString(); done(); } }))
      .on('finish', () => res())
      .on('error', rej);
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
      // No `sectionKey`: the field renders through the Typography tone branch
      // rather than the jump-to-section Button branch.
      validationIssues={[
        { field: 'Name', message: 'Required', severity: 'error' },
        { field: 'Capacity', message: 'Looks low', severity: 'warning' },
      ]}
      submitLabel="Create"
      onSubmit={() => undefined}
    />
  );
}

/**
 * The four sites whose node only exists behind client flow state, written
 * exactly as their source writes them, inside the wrapper their source nests
 * them in.
 */
function reconstructions(): React.ReactElement {
  return (
    <Stack spacing="md">
      <Card className="ds-import-export__error-card" variant="outlined">
        <Card.Body>
          <Stack spacing="xs">
            <Text weight="semibold" color="error" data-part="error-title">
              Validation Errors
            </Text>
          </Stack>
        </Card.Body>
      </Card>
      <Card variant="filled">
        <Card.Body>
          <Flex gap={8} align="center">
            <Text weight="semibold" color="success" data-part="success-message">
              Import completed successfully
            </Text>
          </Flex>
        </Card.Body>
      </Card>
      <Card variant="elevated">
        <Card.Body>
          <Button variant="ghost" size="sm">
            <Text className="ds-notification__destructive-text" color="error">
              Delete
            </Text>
          </Button>
        </Card.Body>
      </Card>
      <Card variant="filled">
        <Card.Body>
          <Stack spacing="xs">
            <Text size="sm" color="warning" data-probe="fixture-warning">
              Bounce rate 48%
            </Text>
            <Text size="sm" color="success" data-probe="fixture-success">
              Conversion 12%
            </Text>
          </Stack>
        </Card.Body>
      </Card>
    </Stack>
  );
}

/**
 * The two validation rows render in issue order; tag them by that order so
 * the probe can address each severity by identity.
 */
function tagIssues(html: string): string {
  let seen = 0;
  return html.replace(/data-part="validation-issue-field"/g, () => {
    const tone = seen === 0 ? 'error' : 'warning';
    seen += 1;
    return `data-part="validation-issue-field" data-probe-issue="${tone}"`;
  });
}

describe('semantic tone-ink probe', () => {
  it('reads every tone channel, the three pinned chips and every other call site in six scopes', async () => {
    const markup =
      `<div id="host" style="inline-size:64rem">` +
      `<div id="saved">${tagIssues(await render(form('saved')))}</div>` +
      `<div id="unsaved">${await render(form('unsaved'))}</div>` +
      `<div id="errored">${await render(form('error'))}</div>` +
      `<div id="recon" style="inline-size:36rem">${await render(reconstructions())}</div>` +
      `</div>`;

    const browser = await chromium().launch();
    const out: Record<string, unknown> = {};
    try {
      const ctx = await browser.newContext();
      const base = resolvedBaseCss();
      for (const scope of SCOPES) {
        const page = await ctx.newPage();
        const arm = await mountArm(scope.vertical, {});
        await page.setContent('<!doctype html><html lang="en"><head><title>p</title></head><body></body></html>');
        await page.addStyleTag({ content: base });
        await page.addStyleTag({ content: arm.css });
        out[`${scope.vertical} ${scope.theme}`] = await page.evaluate(
          ({ rootAttributes, theme, channels, sites, markup, surface }: any) => {
            for (const [n, v] of Object.entries(rootAttributes as Record<string, string>)) {
              document.documentElement.setAttribute(n, v);
            }
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') document.documentElement.classList.add('dark');
            const main = document.createElement('main');
            main.setAttribute('style', surface);
            main.innerHTML = markup;
            document.body.append(main);

            const probe = document.createElement('div');
            probe.style.background = 'var(--ds-color-bg-primary)';
            document.body.append(probe);

            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const c2 = canvas.getContext('2d', { willReadFrequently: true })!;
            const parse = (value: string): [number, number, number, number] | null => {
              const v = (value || '').trim();
              if (!v || v === 'transparent' || v === 'none') return [0, 0, 0, 0];
              c2.clearRect(0, 0, 1, 1);
              c2.fillStyle = '#000000';
              try { c2.fillStyle = v; } catch { return null; }
              c2.clearRect(0, 0, 1, 1);
              c2.globalAlpha = 1;
              c2.fillRect(0, 0, 1, 1);
              const d = c2.getImageData(0, 0, 1, 1).data;
              return [d[0], d[1], d[2], d[3] / 255];
            };
            const resolveColor = (value: string) => {
              probe.style.setProperty('color', '');
              probe.style.setProperty('color', value);
              const computed = getComputedStyle(probe).color;
              return computed ? parse(computed) : null;
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
            const lum = (c: any) => {
              const f = (x: number) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
              return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
            };
            const ratio = (a: any, b: any) => {
              const l1 = lum(a), l2 = lum(b);
              return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
            };
            const apca = (txt: any, bgc: any) => {
              const Y = (c: any) => 0.2126729 * (c[0] / 255) ** 2.4 + 0.7151522 * (c[1] / 255) ** 2.4 + 0.0721750 * (c[2] / 255) ** 2.4;
              const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
              const Ytxt = clamp(Y(txt)); const Ybg = clamp(Y(bgc));
              if (Math.abs(Ybg - Ytxt) < 0.0005) return 0;
              let o: number;
              if (Ybg > Ytxt) o = (Ybg ** 0.56 - Ytxt ** 0.57) * 1.14;
              else o = (Ybg ** 0.65 - Ytxt ** 0.62) * 1.14;
              if (Math.abs(o) < 0.1) o = 0; else if (o > 0) o -= 0.027; else o += 0.027;
              return Math.round(o * 100 * 10) / 10;
            };
            const hex = (c: any) => c ? `#${[c[0], c[1], c[2]].map((x: number) => Math.round(x).toString(16).padStart(2, '0')).join('')}${c[3] < 0.999 ? `@${c[3].toFixed(2)}` : ''}` : 'null';

            const channelHex: Record<string, string> = {};
            for (const c of channels as string[]) channelHex[c] = hex(resolveColor(`var(${c})`));

            /** The composited opaque ground a node is painted on. */
            const groundOf = (el: HTMLElement) => {
              let acc: any = [0, 0, 0, 0];
              let node: HTMLElement | null = el;
              const stack: string[] = [];
              while (node && acc[3] < 0.999) {
                const bgc = parse(getComputedStyle(node).backgroundColor);
                if (bgc && bgc[3] > 0) {
                  acc = over(acc, bgc);
                  stack.push(`${node.getAttribute('data-part') ?? node.tagName.toLowerCase()}=${hex(bgc)}`);
                }
                node = node.parentElement;
              }
              if (acc[3] < 0.999) acc = over(acc, [255, 255, 255, 1]);
              return { ground: acc, stack };
            };

            const rows: Record<string, any> = {};
            for (const site of sites as any[]) {
              const el = document.querySelector(site.selector) as HTMLElement | null;
              if (!el) { rows[site.id] = { where: site.where, kind: site.kind, found: false }; continue; }
              const inkRaw = parse(getComputedStyle(el).color);
              const { ground, stack } = groundOf(el);
              const ink = inkRaw && inkRaw[3] < 0.999 ? over(inkRaw, ground) : inkRaw;
              if (!ink) { rows[site.id] = { where: site.where, kind: site.kind, found: true, unresolved: true }; continue; }
              rows[site.id] = {
                where: site.where,
                kind: site.kind,
                found: true,
                tone: site.tone,
                text: (el.textContent ?? '').trim().slice(0, 40),
                ink: hex(ink),
                ground: hex(ground),
                stack,
                ratio: ratio(ink, ground),
                lc: apca(ink, ground),
                pass: ratio(ink, ground) >= 4.5,
              };
            }

            return { channels: channelHex, sites: rows };
          },
          {
            rootAttributes: arm.rootAttributes,
            theme: scope.theme,
            channels: CHANNELS,
            sites: SITES,
            markup,
            surface: 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 20px; display:grid; gap:24px;',
          },
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    mkdirSync(resolve(OUT, '..'), { recursive: true });
    writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
    expect(Object.keys(out)).toHaveLength(6);
    // Non-vacuity floor: every site must have been found in every scope.
    for (const [scope, reading] of Object.entries(out) as Array<[string, any]>) {
      for (const site of SITES) {
        expect(reading.sites[site.id]?.found, `${scope} ${site.id}`).not.toBe(false);
      }
    }
  }, 900_000);
});
