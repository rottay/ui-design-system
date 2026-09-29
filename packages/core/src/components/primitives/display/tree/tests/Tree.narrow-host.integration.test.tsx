/**
 * A tree in a host narrower than its longest label keeps every box inside the
 * host: each node stacks its row over its child group, the group takes the
 * node's width and the nowrap label truncates, instead of the group sitting
 * beside the row at the label's max-content width.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernTree from '../engines/modern';
import type { TreeDataNode } from '../contracts';
import { measureArms, type ProbeReadings, type ProbeTarget } from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'tree-narrow-host',
  name: 'Tree narrow host',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Tree narrow host' },
};

const LONG = 'A deliberately long node label that carries far more words than a narrow column can hold';
const UNBROKEN = 'Unbroken_identifier_without_any_break_opportunity_at_all_0123456789';

const DATA: TreeDataNode[] = [
  {
    key: '1',
    title: 'Finance',
    children: [
      { key: '1-1', title: 'Q3 2026 reconciliation' },
      { key: '1-2', title: LONG },
      { key: '1-3', title: 'Budget review', children: [{ key: '1-3-1', title: UNBROKEN }] },
    ],
  },
];

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernTree treeData={DATA} checkable showLine defaultExpandedKeys={['1', '1-3']} />
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

const HOST = 296;
const markup = `<div id="host" style="inline-size:${HOST}px">${await serverMarkup()}</div>`;

const targets: ProbeTarget[] = [
  { id: 'host.right', selector: '#host', property: '@rect.right' },
  { id: 'root.right', selector: "#host [data-part='root']", property: '@rect.right' },
  { id: 'group.right', selector: "#host [role='group']", property: '@rect.right' },
  { id: 'nestedGroup.right', selector: "#host [role='group'] [role='group']", property: '@rect.right' },
  { id: 'label.right', selector: "#host [data-key='1-2'] > [data-part='row'] > [data-part='tree-node-label']", property: '@rect.right' },
  { id: 'unbroken.right', selector: "#host [data-key='1-3-1'] > [data-part='row'] > [data-part='tree-node-label']", property: '@rect.right' },
  { id: 'row.bottom', selector: "#host [data-key='1'] > [data-part='row']", property: '@rect.bottom' },
  { id: 'group.top', selector: "#host [role='group']", property: '@rect.top' },
  { id: 'root.left', selector: "#host [data-part='root']", property: '@rect.left' },
  { id: 'topRow.left', selector: "#host [data-key='1'] > [data-part='row']", property: '@rect.left' },
];

let readings: ProbeReadings;
const read = (id: string): number => Number(readings.base![id]);

describe('tree in a narrow host', () => {
  beforeAll(async () => {
    readings = await measureArms({ vertical: 'rottay', markup, arms: { base: {} }, targets });
  }, 120_000);

  it('keeps every child group inside the host', () => {
    const host = read('host.right');
    expect(read('root.right')).toBeLessThanOrEqual(host);
    expect(read('group.right')).toBeLessThanOrEqual(host);
    expect(read('nestedGroup.right')).toBeLessThanOrEqual(host);
  });

  it('truncates the nowrap label at the host edge instead of widening the tree', () => {
    expect(read('label.right')).toBeLessThanOrEqual(read('host.right'));
    expect(read('unbroken.right')).toBeLessThanOrEqual(read('host.right'));
  });

  it('stacks the child group under its row', () => {
    expect(read('group.top')).toBeGreaterThanOrEqual(read('row.bottom'));
  });

  it('indents a row by its depth alone, not by a padded wrapper', () => {
    expect(read('topRow.left')).toBe(read('root.left'));
  });
});
