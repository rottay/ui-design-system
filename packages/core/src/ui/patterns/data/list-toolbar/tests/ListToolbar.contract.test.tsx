/**
 * @fileoverview ListToolbar cross-engine contract tests (P1 elevation).
 * Pins the public contract every engine must honor: scope classes,
 * data-part=root, messages chrome localization, showTitleSection, search
 * accessible name, and the classic family's button/disclosure semantics.
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { STABLE_ENGINES, renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../../tooling/testing/helpers/browser/match-media';

// Vitest runs with cwd=packages/core; import.meta.url is not a file: URL
// under the vite transform pipeline.
const MODERN_SKIN_PATH = resolve(
  process.cwd(),
  'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar.css',
);

const PILLS = [
  {
    key: 'status',
    label: 'Status',
    value: 'active',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
    ],
  },
];

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Candidates',
    totalCount: 42,
    search: '',
    onSearchChange: vi.fn(),
    filterPills: PILLS,
    activeFilters: { status: 'active' },
    activeFilterCount: 1,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    viewMode: 'list' as const,
    onViewModeChange: vi.fn(),
    density: 'comfortable' as const,
    onDensityChange: vi.fn(),
    primaryAction: { label: 'New candidate', onClick: vi.fn() },
    onExport: vi.fn(),
    ...overrides,
  };
}

async function findToolbarRoot(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(document.querySelector('.ds-pattern-list-toolbar')).not.toBeNull();
  });
  return document.querySelector('.ds-pattern-list-toolbar') as HTMLElement;
}

describe('PatternListToolbar contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('dir');
  });

  it.each(STABLE_ENGINES)(
    'stamps pattern scope classes and data-part=root through the %s engine',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(<PatternListToolbar engine={engine} {...baseProps()} />, engine);

      const root = await findToolbarRoot();
      expect(root.className).toContain('ds-pattern-list-toolbar');
      expect(root.className).toContain(`ds-engine-${engine}`);
      expect(root.getAttribute('data-part')).toBe('root');
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'honors messages chrome copy through the %s engine',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          {...baseProps()}
          messages={{
            clearAll: 'Quitar filtros',
            settings: 'Configuración',
            columnSettings: 'Configuración de columnas',
            listView: 'Lista',
            cardView: 'Tarjetas',
          }}
        />,
        engine,
      );

      // Active-filter strip clear-all label is localized in every engine.
      expect(
        await screen.findByRole('button', { name: 'Quitar filtros' }),
      ).toBeInTheDocument();
      // Settings disclosure trigger is localized in every engine. The classic
      // gear names itself from `settings`; the modern trigger announces
      // `columnSettings` (its `settings` copy is the tooltip).
      if (engine === 'modern') {
        await waitFor(() => {
          expect(
            screen.getAllByRole('button', { name: 'Configuración de columnas' }).length,
          ).toBeGreaterThanOrEqual(1);
        });
      } else {
        await waitFor(() => {
          expect(
            screen.getAllByRole('button', { name: 'Configuración' }).length,
          ).toBeGreaterThanOrEqual(1);
        });
      }
      // View-mode control copy is localized (classic labels / modern radio names).
      if (engine === 'modern') {
        expect(await screen.findByRole('radio', { name: 'Lista' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Tarjetas' })).toBeInTheDocument();
      } else {
        expect(await screen.findByRole('button', { name: 'Lista' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Tarjetas' })).toBeInTheDocument();
      }
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'hides the title cluster when showTitleSection=false through the %s engine',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(
        <PatternListToolbar engine={engine} {...baseProps({ showTitleSection: false })} />,
        engine,
      );

      const root = await findToolbarRoot();
      expect(root.getAttribute('data-has-title')).toBe('false');
      expect(screen.queryByText('Candidates')).toBeNull();
      // The rest of the bar still renders.
      expect(
        await screen.findByRole('textbox', { name: 'Search...' }),
      ).toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'gives the search input an accessible name through the %s engine',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          {...baseProps({ searchPlaceholder: 'Buscar candidatos' })}
        />,
        engine,
      );
      expect(
        await screen.findByRole('textbox', { name: 'Buscar candidatos' }),
      ).toBeInTheDocument();
    },
    45000,
  );

  it.each(STABLE_ENGINES)(
    'prefers messages.searchLabel over the placeholder for the %s engine',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(
        <PatternListToolbar
          engine={engine}
          {...baseProps({ searchPlaceholder: 'Buscar candidatos' })}
          messages={{ searchLabel: 'Buscar' }}
        />,
        engine,
      );
      expect(await screen.findByRole('textbox', { name: 'Buscar' })).toBeInTheDocument();
    },
    45000,
  );

  it.each(['classic', 'rustic'] as const)(
    'exposes type=button and pressed state on classic-family controls (%s)',
    async (engine) => {
      mockMatchMedia(1280);
      renderWithEngine(<PatternListToolbar engine={engine} {...baseProps()} />, engine);

      // Filter pills: explicit type + aria-pressed mirroring the active value.
      const activePill = await screen.findByRole('button', { name: 'Active' });
      expect(activePill).toHaveAttribute('type', 'button');
      expect(activePill).toHaveAttribute('aria-pressed', 'true');
      const idlePill = screen.getByRole('button', { name: 'All' });
      expect(idlePill).toHaveAttribute('type', 'button');
      expect(idlePill).toHaveAttribute('aria-pressed', 'false');

      // View-mode toggle: labelled group, pressed state, explicit type.
      const viewGroup = screen.getByRole('group', { name: 'View mode' });
      expect(viewGroup).toBeInTheDocument();
      const listSegment = screen.getByRole('button', { name: 'List' });
      expect(listSegment).toHaveAttribute('type', 'button');
      expect(listSegment).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );

      // Density rows inside the settings popover: group + pressed + type.
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      fireEvent.click(await screen.findByRole('tab', { name: 'Density' }));
      const densityGroup = await screen.findByRole('group', { name: 'Row density' });
      expect(densityGroup).toBeInTheDocument();
      const comfortableRow = await screen.findByRole('button', { name: /Comfortable/ });
      expect(comfortableRow).toHaveAttribute('type', 'button');
      expect(comfortableRow).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /Compact/ })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    },
    45000,
  );

  it.each(['classic', 'rustic'] as const)(
    'uses logical (RTL-safe) geometry on classic-family controls (%s)',
    async (engine) => {
      document.documentElement.setAttribute('dir', 'rtl');
      mockMatchMedia(1280);
      renderWithEngine(<PatternListToolbar engine={engine} {...baseProps()} />, engine);

      // View-mode segment separator is the logical inline-end border.
      const listSegment = await screen.findByRole('button', { name: 'List' });
      expect(listSegment.getAttribute('style')).toContain('border-inline-end');

      // Density rows align text to the logical start edge.
      fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
      fireEvent.click(await screen.findByRole('tab', { name: 'Density' }));
      const comfortableRow = await screen.findByRole('button', { name: /Comfortable/ });
      expect(comfortableRow.getAttribute('style')).toContain('text-align: start');
    },
    45000,
  );

  it('declares disclosure state on the modern settings trigger', async () => {
    mockMatchMedia(1280);
    renderWithEngine(<PatternListToolbar engine="modern" {...baseProps()} />, 'modern');

    const trigger = await screen.findByRole('button', { name: 'Column settings' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    // The Popover re-clones its Tooltip-wrapped trigger on open, so re-query
    // instead of holding the pre-click node.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Column settings' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });
  });

  it('never keys modern skin paint on primitive-swallowed data-parts (P-79)', () => {
    // Text and Icon primitives stamp their own data-part="root" and drop the
    // caller's data-part, so a skin rule keyed on those attributes is dead in
    // production. The skin must key those parts on the pattern's BEM class.
    const skin = readFileSync(MODERN_SKIN_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const swallowedParts = [
      'title',
      'search-icon',
      'settings-empty',
      'mobile-overflow-label',
      'filter-chips-count',
      'filter-chips-icon',
      'filter-chip-label',
      'filter-chip-value',
    ];
    for (const part of swallowedParts) {
      expect(skin).not.toContain(`[data-part="${part}"]`);
    }
    // The replacement class-keyed selectors exist at the same specificity.
    expect(skin).toContain(
      '.ds-list-toolbar__title.ds-list-toolbar__title.ds-list-toolbar__title',
    );
    expect(skin).toContain('.ds-list-toolbar__search-icon.ds-list-toolbar__search-icon');
  });

  it('follows the viewport fallback while the modern container is unmeasurable', async () => {
    // No getBoundingClientRect stub: happy-dom measures width 0, so the
    // container query cannot resolve. Posture must track the viewport
    // breakpoint (desktop at 1280) instead of latching the SSR phone default.
    mockMatchMedia(1280);
    renderWithEngine(<PatternListToolbar engine="modern" {...baseProps()} />, 'modern');

    const root = await findToolbarRoot();
    await waitFor(() => {
      expect(root).toHaveAttribute('data-container-layout', 'full');
      expect(root).toHaveAttribute('data-mobile', 'false');
    });
    expect(root.querySelector('[data-part="main-row"]')).not.toBeNull();
  });

  it('declares disclosure state on the modern mobile overflow trigger', async () => {
    mockMatchMedia(390);
    renderWithEngine(<PatternListToolbar engine="modern" {...baseProps()} />, 'modern');

    // The Popover owns disclosure ARIA on its trigger: haspopup follows the
    // Popover surface role (dialog), expanded tracks the open state.
    const trigger = await screen.findByRole('button', { name: 'More options' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
