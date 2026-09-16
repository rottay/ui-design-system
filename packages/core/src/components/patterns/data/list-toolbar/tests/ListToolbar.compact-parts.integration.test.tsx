/**
 * The compact posture names its column `mobile-layout` so the list-toolbar skin
 * can pad and space it inside the container query. The part must reach the DOM
 * and the skin must reach the node in a real browser.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernListToolbar from '../engines/modern';
import { measureArms } from '@tests/support/family-causality';

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'list-toolbar-compact-parts',
  name: 'List toolbar compact parts',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'List toolbar compact parts' },
};

async function phoneMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="phone"
    >
      <ModernListToolbar
        title="Candidates"
        totalCount={42}
        search=""
        onSearchChange={noop}
        filterPills={[]}
        viewMode="list"
        onViewModeChange={noop}
        density="comfortable"
        onDensityChange={noop}
        primaryAction={{ label: 'Add candidate', onClick: noop }}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await phoneMarkup();
const LAYOUT = '#phone .ds-list-toolbar__mobile-layout';

describe('PatternListToolbar compact parts', () => {
  it('renders the compact column under its own part', () => {
    expect(markup).toContain('data-container-layout="compact"');
    const node = /<div[^>]*class="[^"]*ds-list-toolbar__mobile-layout[^"]*"[^>]*>/.exec(markup);
    expect(node?.[0]).toContain('data-part="mobile-layout"');
    expect(node?.[0]).toContain('data-component="flex"');
  });

  it('lets the toolbar skin pad and space the compact column in a phone container', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="phone" style="inline-size: 390px">${markup}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'display', selector: LAYOUT, property: 'display' },
        { id: 'direction', selector: LAYOUT, property: 'flex-direction' },
        { id: 'row-gap', selector: LAYOUT, property: 'row-gap' },
        { id: 'padding-block-start', selector: LAYOUT, property: 'padding-block-start' },
        { id: 'padding-inline-start', selector: LAYOUT, property: 'padding-inline-start' },
      ],
    });
    const r = result.base!;

    expect(r.display).toBe('flex');
    expect(r.direction).toBe('column');
    // The phone container rules at comfortable density (0.9375): 0.75rem gap,
    // 0.625rem x 0.75rem padding. A Stack-rendered column reads 7.5px and 0px.
    expect(r['row-gap']).toBe('11.25px');
    expect(r['padding-block-start']).toBe('9.375px');
    expect(r['padding-inline-start']).toBe('11.25px');
  }, 60_000);
});
