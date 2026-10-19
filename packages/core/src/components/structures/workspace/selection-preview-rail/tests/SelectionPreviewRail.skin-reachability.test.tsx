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
  await waitForComposedContent(waitFor, result.container, '.ds-selection-preview-rail__identity-close');
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
  await waitForComposedContent(waitFor, result.container, ".ds-selection-preview-rail__snapshot-empty");
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
    const roots: HTMLElement[] = [];

    for (const scope of scopes) {
      const root = scope.querySelector('.ds-selection-preview-rail') as HTMLElement;
      expect(root, 'rail root did not render').toBeTruthy();
      expect(root.style.flex, 'root paints flex inline').toBe('');
      expect(root.style.width, 'root paints width inline').toBe('');
      expect(root.style.minWidth, 'root paints min-width inline').toBe('');
      roots.push(root);
    }

    // One entry per selector member; a rule reaching a root by part and by class
    // has two, so the track is counted in rules (each rule shares one decls).
    const members = readSkinRules('selection-preview-rail').filter(
      (rule) => 'flex' in rule.decls && /\[data-preview=/.test(rule.selector)
    );
    const track = [...new Set(members.map((rule) => rule.decls))];
    expect(track.length, 'both roots must declare the track').toBe(2);
    for (const member of members) {
      expect(roots.some((root) => root.matches(member.selector)), `${member.selector} reaches neither root`).toBe(true);
    }
    for (const root of roots) {
      const reaching = members.filter((member) => root.matches(member.selector));
      expect(new Set(reaching.map((member) => member.decls)).size, 'one track rule per root').toBe(1);
      expect(reaching.length, 'one member per hook').toBe(root.classList.contains('ds-selection-preview-rail__root') ? 2 : 1);
      expect(reaching.some((member) => member.selector.includes("[data-part='root']")), 'reached by its part').toBe(true);
      if (root.classList.contains('ds-selection-preview-rail__root')) {
        expect(reaching.some((member) => member.selector.includes('.ds-selection-preview-rail__root')), 'reached by its class').toBe(true);
      }
    }
    for (const decls of track) {
      expect(decls['inline-size']).toBe('min(100%, 380px)');
      expect(decls['min-inline-size']).toBe('min(100%, 320px)');
    }
  });
});
