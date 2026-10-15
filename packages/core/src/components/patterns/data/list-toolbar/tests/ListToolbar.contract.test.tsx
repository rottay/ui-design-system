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
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { PatternListToolbar } from '..';
import { STABLE_ENGINES, renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

// Vitest runs with cwd=packages/core; import.meta.url is not a file: URL
// under the vite transform pipeline.
const MODERN_SKIN_PATH = resolve(
  process.cwd(),
  'src/foundation/tokens/css/runtime/engines/modern/skin/list-toolbar/index.css',
);

/**
 * Rustic is a DECLARED ABSENCE for this pattern (WO-CAN-06).
 *
 * `engines/rustic/index.tsx` was `export { default } from '../classic'` -- a
 * silent alias that painted Classic chrome under the Rustic name, which is
 * exactly why these arms used to pass. Rustic is frozen and ships no toolbar,
 * so the contract is now measured over the engines that implement it, and the
 * absence is asserted once, by name.
 */
const IMPLEMENTING_ENGINES = STABLE_ENGINES.filter((engine) => engine !== 'rustic');

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
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // W4 idiom: portal locale observers re-fire when dir/lang are removed;
    // keep the teardown inside act with a drain for overlay follow-ups.
    await act(async () => {
      document.documentElement.removeAttribute('dir');
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });

  it.each(IMPLEMENTING_ENGINES)(
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

  it.each(IMPLEMENTING_ENGINES)(
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

  it.each(IMPLEMENTING_ENGINES)(
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

  it.each(IMPLEMENTING_ENGINES)(
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

  it.each(IMPLEMENTING_ENGINES)(
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

  it.each(['classic'] as const)(
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

  it.each(['classic'] as const)(
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

  it('keys modern skin paint on hooks that reach the DOM (P-88, owner ruling 2026-10-06)', async () => {
    /* P-88 (kernel/common BaseComponentProps): a skinned child keeps its own part,
       so the owner skin keys a composed child through the documented className
       door, never through a caller data-part. Icon glyphs have no part of their
       own and may forward a caller part (structural), so the skin may still key
       those on the part. This asserts the live DOM, not only the skin text,
       because a string check cannot see a hook that stopped reaching the DOM. */
    mockMatchMedia(1280);
    renderWithEngine(<PatternListToolbar engine="modern" {...baseProps()} />, 'modern');
    const root = await findToolbarRoot();
    const skin = readFileSync(MODERN_SKIN_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    // P-88 dependents: composed skinned children (Button/Typography/Badge/Tag) keyed by class.
    const classKeyedParts = [
      'title', 'filter-chips-count', 'filter-chip-label', 'filter-chip-value',
      'icon-button', 'filter-trigger', 'primary-action', 'count-badge',
    ];
    for (const part of classKeyedParts) {
      await waitFor(() => {
        expect(root.querySelector(`.ds-list-toolbar__${part}`), `${part} hook never reached the DOM`).not.toBeNull();
      });
      expect(skin, part).toMatch(new RegExp(`\\.ds-list-toolbar__${part}(?![\\w-])`));
      expect(skin, part).not.toContain(`[data-part='${part}']`);
      expect(skin, part).not.toContain(`[data-part="${part}"]`);
    }

    // Structural children (icon glyphs, no part of their own): the part anchor stays lawful.
    const structuralParts = ['search-icon', 'filter-chips-icon'];
    for (const part of structuralParts) {
      const node = await waitFor(() => {
        const found = root.querySelector(`[data-part='${part}']`);
        expect(found, `${part} never reached the DOM`).not.toBeNull();
        return found as HTMLElement;
      });
      expect(node.classList.contains(`ds-list-toolbar__${part}`), part).toBe(true);
      expect(skin, part).toContain(`.ds-list-toolbar__${part}[data-part='${part}']`);
    }
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

  it('refuses the rustic engine by name instead of painting classic chrome', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockMatchMedia(1280);
    renderWithEngine(<PatternListToolbar engine="rustic" {...baseProps()} />, 'rustic');

    await waitFor(() => {
      expect(document.querySelector('.ds-pattern-list-toolbar')).toBeNull();
    });
  });
});

// F-1 RTL (owner ruling 2026-10-14): the engine default stays the physical `left`, so reading-order text passes
// align="start". jsdom loads no skin stylesheet, so the pair reads the stamped logical value and its utility
// class under each direction; that `text-align: start` lands on the right edge under dir=rtl is CSS's own rule.
function expectLogicalStart(container: ParentNode, hooks: readonly string[], dir: 'ltr' | 'rtl'): void {
  for (const hook of hooks) {
    const nodes = container.querySelectorAll(`.${hook}`);
    expect(nodes.length, hook).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.getAttribute('data-align'), hook).toBe('start');
      expect(node.classList.contains('text-start'), hook).toBe(true);
      // the regression: the physical default pins the text to the left edge in RTL
      expect(node.classList.contains('text-left'), hook).toBe(false);
      expect(node.closest('[dir]')?.getAttribute('dir'), hook).toBe(dir);
    }
  }
}

describe('F-1 RTL semantic alignment', () => {
  // 1280 renders the full row (title section), 375 the compact one: each carries its own title Text.
  it.each([
    ['ltr', 1280],
    ['rtl', 1280],
    ['ltr', 375],
    ['rtl', 375],
  ] as const)('stamps the logical start on the title and the active-filter count under dir=%s at %ipx', async (dir, width) => {
    // The engine wrapper stamps its own locale direction, so the direction under test sits inside it.
    mockMatchMedia(width);
    renderWithEngine(
      <div dir={dir}>
        <PatternListToolbar engine="modern" {...baseProps()} />
      </div>,
      'modern',
    );
    const root = await findToolbarRoot();
    expect(root.getAttribute('data-container-layout')).toBe(width === 375 ? 'compact' : 'full');
    await waitFor(() => {
      expect(root.querySelector('.ds-list-toolbar__title')).not.toBeNull();
    });
    expectLogicalStart(root, ['ds-list-toolbar__title', 'ds-list-toolbar__filter-chips-count'], dir);
  }, 45000);
});
