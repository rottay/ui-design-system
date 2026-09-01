import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { SelectionPreviewRail } from '..';
import { renderWithEngine } from '@tests/support/engine';
import {
  readSkinRules,
  unreachableSelectors,
  waitForComposedContent,
  type SkinRule,
} from '@tests/support/skin-reachability';

/**
 * The rail returns one of two mutually-exclusive trees and has a third state
 * (no snapshot columns), so a single fixture proves nothing: an unmatched
 * selector would be a state the test never reached, not a dead rule. All three
 * render here and the scopes are searched together.
 *
 * Eight typography rules were written `.ds-selection-preview-rail
 * [data-part='root'] …` with a SPACE — a second root-parted element nested
 * inside the rail, which nothing renders — so the rail shipped its editorial
 * voice as browser defaults for its whole life.
 */

const ITEM = { fullName: 'Ada Lovelace', email: 'ada@example.com', status: 'Active' };

const COLUMNS = [
  { key: 'fullName', title: 'Full name', dataIndex: 'fullName' },
  { key: 'absent', title: 'Absent', dataIndex: 'absent' },
];

/**
 * Each branch is gated on a COMPOSED primitive, never on the rail's own text.
 * The close affordance is a `Button` — a separately-imported engine module
 * behind its own `<Suspense fallback={null}>` — so the rail's Box/Flex/Text
 * tree renders complete while the Button is still absent, and every rule
 * keyed on it reads dead. See the composition law in the helper.
 */
async function renderDefault() {
  const result = renderWithEngine(
    <SelectionPreviewRail
      item={ITEM}
      itemKey="row-1"
      itemIndex={0}
      columns={COLUMNS}
      onClose={() => undefined}
      onOpenItem={() => undefined}
      getMatchReason={() => 'Matched on name'}
      mode="selection"
    />,
    'modern'
  );
  await waitForComposedContent(waitFor, result.container, "[data-part='close']");
  return result;
}

async function renderCustom() {
  const result = renderWithEngine(
    <SelectionPreviewRail
      item={ITEM}
      itemKey="row-2"
      itemIndex={1}
      columns={COLUMNS}
      onClose={() => undefined}
      mode="click"
      preview={{ render: () => <span>Consumer preview</span> }}
    />,
    'modern'
  );
  await waitForComposedContent(waitFor, result.container, '.ds-selection-preview-rail__close');
  return result;
}

async function renderEmptySnapshot() {
  const result = renderWithEngine(
    <SelectionPreviewRail
      item={ITEM}
      itemKey="row-3"
      itemIndex={2}
      columns={[]}
      onClose={() => undefined}
      mode="click"
    />,
    'modern'
  );
  await waitForComposedContent(waitFor, result.container, "[data-part='snapshot-empty']");
  return result;
}

describe('SelectionPreviewRail skin reachability', () => {
  it('matches every authored selector across both branches and the empty state', async () => {
    const scopes = [
      (await renderDefault()).container,
      (await renderCustom()).container,
      (await renderEmptySnapshot()).container,
    ];

    const rules = readSkinRules('selection-preview-rail');
    expect(rules.length, 'skin parsed to nothing — the read is broken').toBeGreaterThan(20);

    expect(unreachableSelectors({ rules, scopes })).toEqual([]);
  });

  it('reports the spaced root form as unreachable (positive control)', async () => {
    const { container } = await renderDefault();

    const planted: SkinRule[] = [
      {
        selector:
          ".ds-structure.ds-selection-preview-rail [data-part='root'] [data-part='identity-title'][data-size]",
        conditions: '',
        decls: { 'letter-spacing': '-0.02em' },
      },
    ];

    expect(unreachableSelectors({ rules: planted, scopes: [container] })).toEqual([
      planted[0].selector,
    ]);
  });

  it('owns the rail track in the skin, not inline on either root', async () => {
    const scopes = [(await renderDefault()).container, (await renderCustom()).container];

    for (const scope of scopes) {
      const root = scope.querySelector('.ds-selection-preview-rail') as HTMLElement;
      expect(root, 'rail root did not render').toBeTruthy();
      expect(root.style.flex, 'root paints flex inline').toBe('');
      expect(root.style.width, 'root paints width inline').toBe('');
      expect(root.style.minWidth, 'root paints min-width inline').toBe('');
    }

    const track = readSkinRules('selection-preview-rail').filter(
      (rule) => 'flex' in rule.decls && /\[data-preview=/.test(rule.selector)
    );
    expect(track.length, 'both roots must declare the track').toBe(2);
    for (const rule of track) {
      expect(rule.decls['inline-size']).toBe('min(100%, 380px)');
      expect(rule.decls['min-inline-size']).toBe('min(100%, 320px)');
    }
  });
});
