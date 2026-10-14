/**
 * The notification item title in a real browser, under the modern page shell
 * whose descendant `title` rule reaches every title part: the title paints the
 * feed's own role (the md text tier on the tenant's body role, weighted by read
 * state), never the page title's, and it follows the tenant's type decisions.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { ModernText } from '@/components/primitives/display/typography/engines/modern';
import { NotificationSurface } from '..';
import {
  FIRST_PARTY_VERTICALS as VERTICALS,
  measureArms,
  type ProbeReadings,
  type ProbeVertical,
} from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'notification-title-role',
  name: 'Notification title role',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Notification title role' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <NotificationSurface
        config={{
          visual: { layout: 'sections' },
          presentation: { chrome: { title: 'Inbox' } },
          behavior: {
            notifications: [
              { id: 'n1', title: 'Build finished', message: 'All checks passed.', timestamp: '2m', read: false, type: 'success' },
              { id: 'n2', title: 'Invoice 2041 paid', message: 'Payment received.', timestamp: '1h', read: true },
            ],
            preferences: [],
            onMarkRead: () => undefined,
          },
        }}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const rendered = await serverMarkup();
// Two references outside any shell: the md tier the owner's Text declares, and the body role.
const markup = [
  `<div id="page" style="inline-size:64rem">${rendered}</div>`,
  `<div id="ref-md">${renderToStaticMarkup(<ModernText size="md">Tier reference</ModernText>)}</div>`,
  `<div id="ref-body">${renderToStaticMarkup(<ModernText textStyle="body">Role reference</ModernText>)}</div>`,
].join('');

const ELEMENTS = {
  unread: '#page .ds-notification__item--unread .ds-notification__title',
  read: '#page .ds-notification__item--read .ds-notification__title',
  pageTitle: '#page h1',
  md: "#ref-md [data-part='root']",
  body: "#ref-body [data-part='root']",
} as const;

const PROPERTIES = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'font-variant-numeric',
  'max-width',
  'text-wrap-style',
  'overflow-wrap',
  '--ds-font-weight-semibold',
  '--ds-type-body-line-height',
] as const;

const ARMS = {
  base: {},
  scale: { 'typography.scale': 1.08 },
  pairing: { 'typography.pairing': 'editorial' },
} as const;

const readings: Partial<Record<ProbeVertical, ProbeReadings>> = {};
async function measured(vertical: ProbeVertical): Promise<ProbeReadings> {
  readings[vertical] ??= await measureArms({
    vertical,
    markup,
    arms: ARMS,
    targets: Object.entries(ELEMENTS).flatMap(([element, selector]) =>
      PROPERTIES.map((property) => ({ id: `${element}:${property}`, selector, property })),
    ),
  });
  return readings[vertical]!;
}

const px = (value: string) => Number.parseFloat(value);
/** A length relative to the element's own font size, so two sizes compare as one role. */
const perEm = (reading: Record<string, string>, element: string, property: string) => {
  const value = reading[`${element}:${property}`]!;
  return value === 'normal' ? value : (px(value) / px(reading[`${element}:font-size`]!)).toFixed(3);
};

describe('notification item title role', () => {
  it.each(VERTICALS)('paints the feed role, not the page title, under every arm in %s', async (vertical) => {
    const r = await measured(vertical);
    for (const arm of Object.keys(ARMS)) {
      const at = r[arm]!;
      for (const state of ['unread', 'read'] as const) {
        const where = `${vertical} ${arm} ${state}`;
        expect(at[`${state}:font-size`], where).not.toMatch(/^<no match/);
        expect(at[`${state}:font-size`], `${where} size is the md tier`).toBe(at['md:font-size']);
        expect(at[`${state}:font-size`], `${where} size is not the page title's`).not.toBe(at['pageTitle:font-size']);
        expect(at[`${state}:font-family`], `${where} family`).toBe(at['body:font-family']);
        for (const property of ['text-transform', 'font-variant-numeric'] as const) {
          expect(at[`${state}:${property}`], `${where} ${property}`).toBe(at[`body:${property}`]);
        }
        // The role's leading as it resolves where the title sits, not where the reference does.
        expect(perEm(at, state, 'line-height'), `${where} line-height`).toBe(
          px(at[`${state}:--ds-type-body-line-height`]!).toFixed(3),
        );
        expect(perEm(at, state, 'letter-spacing'), `${where} letter-spacing`).toBe(perEm(at, 'body', 'letter-spacing'));
        expect(at[`${state}:max-width`], `${where} no page measure`).toBe('none');
        expect(at[`${state}:text-wrap-style`], `${where} wrap`).toBe('pretty');
        expect(at[`${state}:overflow-wrap`], `${where} overflow-wrap`).toBe('anywhere');
      }
    }
  }, 300_000);

  it.each(VERTICALS)('keeps the read/unread weight grammar in %s', async (vertical) => {
    const r = await measured(vertical);
    for (const arm of Object.keys(ARMS)) {
      const at = r[arm]!;
      const where = `${vertical} ${arm}`;
      expect(at['read:font-weight'], `${where} read is body weight`).toBe(at['body:font-weight']);
      expect(px(at['unread:font-weight']!), `${where} unread is the semibold step`).toBe(
        px(at['unread:--ds-font-weight-semibold']!),
      );
      expect(px(at['unread:font-weight']!), `${where} unread outweighs read`).toBeGreaterThan(px(at['read:font-weight']!));
    }
  }, 300_000);

  it.each(VERTICALS)('follows the tenant type decisions in %s', async (vertical) => {
    const r = await measured(vertical);
    for (const state of ['unread', 'read'] as const) {
      // The type dial scales the tier the title reads; its weights hold.
      expect(r.scale![`${state}:font-size`], `${vertical} ${state} scale`).not.toBe(r.base![`${state}:font-size`]);
      expect(r.scale![`${state}:font-weight`], `${vertical} ${state} scale control`).toBe(r.base![`${state}:font-weight`]);
      // The pairing re-voices the body role, and the title with it.
      expect(r.pairing![`${state}:font-family`], `${vertical} ${state} pairing`).not.toBe(r.base![`${state}:font-family`]);
      expect(r.pairing![`${state}:font-weight`], `${vertical} ${state} pairing control`).toBe(r.base![`${state}:font-weight`]);
    }
  }, 300_000);
});
