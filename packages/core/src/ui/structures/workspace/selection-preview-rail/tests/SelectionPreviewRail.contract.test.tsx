import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { SelectionPreviewRail } from '..';
import type { SelectionPreviewRailColumn } from '..';
import { Button } from '../../../../primitives';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const ENGINES = ['modern'] as const;

interface RailFixtureRow {
  id: string;
  fullName: string;
  email: string;
  statusLabel: string;
  role: string;
  active: boolean;
  notes: string | null;
}

const FULL_ITEM: RailFixtureRow = {
  id: 'row-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  statusLabel: 'Active',
  role: 'Engineer',
  active: true,
  notes: null,
};

// One column per `renderFallbackValue` branch: a plain non-empty string
// (fallback-string), a boolean (fallback-boolean), and a null value
// (fallback-empty).
const FULL_COLUMNS: SelectionPreviewRailColumn<RailFixtureRow>[] = [
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'active', title: 'Active', dataIndex: 'active' },
  { key: 'notes', title: 'Notes', dataIndex: 'notes' },
];

/**
 * Every `data-part` the default branch must reach when columns exercise all
 * three `renderFallbackValue` paths alongside a subtitle and a match reason.
 */
const DEFAULT_BRANCH_PART_COUNTS: Record<string, number> = {
  'identity-card': 1,
  'identity-card-accent': 1,
  'identity-title': 1,
  'identity-subtitle': 1,
  'match-reason-panel': 1,
  'match-reason-icon': 1,
  'match-reason-eyebrow': 1,
  'match-reason-body': 1,
  'snapshot-card': 1,
  'snapshot-header': 1,
  'snapshot-title': 1,
  'snapshot-subtitle': 1,
  'snapshot-row': FULL_COLUMNS.length,
  'snapshot-row-label': FULL_COLUMNS.length,
  'fallback-string': 1,
  'fallback-boolean': 1,
  'fallback-empty': 1,
};

/**
 * Every render goes through `createEngineComponent`'s Suspense-wrapped lazy
 * engine loader, so a synchronous `container.querySelector(...)` right after
 * `render()` can race the still-pending engine chunk. Poll for the render's
 * own root landmark before making any other assertion against `container`.
 */
async function waitForRoot(container: HTMLElement): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return container.querySelector('[data-part="root"]') as Element;
}

describe('SelectionPreviewRail data-part contract', () => {
  it.each(ENGINES)('stamps the default-branch anatomy hooks under the %s engine', async (engine) => {
    const { container } = renderWithEngine(
      <SelectionPreviewRail
        item={FULL_ITEM}
        itemKey={FULL_ITEM.id}
        itemIndex={0}
        columns={FULL_COLUMNS}
        onClose={() => undefined}
        getMatchReason={() => 'Matched because status is Active'}
        mode="selection"
      />,
      engine,
    );

    const root = await waitForRoot(container);
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-selection-preview-rail');
    expect(root.getAttribute('data-preview'), 'default branch must key data-preview="default"').toBe('default');

    for (const [part, minCount] of Object.entries(DEFAULT_BRANCH_PART_COUNTS)) {
      const nodes = container.querySelectorAll(`[data-part="${part}"]`);
      expect(nodes.length, `data-part="${part}" did not reach the DOM`).toBeGreaterThanOrEqual(minCount);
    }

    expect(container.querySelectorAll('.ds-selection-preview-rail__close')).toHaveLength(0);
    expect(container.querySelectorAll('[data-part="custom-sticky-card"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-part="snapshot-empty"]')).toHaveLength(0);
  });

  it.each(ENGINES)(
    'stamps snapshot-empty when the default branch has zero columns under the %s engine',
    async (engine) => {
      const { container } = renderWithEngine(
        <SelectionPreviewRail
          item={FULL_ITEM}
          itemKey={FULL_ITEM.id}
          itemIndex={0}
          columns={[]}
          onClose={() => undefined}
          mode="selection"
        />,
        engine,
      );

      const root = await waitForRoot(container);
      expect(root.getAttribute('data-preview')).toBe('default');
      expect(container.querySelectorAll('[data-part="snapshot-empty"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-part="snapshot-row"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="fallback-string"]')).toHaveLength(0);
      expect(container.querySelectorAll('[data-part="match-reason-panel"]')).toHaveLength(0);
    },
  );

  it.each(ENGINES)(
    'stamps the customPreview-branch anatomy hooks and the close className under the %s engine',
    async (engine) => {
      const { container } = renderWithEngine(
        <SelectionPreviewRail
          item={FULL_ITEM}
          itemKey={FULL_ITEM.id}
          itemIndex={0}
          columns={FULL_COLUMNS}
          onClose={() => undefined}
          mode="selection"
          preview={{ render: () => <span data-testid="custom-content">Custom preview content</span> }}
        />,
        engine,
      );

      const root = await waitForRoot(container);
      expect(root.className).toContain('ds-structure');
      expect(root.className).toContain('ds-selection-preview-rail');
      expect(root.getAttribute('data-preview'), 'customPreview branch must key data-preview="custom"').toBe(
        'custom',
      );

      expect(container.querySelectorAll('[data-part="custom-sticky-card"]')).toHaveLength(1);

      let closeButtons: NodeListOf<Element> = container.querySelectorAll('.ds-selection-preview-rail__close');
      await waitFor(() => {
        closeButtons = container.querySelectorAll('.ds-selection-preview-rail__close');
        expect(closeButtons).toHaveLength(1);
      });

      // No caller data-part is supplied for this control, so the Button's
      // canonical root anatomy remains the trigger.
      expect(closeButtons[0].getAttribute('data-part')).toBe('trigger');

      for (const part of ['identity-card', 'snapshot-card', 'match-reason-panel']) {
        expect(
          container.querySelectorAll(`[data-part="${part}"]`),
          `${part} must not render on the customPreview branch`,
        ).toHaveLength(0);
      }
    },
  );

  it.each(ENGINES)(
    'Button preserves a caller-supplied data-part under the %s engine',
    async (engine) => {
      const { container } = renderWithEngine(
        <Button variant="ghost" size="sm" data-part="caller-supplied-part">
          Test
        </Button>,
        engine,
      );

      let button: Element | null = null;
      await waitFor(() => {
        button = container.querySelector('.rottay-button');
        expect(button).not.toBeNull();
      });

      // P-79 caller-wins law: composed patterns can expose their own public
      // anatomy without bypassing the canonical Button primitive.
      const expectedDataPart = 'caller-supplied-part';
      expect((button as unknown as Element).getAttribute('data-part')).toBe(expectedDataPart);
    },
  );
});
