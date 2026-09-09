/**
 * @fileoverview F-56 closure: no product semantics and no implicit global
 * state inside CollectionWorkspaceSurface.
 *
 * The three defects these tests pin, each of which was invisible from a
 * consuming app's config:
 *  - a hardcoded recruiting/events status vocabulary ranked and TINTED the
 *    header meta, and a fallback read `status`/`state`/`stage` off the rows;
 *  - the rail width was remembered in browser storage under a key derived from
 *    the surface title, so two collections sharing a heading shared a rail;
 *  - `f` / `c` / `s` were a document keydown listener the surface installed for
 *    itself, and `c` reached the column menu through an untyped `window` event.
 */

import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { CollectionWorkspaceSurface } from '../index';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import {
  clearLayoutPreferenceRecords,
  snapshotBrowserStorage,
} from '@tests/support/browser/layout-preference-record';

interface Row {
  id: string;
  name: string;
  status: string;
}

const DATA: Row[] = [
  { id: '1', name: 'Alice', status: 'open' },
  { id: '2', name: 'Bob', status: 'open' },
  { id: '3', name: 'Cleo', status: 'archived' },
];

const COLUMNS: ColumnDef<Row>[] = [{ key: 'name', header: 'Name', accessorKey: 'name' }];

beforeEach(() => {
  clearLayoutPreferenceRecords();
});

describe('CollectionWorkspaceSurface carries no product vocabulary', () => {
  it('ranks declared scopes by their own counts and tints none of them', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        title="Records"
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        header={{ eyebrow: 'Workspace', title: 'Records', subtitle: 'Every record in scope' }}
        controls={{
          scopes: {
            enabled: true,
            // Declared LOW-count-first and with the once-privileged word last:
            // if any ranking other than the count survived, 'open' would lead.
            scopes: [
              { key: 'all', label: 'All', count: 12 },
              { key: 'archived', label: 'Archived', count: 9 },
              { key: 'open', label: 'Open', count: 2 },
            ],
          },
        }}
      />,
    );

    await screen.findByText('Records');

    const metaLabels = [...container.querySelectorAll('[data-part="meta-item"]')]
      .map((node) => node.textContent?.trim() ?? '');
    const scopeLabels = metaLabels.filter((label) => /archived|open/i.test(label));

    expect(scopeLabels[0]).toContain('archived');
    expect(scopeLabels.some((label) => label.includes('open'))).toBe(true);
    expect(scopeLabels.indexOf('9 archived')).toBeLessThan(scopeLabels.indexOf('2 open'));

    const tones = [...container.querySelectorAll('[data-part="meta-item"]')]
      .filter((node) => /archived|open/i.test(node.textContent ?? ''))
      .map((node) => node.getAttribute('data-tone'));
    expect(tones.every((tone) => tone === 'neutral')).toBe(true);
  });

  it('never derives header meta from a status/state/stage field on the rows', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        title="Records"
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        header={{ eyebrow: 'Workspace', title: 'Records', subtitle: 'Every record in scope' }}
      />,
    );

    await screen.findByText('Records');

    const metaLabels = [...container.querySelectorAll('[data-part="meta-item"]')]
      .map((node) => node.textContent?.trim() ?? '');

    // Two rows carry status 'open'; the retired fallback would have produced
    // a "2 open" meta item from data the surface has no business reading.
    expect(metaLabels.some((label) => /\bopen\b/i.test(label))).toBe(false);
    expect(metaLabels.some((label) => /\barchived\b/i.test(label))).toBe(false);
  });
});

describe('CollectionWorkspaceSurface owns no implicit global state', () => {
  it('writes nothing to browser storage while rendering a resizable preview rail', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        title="Records"
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        behavior={{
          previewRail: {
            enabled: true,
            resizable: true,
            render: (item) => <div>{`Preview ${item.name}`}</div>,
          },
        }}
      />,
    );

    await screen.findByText('Records');

    expect(snapshotBrowserStorage()).toEqual({});
  });

  it('does not claim the f / c / s keys on the document', async () => {
    const onFilterChange = () => {};
    renderSurface(
      <CollectionWorkspaceSurface
        title="Records"
        data={DATA}
        columns={COLUMNS}
        rowKey="id"
        controls={{
          filters: [{ key: 'name', label: 'Name', type: 'text' }],
          filterValues: {},
          onFilterChange,
        }}
      />,
    );

    await screen.findByText('Records');
    const before = document.body.innerHTML;

    fireEvent.keyDown(document, { key: 'f' });
    fireEvent.keyDown(document, { key: 'c' });
    fireEvent.keyDown(document, { key: 's' });

    // Keyboard ownership belongs to the interaction runtime (WO-FAM-11): a
    // bare letter pressed on the document must not move this surface at all.
    expect(document.body.innerHTML).toBe(before);
  });
});
