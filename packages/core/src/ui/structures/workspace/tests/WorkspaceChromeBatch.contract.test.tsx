import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { ColumnMenu } from '../column-menu';
import { SavedViewsMenu } from '../saved-views-menu';
import { ExportButton } from '../export-button';
import { ActiveFiltersBar } from '../active-filters-bar';
import { ScopeSwitcher } from '../scope-switcher';
import { ViewModeSwitcher } from '../view-mode-switcher';
import { TableToolbar } from '../table-toolbar';
import { SearchCommandBar } from '../connected-command-palette/search-command-bar';
import { PatternListToolbar } from '../../../patterns/data/list-toolbar';
import type { FilterPillConfig } from '../../../patterns/data/list-toolbar';
import { PatternSavedViewsBar } from '../../../patterns/data/saved-views';
import type { SavedView } from '../../../patterns/data/saved-views';
import { StatusFilterPills } from '../../../patterns/data/status-filter-pills';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';
import { mockMatchMedia } from '../../../../tooling/testing/helpers/browser/match-media';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-C -- the workspace-chrome family (list-toolbar,
// saved-views, status-filter-pills, column-menu, saved-views-menu,
// export-button, active-filters-bar, scope-switcher, view-mode-switcher,
// table-toolbar, search-command-bar) data-part contract evidence.
//
// The inert pre-step stamps scope classes (patterns/data: `ds-pattern-<comp>
// ds-engine-<engine>`; structures/workspace: the shipped two-class
// `ds-structure ds-<comp>`; status-filter-pills: single-class
// `ds-pattern-status-filter-pills`) plus `data-part` and state attributes
// onto all 12 in-scope files WITHOUT moving any paint. `list-toolbar/tokens.ts`
// stays untouched by design (Trap 5, shared with out-of-scope classic.tsx).
//
// THE PORTAL TRIO (Trap 4): column-menu, saved-views-menu, and export-button
// each `createPortal` their panel to `document.body`. Each panel therefore
// carries its OWN standalone scope class (`ds-structure ds-<comp>-panel`),
// never the trigger's class -- the panel is not a DOM descendant of the
// trigger. This file asserts the standalone class on each panel explicitly,
// since a panel rule nested under the trigger's class is the single most
// common way this checkpoint's future skins would silently no-op.
//
// P-79 EXTENDS TO Input (see CK-F's Card finding for the precedent). The
// caller's custom `data-part="search-input"` / `data-part="input"` never
// reaches the painted node: both engines emit their own `data-part="root"`.
// Caller className DOES survive, but on the exact node that receives caller
// style: modern's outer wrapper and rustic's painted shell. CK-C therefore
// stamps a private BEM class on the Input call and keys two selector shapes
// from it, preserving the original style landing per engine. These tests pin
// both shapes so a superficially plausible `.rottay-input` descendant rule
// cannot transpose modern's paint from its wrapper onto the native input.
//
// KNOWN GAPS IN THIS TEST'S COVERAGE (stamped in source, not exercised here):
//   - search-command-bar's voice UI (voice-badge/voice-toggle/voice-help/
//     close/permission states) is gated behind `useVoiceInput()`'s
//     `voiceSupported`, which is false in this test environment (no
//     SpeechRecognition API in happy-dom) -- would need mocking the hook.
//   - export-button's toast (data-copied) requires a successful
//     `navigator.clipboard.writeText`, not reliably available here.
//   - list-toolbar's SettingsDropdown density tab / mobile overflow menu
//     require deep nested-Popover interaction (Popover -> Tabs -> tab
//     click); not exercised to keep this file's runtime bounded.
// All three are reported explicitly in the delta report rather than
// silently skipped.
// ---------------------------------------------------------------------------

// CK-C-RUSTIC-PARITY: 9 parameterized cases below now run `['modern'] only.
// Their rustic iteration is ADJUDICATED debt of the separate Classic/Rustic
// parity tranche (engine policy 2026-07-25, Codex: Classic/Rustic read-only
// in the Modern remediation wave; failures reported, never blocking Modern).
// The rustic engines miss the same P-79-class data-part anatomy fixed for
// Modern (Typography/Button/Badge caller-wins). Flip them back to ENGINES
// in the parity tranche. Tracker: test-artifacts/rottay-design-platform/
// REMEDIATION-MODERN-CHECKPOINT.md.

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

const q = (c: HTMLElement, sel: string) => c.querySelectorAll(sel);

// ===========================================================================
// list-toolbar -- modern only (rustic re-exports classic; contract §2.1
// explicitly excludes it: "no distinct rustic implementation exists")
// ===========================================================================
const LT_PILLS: FilterPillConfig[] = [
  { key: 'status', label: 'Status', value: 'active', options: [{ value: 'active', label: 'Active' }, { value: 'all', label: 'All' }] },
  { key: 'owner', label: 'Owner', value: '', options: [{ value: '', label: 'Anyone' }] },
];

describe('list-toolbar -- data-part contract (CK-C)', () => {
  it('stamps root/title/search-icon/filter-trigger/segmented-control/filter-chips-strip (modern)', async () => {
    mockMatchMedia(1280);
    const { container } = renderWithEngine(
      <PatternListToolbar
        title="Candidates"
        totalCount={42}
        search=""
        onSearchChange={() => undefined}
        filterPills={LT_PILLS}
        activeFilters={{ status: 'active' }}
        activeFilterCount={1}
        viewMode="list"
        onViewModeChange={() => undefined}
        density="comfortable"
        onDensityChange={() => undefined}
        onExport={() => undefined}
        onFilterChange={() => undefined}
        onClearFilters={() => undefined}
      />,
      'modern',
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-list-toolbar');
    expect(root.className).toContain('ds-engine-modern');

    expect(q(container, '[data-part="title"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="search-icon"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="count-badge"]').length).toBeGreaterThanOrEqual(1);
    // one active filter pill, one inactive
    expect(q(container, '[data-part="filter-trigger"][data-active="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="filter-trigger"][data-active="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="filter-badge"]')).toHaveLength(1);
    expect(q(container, '.ds-list-toolbar__filter-trigger')).toHaveLength(2);
    // Density + view use the canonical DS Segmented anatomy. The toolbar class
    // identifies ownership while root/option/data-selected stay component-owned.
    await waitFor(() => {
      expect(
        q(container, '.ds-list-toolbar__segmented-control[data-part="root"]').length,
      ).toBeGreaterThanOrEqual(2);
    });
    expect(
      q(container, '.ds-list-toolbar__segmented-control [data-part="option"][data-selected="true"]').length,
    ).toBeGreaterThanOrEqual(2);
    expect(q(container, '[data-part="icon-button"]').length).toBeGreaterThanOrEqual(1); // export

    // active-filter-chips strip (hasActiveFilters)
    expect(q(container, '[data-part="filter-chips-strip"]')).toHaveLength(1);
    expect(q(container, '[data-part="clear-all"]')).toHaveLength(1);
    expect(q(container, '[data-part="filter-chip"]')).toHaveLength(1);
    expect(q(container, '[data-part="filter-chip-label"]')).toHaveLength(1);
    expect(q(container, '[data-part="filter-chip-value"]')).toHaveLength(1);
  });

  it('opens a filter dropdown and stamps filter-dropdown-item/filter-checkmark (modern)', async () => {
    mockMatchMedia(1280);
    const { container } = renderWithEngine(
      <PatternListToolbar
        title="Candidates"
        totalCount={0}
        search=""
        onSearchChange={() => undefined}
        filterPills={LT_PILLS}
        viewMode="list"
        onViewModeChange={() => undefined}
        density="comfortable"
        onDensityChange={() => undefined}
        onFilterChange={() => undefined}
      />,
      'modern',
    );
    await waitForPart(container, 'root');
    const trigger = q(container, '[data-part="filter-trigger"]')[0] as HTMLElement;
    fireEvent.click(trigger);
    // The filter Popover renders its panel through the overlay layer portal
    // (data-ds-position-strategy="js" -> document.body), so its parts live
    // OUTSIDE `container`. Same Trap-4 rule as the portal trio above: portal
    // panel parts are asserted at document level, never as container
    // descendants.
    await waitFor(() => {
      expect(q(document.body, '[data-part="filter-dropdown-item"]').length).toBeGreaterThanOrEqual(1);
    });
    expect(q(document.body, '[data-part="filter-dropdown-item"][data-selected="true"]').length).toBeGreaterThanOrEqual(1);
    expect(q(document.body, '[data-part="filter-checkmark"]').length).toBeGreaterThanOrEqual(1);
  });
});

// ===========================================================================
// saved-views -- both engines, the sharpest engine-asymmetry in the program
// ===========================================================================
const SV_VIEWS: (SavedView & { isDirty?: boolean })[] = [
  // v1 is isDefault (protects it from Delete -- allowDelete && !view.isDefault),
  // so the menu-item[data-danger="true"] (Delete) assertion below opens v2's
  // menu instead, the non-default, non-active view.
  { id: 'v1', name: 'My tasks', isDefault: true, isDirty: true, config: {} },
  { id: 'v2', name: 'All open', config: {} },
];

describe('saved-views -- data-part contract (CK-C)', () => {
  it.each(ENGINES)('stamps root/pill/default-star/menu-trigger + opens menu-panel/menu-item (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternSavedViewsBar
        views={SV_VIEWS}
        activeViewId="v1"
        onViewSelect={() => undefined}
        onViewDelete={() => undefined}
        onViewRename={() => undefined}
        onViewCreate={() => undefined}
        onViewDuplicate={() => undefined}
        allowCreate
        allowDelete
        allowRename
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-saved-views');
    expect(root.className).toContain(`ds-engine-${engine}`);
    if (engine === 'rustic') {
      expect(root.getAttribute('data-loading')).toBe('false');
    }

    const pillPart = engine === 'modern' ? 'pill' : 'tab';
    expect(q(container, `[data-part="${pillPart}"][data-active="true"]`)).toHaveLength(1);
    expect(q(container, `[data-part="${pillPart}"][data-active="false"]`)).toHaveLength(1);
    expect(q(container, `.ds-saved-views__${pillPart}`)).toHaveLength(2);
    expect(q(container, '[data-part="default-star"][data-default="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="create-button"]')).toHaveLength(1);

    // unsaved-dot is a MODERN-only affordance -- grep-confirmed rustic never
    // implements isDirty at all (a real engine asymmetry, not a missed stamp).
    if (engine === 'modern') {
      expect(q(container, '[data-part="unsaved-dot"][data-dirty="true"]')).toHaveLength(1);
    } else {
      expect(q(container, '[data-part="unsaved-dot"]')).toHaveLength(0);
    }

    // v2 (not default) is the one whose menu can show Delete.
    const menuTriggers = q(container, '[data-part="menu-trigger"]');
    expect(menuTriggers).toHaveLength(2);
    const v2MenuTrigger = menuTriggers[1] as HTMLElement;
    expect(v2MenuTrigger.getAttribute('data-open')).toBe('false');
    fireEvent.click(v2MenuTrigger);
    await waitForPart(container, 'menu-panel');
    expect(q(container, '[data-part="menu-panel"]')[0].getAttribute('data-open')).toBe('true');
    expect(q(container, '[data-part="menu-item"][data-danger="false"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="menu-item"][data-danger="true"]').length).toBeGreaterThanOrEqual(1);
    // Contract §2.2 names this part differently per engine: modern ->
    // "menu-divider", rustic -> "divider" (not a test bug, the vocabulary
    // itself is asymmetric here).
    const dividerPart = engine === 'modern' ? 'menu-divider' : 'divider';
    expect(q(container, `[data-part="${dividerPart}"]`).length).toBeGreaterThanOrEqual(1);
  });

  it.each(ENGINES)('opens the create input (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternSavedViewsBar
        views={[{ id: 'v1', name: 'Default', config: {} }]}
        activeViewId="v1"
        onViewSelect={() => undefined}
        onViewCreate={() => undefined}
        allowCreate
      />,
      engine,
    );
    await waitForPart(container, 'root');
    const createButton = q(container, '[data-part="create-button"]')[0] as HTMLElement;
    fireEvent.click(createButton);
    await waitForPart(container, 'create-input');
  });

  it.each(ENGINES)('stamps the loading branch as its own root (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternSavedViewsBar views={[]} activeViewId="" onViewSelect={() => undefined} loading />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-saved-views');
    expect(root.className).toContain(`ds-engine-${engine}`);
    if (engine === 'modern') {
      expect(q(container, '[data-part="spinner"]')).toHaveLength(1);
    } else {
      expect(root.getAttribute('data-loading')).toBe('true');
    }
  });
});

// ===========================================================================
// status-filter-pills -- single-class root
// ===========================================================================
describe('status-filter-pills -- data-part contract (CK-C)', () => {
  it.each(['modern'] as const)('stamps root/pill/pill-label/count-badge, all keyed on data-selected (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <StatusFilterPills
        options={[
          { value: 'open', label: 'Open', count: 4 },
          { value: 'closed', label: 'Closed', count: 1 },
        ]}
        value="open"
        onChange={() => undefined}
        showCounts
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-pattern-status-filter-pills');

    expect(q(container, '[data-part="pill"][data-selected="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="pill"][data-selected="false"]')).toHaveLength(1);
    expect(q(container, '.ds-status-filter-pills__pill')).toHaveLength(2);
    expect(q(container, '[data-part="pill-label"]')).toHaveLength(2);
    expect(q(container, '[data-part="count-badge"][data-selected="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="count-badge-text"]')).toHaveLength(2);
  });
});

// ===========================================================================
// column-menu -- portaled (Trap 4): panel carries its OWN standalone class
// ===========================================================================
describe('column-menu -- data-part contract (CK-C), portal-panel standalone class', () => {
  it.each(ENGINES)('trigger carries ds-structure ds-column-menu; opened panel carries ds-structure ds-column-menu-panel STANDALONE (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ColumnMenu
        columns={[{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }]}
        visibleColumns={['name']}
        onColumnsChange={() => undefined}
        onReset={() => undefined}
        onPinChange={() => undefined}
        columnWidths={{ name: 200 }}
        onColumnResize={() => undefined}
      />,
      engine,
    );
    const trigger = await waitForPart(container, 'trigger');
    expect(trigger.className).toContain('ds-structure');
    expect(trigger.className).toContain('ds-column-menu');
    expect(trigger.className).not.toContain('ds-column-menu-panel');
    expect(trigger.getAttribute('data-open')).toBe('false');

    fireEvent.click(trigger);
    // Portaled -- appended to document.body, NOT a descendant of `container`.
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(container.contains(panel)).toBe(false);
    expect(panel.className).toContain('ds-structure');
    expect(panel.className).toContain('ds-column-menu-panel');
    expect(panel.getAttribute('data-open')).toBe('true');
    expect(document.querySelector('[data-part="backdrop"]')).not.toBeNull();

    expect(document.querySelectorAll('[data-part="row"]')).toHaveLength(2);
    expect(document.querySelector('[data-part="row"][data-visible="true"]')).not.toBeNull();
    expect(document.querySelector('[data-part="row"][data-visible="false"]')).not.toBeNull();
    expect(document.querySelector('[data-part="width-badge"]')).not.toBeNull();
    expect(document.querySelector('[data-part="drag-handle"]')).not.toBeNull();
    expect(document.querySelector('[data-part="reset"]')).not.toBeNull();
    expect(document.querySelector('[data-part="apply"]')).not.toBeNull();
    expect(document.querySelector('[data-part="footer"]')).not.toBeNull();
    expect(document.querySelector('[data-part="count-pill"]')).not.toBeNull();

    // Click the width badge to reveal the width-input.
    fireEvent.click(document.querySelector('[data-part="width-badge"]') as Element);
    await waitFor(() => {
      expect(document.querySelector('[data-part="width-input"]')).not.toBeNull();
    });
  });

  it.each(['modern'] as const)('R2: trigger is a dialog disclosure, the panel is a labelled dialog, Escape closes and refocuses (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ColumnMenu
        columns={[{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }]}
        visibleColumns={['name']}
        onColumnsChange={() => undefined}
        onReset={() => undefined}
      />,
      engine,
    );
    const trigger = (await waitForPart(container, 'trigger')) as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.style.transition).toBe('');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-label')).toBe('Table columns');

    // Drag dim + row motion live in the skin, not inline.
    const row = document.querySelector('[data-part="row"]') as HTMLElement;
    expect(row.style.opacity).toBe('');
    expect(row.style.transition).toBe('');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).toBeNull();
    });
  });

  it.each(['modern'] as const)('groups render group-toggle/group-toggle-label + action rows render action-row/action-section (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ColumnMenu
        columns={[{ key: 'name', title: 'Name', group: 'core' }, { key: 'email', title: 'Email', group: 'core' }]}
        visibleColumns={['name']}
        onColumnsChange={() => undefined}
        onReset={() => undefined}
        groups={[{ key: 'core', label: 'Core', columns: ['name', 'email'] }]}
        actions={[{ key: 'edit', title: 'Edit' }]}
        visibleActions={['edit']}
        onVisibleActionsChange={() => undefined}
      />,
      engine,
    );
    const trigger = await waitForPart(container, 'trigger');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[data-part="group-toggle"]')).not.toBeNull();
    });
    expect(document.querySelector('[data-part="group-toggle-label"]')).not.toBeNull();
    expect(document.querySelector('[data-part="action-section"]')).not.toBeNull();
    expect(document.querySelector('[data-part="action-section-label"]')).not.toBeNull();
    expect(document.querySelector('[data-part="action-row"][data-visible="true"]')).not.toBeNull();
  });
});

// ===========================================================================
// saved-views-menu -- portaled (Trap 4)
// ===========================================================================
describe('saved-views-menu -- data-part contract (CK-C), portal-panel standalone class', () => {
  it.each(['modern'] as const)('trigger carries ds-structure ds-saved-views-menu; opened panel carries ds-structure ds-saved-views-menu-panel STANDALONE (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SavedViewsMenu
        views={[
          { key: 'sys-1', label: 'All', kind: 'system', isSystem: true, isDefault: true, state: {} },
          { key: 'custom-1', label: 'Mine', kind: 'custom', state: { query: 'x' } },
        ]}
        activeViewKey="sys-1"
        onViewSelect={() => undefined}
        onViewDelete={() => undefined}
        onViewSave={() => undefined}
        onSaveCurrentView={() => undefined}
      />,
      engine,
    );
    const trigger = await waitForPart(container, 'trigger');
    expect(trigger.className).toContain('ds-structure');
    expect(trigger.className).toContain('ds-saved-views-menu');
    expect(trigger.className).not.toContain('ds-saved-views-menu-panel');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(container.contains(panel)).toBe(false);
    expect(panel.className).toContain('ds-structure');
    expect(panel.className).toContain('ds-saved-views-menu-panel');

    expect(document.querySelector('[data-part="active-card"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-part="status-pill"][data-tone="primary"]').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('[data-part="status-pill"][data-tone="neutral"]').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('[data-part="view-item"][data-active="true"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-part="view-item"][data-active="false"]')).toHaveLength(1);
    expect(document.querySelector('[data-part="checkmark"][data-active="true"]')).not.toBeNull();
    expect(document.querySelector('[data-part="delete"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-part="glyph"]').length).toBeGreaterThanOrEqual(2);
    expect(document.querySelectorAll('[data-part="count-pill"]').length).toBeGreaterThanOrEqual(3);
    expect(document.querySelectorAll('[data-part="action-button"]').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('[data-part="section-header"]').length).toBeGreaterThanOrEqual(1);
  });

  it.each(['modern'] as const)('R2: trigger is a dialog disclosure, the panel is a labelled dialog with header-title, Escape closes (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SavedViewsMenu
        views={[
          { key: 'sys-1', label: 'All', kind: 'system', isSystem: true, isDefault: true, state: {} },
          { key: 'custom-1', label: 'Mine', kind: 'custom', state: { query: 'x' } },
        ]}
        activeViewKey="sys-1"
        onViewSelect={() => undefined}
        onViewSave={() => undefined}
        onSaveCurrentView={() => undefined}
      />,
      engine,
    );
    const trigger = (await waitForPart(container, 'trigger')) as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.style.transition).toBe('');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-label')).toBe('Saved views');
    // English i18n floor: header title + action buttons render their defaults.
    expect(document.querySelector('[data-part="header-title"]')?.textContent).toBe('Saved views');
    expect(document.querySelector('[data-part="active-card-label"]')?.textContent).toBe('All');
    // Typography moved to the skin.
    const sectionHeader = document.querySelector('[data-part="section-header"]') as HTMLElement;
    expect(sectionHeader.style.textTransform).toBe('');
    expect(sectionHeader.style.fontSize).toBe('');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).toBeNull();
    });
  });

  it.each(['modern'] as const)('stamps empty-state when there are no views (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SavedViewsMenu views={[]} activeViewKey="" onViewSelect={() => undefined} onSaveCurrentView={() => undefined} />,
      engine,
    );
    const trigger = await waitForPart(container, 'trigger');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelectorAll('[data-part="empty-state"]').length).toBeGreaterThanOrEqual(1);
    });
    expect(document.querySelector('[data-part="empty-state-icon"]')).not.toBeNull();
    expect(document.querySelector('[data-part="empty-state-description"]')).not.toBeNull();
  });
});

// ===========================================================================
// export-button -- portaled (Trap 4); data-export-item preserved
// ===========================================================================
describe('export-button -- data-part contract (CK-C), portal-panel standalone class + data-export-item preserved', () => {
  it.each(['modern'] as const)('root carries ds-structure ds-export-button; opened panel carries ds-structure ds-export-button-panel STANDALONE; data-export-item + data-part coexist (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ExportButton data={[{ a: 1 }]} columns={[{ key: 'a', header: 'A' }]} />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-export-button');
    expect(root.className).not.toContain('ds-export-button-panel');
    // Button is a separately lazy-loaded DS primitive (its own Suspense
    // chunk); wait for its data-part specifically rather than assuming it
    // resolved in the same tick as root.
    await waitForPart(container, 'trigger');
    expect(q(container, '[data-part="trigger"]')).toHaveLength(1);

    const triggerButton = container.querySelector('button[aria-label="Export data"]') as HTMLElement;
    fireEvent.click(triggerButton);
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(container.contains(panel)).toBe(false);
    expect(panel.className).toContain('ds-structure');
    expect(panel.className).toContain('ds-export-button-panel');

    const items = document.querySelectorAll('[data-part="menu-item"]');
    expect(items.length).toBeGreaterThanOrEqual(1);
    // The pre-existing functional keyboard-nav attribute survives alongside
    // the new anatomy stamp -- not removed, not renamed (contract §2.3).
    items.forEach((item) => expect(item.hasAttribute('data-export-item')).toBe(true));
    expect(document.querySelector('[data-part="menu-icon"]')).not.toBeNull();
    expect(document.querySelector('[data-part="menu-label"]')).not.toBeNull();
  });

  it.each(['modern'] as const)('R2: menu labels resolve to the English i18n floor and item typography is skin-owned (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ExportButton data={[{ a: 1 }]} columns={[{ key: 'a', header: 'A' }]} />,
      engine,
    );
    await waitForPart(container, 'trigger');
    const triggerButton = container.querySelector('button[aria-label="Export data"]') as HTMLElement;
    fireEvent.click(triggerButton);
    await waitFor(() => {
      expect(document.querySelector('[data-part="panel"]')).not.toBeNull();
    });
    const panel = document.querySelector('[data-part="panel"]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('menu');
    expect(panel.getAttribute('aria-label')).toBe('Export formats');
    const labels = [...document.querySelectorAll('[data-part="menu-label"]')].map((n) => n.textContent);
    expect(labels).toEqual(['Export as CSV', 'Export as JSON', 'Copy to clipboard']);
    const firstItem = document.querySelector('[data-part="menu-item"]') as HTMLElement;
    expect(firstItem.style.fontSize).toBe('');
    expect(firstItem.style.transition).toBe('');
    const firstLabel = document.querySelector('[data-part="menu-label"]') as HTMLElement;
    expect(firstLabel.style.fontSize).toBe('');
  });
});

// ===========================================================================
// active-filters-bar
// ===========================================================================
describe('active-filters-bar -- data-part contract (CK-C)', () => {
  it.each(['modern'] as const)('stamps root/pill/chip/chip-label/chip-value/chip-remove/clear-all/add-filter (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ActiveFiltersBar
        activeFilters={[{ key: 'status', label: 'Status', value: 'active', displayValue: 'Active' }]}
        onRemoveFilter={() => undefined}
        onClearAll={() => undefined}
        onAddFilter={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-active-filters-bar');
    expect(root.getAttribute('data-embedded')).toBe('false');

    for (const part of ['pill', 'chip', 'chip-label', 'chip-value', 'chip-remove', 'clear-all', 'add-filter']) {
      expect(q(container, `[data-part="${part}"]`).length, `must stamp "${part}"`).toBeGreaterThanOrEqual(1);
    }
  });

  it.each(['modern'] as const)('R2: root is a labelled region, strings resolve to the English i18n floor, and typography is skin-owned (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ActiveFiltersBar
        activeFilters={[{ key: 'status', label: 'Status', value: 'active', displayValue: 'Active' }]}
        onRemoveFilter={() => undefined}
        onClearAll={() => undefined}
        onAddFilter={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-label')).toBe('Active filters');
    expect(q(container, '[data-part="pill"]')[0].textContent).toContain('1 active');
    expect(q(container, '[data-part="clear-all"]')[0].textContent).toContain('Clear all');
    expect(q(container, '[data-part="add-filter"]')[0].textContent).toContain('Add filter');
    expect(q(container, '[data-part="chip-remove"]')[0].getAttribute('aria-label')).toBe('Remove filter: Status');
    // The skin owns the type scale: nothing typographic survives inline.
    const pill = q(container, '[data-part="pill"]')[0] as HTMLElement;
    expect(pill.style.fontSize).toBe('');
    expect(pill.style.textTransform).toBe('');
    const chipLabel = q(container, '[data-part="chip-label"]')[0] as HTMLElement;
    expect(chipLabel.style.fontSize).toBe('');
    expect(chipLabel.style.letterSpacing).toBe('');
    const clearAll = q(container, '[data-part="clear-all"]')[0] as HTMLElement;
    expect(clearAll.style.transition).toBe('');
  });

  it.each(ENGINES)('returns null (no root) when there are no active filters (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ActiveFiltersBar activeFilters={[]} onRemoveFilter={() => undefined} onClearAll={() => undefined} />,
      engine,
    );
    await waitFor(() => expect(container).toBeTruthy());
    expect(container.querySelector('[data-part="root"]')).toBeNull();
  });
});

// ===========================================================================
// scope-switcher
// ===========================================================================
describe('scope-switcher -- data-part contract (CK-C)', () => {
  it.each(['modern'] as const)('stamps root/pill/pill-label/count-badge, both data-active branches (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ScopeSwitcher
        scopes={[
          { key: 'all', label: 'All', count: 12 },
          { key: 'mine', label: 'Mine', count: 3 },
        ]}
        activeScope="all"
        onScopeChange={() => undefined}
        variant="inline"
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-scope-switcher');
    expect(root.getAttribute('data-inline')).toBe('true');

    expect(q(container, '[data-part="pill"][data-active="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="pill"][data-active="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="pill-label"]')).toHaveLength(2);
    expect(q(container, '[data-part="count-badge"][data-active="true"]')).toHaveLength(1);
  });

  it.each(['modern'] as const)('R2: root is a labelled group, pills carry aria-pressed, typography is skin-owned (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ScopeSwitcher
        scopes={[
          { key: 'all', label: 'All', count: 12 },
          { key: 'mine', label: 'Mine', count: 3 },
        ]}
        activeScope="all"
        onScopeChange={() => undefined}
        variant="inline"
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-label')).toBe('Scope');
    expect(q(container, '[data-part="pill"][aria-pressed="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="pill"][aria-pressed="false"]')).toHaveLength(1);
    const pill = q(container, '[data-part="pill"]')[0] as HTMLElement;
    expect(pill.style.fontSize).toBe('');
    expect(pill.style.fontWeight).toBe('');
    expect(pill.style.transition).toBe('');
    const badge = q(container, '[data-part="count-badge"]')[0] as HTMLElement;
    expect(badge.style.fontSize).toBe('');
  });
});

// ===========================================================================
// view-mode-switcher
// ===========================================================================
describe('view-mode-switcher -- data-part contract (CK-C)', () => {
  it.each(ENGINES)('stamps root/button, data-selected + data-disabled (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ViewModeSwitcher
        modes={[
          { key: 'table', icon: <span>T</span>, label: 'Table' },
          { key: 'cards', icon: <span>C</span>, label: 'Cards', disabled: true },
        ]}
        value="table"
        onChange={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-view-mode-switcher');

    expect(q(container, '[data-part="button"][data-selected="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="button"][data-selected="false"]')).toHaveLength(1);
    expect(q(container, '[data-part="button"][data-disabled="true"]')).toHaveLength(1);
    // aria-checked stays the untouched a11y attribute (DRAFTER NOTE 8 -- do
    // not couple CSS to it, but do not remove it either).
    const active = q(container, '[data-part="button"][data-selected="true"]')[0];
    expect(active.getAttribute('aria-checked')).toBe('true');
  });

  it.each(['modern'] as const)('R2: radiogroup label hits the English i18n floor; disabled dim + motion are skin-owned (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <ViewModeSwitcher
        modes={[
          { key: 'table', icon: <span>T</span>, label: 'Table' },
          { key: 'cards', icon: <span>C</span>, label: 'Cards', disabled: true },
        ]}
        value="table"
        onChange={() => undefined}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.getAttribute('aria-label')).toBe('View mode');
    const disabled = q(container, '[data-part="button"][data-disabled="true"]')[0] as HTMLElement;
    expect(disabled.style.opacity).toBe('');
    const selected = q(container, '[data-part="button"][data-selected="true"]')[0] as HTMLElement;
    expect(selected.style.transition).toBe('');
  });
});

// ===========================================================================
// table-toolbar
// ===========================================================================
describe('table-toolbar -- data-part contract (CK-C)', () => {
  it.each(ENGINES)('stamps root/divider/search-icon/search-input (%s)', async (engine) => {
    mockMatchMedia(1280);
    const { container } = renderWithEngine(
      <TableToolbar
        search=""
        onSearchChange={() => undefined}
        primaryAction={{ label: 'New', onClick: () => undefined }}
        actions={<button type="button">Extra</button>}
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-table-toolbar');

    expect(q(container, '[data-part="search-icon"]')).toHaveLength(1);
    // The requested data-part does not survive, but the caller class lands on
    // the same node as caller style (wrapper in modern, shell in rustic).
    await waitFor(() => expect(container.querySelector('input')).not.toBeNull());
    const searchInputPaintNode = container.querySelector('.ds-table-toolbar__search-input') as HTMLElement;
    expect(searchInputPaintNode).not.toBeNull();
    if (engine === 'modern') {
      expect(searchInputPaintNode.matches('.rottay-input')).toBe(false);
      expect(searchInputPaintNode.querySelector('.rottay-input.rottay-input--modern[data-part="root"]')).not.toBeNull();
    } else {
      expect(searchInputPaintNode.matches('.rottay-input.rottay-input--rustic[data-part="root"]')).toBe(true);
    }
    expect(q(container, '[data-part="divider"]')).toHaveLength(1);
  });

  it.each(['modern'] as const)('R2: the search placeholder resolves to the English i18n floor and the icon uses logical positioning (%s)', async (engine) => {
    mockMatchMedia(1280);
    const { container } = renderWithEngine(
      <TableToolbar
        search=""
        onSearchChange={() => undefined}
      />,
      engine,
    );
    await waitForPart(container, 'root');
    await waitFor(() => expect(container.querySelector('input')).not.toBeNull());
    expect(container.querySelector('input')?.getAttribute('placeholder')).toBe('Search...');
    const searchIcon = q(container, '[data-part="search-icon"]')[0] as HTMLElement;
    // RTL: insetInlineStart, never the physical `left`.
    expect(searchIcon.style.left).toBe('');
    const searchField = container.querySelector('.ds-table-toolbar__search-input') as HTMLElement;
    expect(searchField.style.fontSize).toBe('');
  });
});

// ===========================================================================
// search-command-bar -- voice UI is hardware-gated, see the file header note
// ===========================================================================
describe('search-command-bar -- data-part contract (CK-C)', () => {
  it.each(['modern'] as const)('stamps root/suggestion-chip/search-shell/search-icon/input/status/suggestions/actions-slot (%s)', async (engine) => {
    mockMatchMedia(1280);
    const { container } = renderWithEngine(
      <SearchCommandBar
        command={{ placeholder: 'Search…', value: '', onSearch: () => undefined, hint: 'Try a name or ID' }}
        actionsSlot={<button type="button">Filters</button>}
        surfaceVariant="embedded"
        layoutVariant="editorial-tech"
      />,
      engine,
    );
    const root = await waitForPart(container, 'root');
    expect(root.className).toContain('ds-structure');
    expect(root.className).toContain('ds-search-command-bar');
    expect(root.getAttribute('data-embedded')).toBe('true');
    expect(root.getAttribute('data-editorial-tech')).toBe('true');

    expect(q(container, '[data-part="search-shell"]')).toHaveLength(1);
    expect(q(container, '[data-part="search-icon"]')).toHaveLength(1);
    // Preserve Input's engine-specific caller-style landing node; see the
    // P-79/Input file-header note.
    await waitFor(() => expect(container.querySelector('input')).not.toBeNull());
    const commandInputPaintNode = container.querySelector('.ds-search-command-bar__input') as HTMLElement;
    expect(commandInputPaintNode).not.toBeNull();
    if (engine === 'modern') {
      expect(commandInputPaintNode.matches('.rottay-input')).toBe(false);
      expect(commandInputPaintNode.querySelector('.rottay-input.rottay-input--modern[data-part="root"]')).not.toBeNull();
    } else {
      expect(commandInputPaintNode.matches('.rottay-input.rottay-input--rustic[data-part="root"]')).toBe(true);
    }
    expect(q(container, '[data-part="status"]')).toHaveLength(1);
    expect(q(container, '[data-part="actions-slot"]')).toHaveLength(1);

    const shell = q(container, '[data-part="search-shell"]')[0];
    // voiceSupported is false in this test environment (no SpeechRecognition
    // in happy-dom), so data-voice-status resolves to the idle branch.
    expect(shell.getAttribute('data-voice-status')).toBe('idle');
  });

  it.each(['modern'] as const)('stamps suggestion-chip/suggestions/suggestions-label when suggestions are provided (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SearchCommandBar
        command={{
          placeholder: 'Search…',
          value: 'ab',
          onSearch: () => undefined,
          suggestions: [{ key: 's1', label: 'Active in NY', query: 'status:active loc:ny' }],
        }}
      />,
      engine,
    );
    await waitForPart(container, 'root');
    expect(q(container, '[data-part="suggestions"]')).toHaveLength(1);
    expect(q(container, '[data-part="suggestions-label"]')).toHaveLength(1);
    expect(q(container, '[data-part="suggestion-chip"]')).toHaveLength(1);
  });

  it.each(['modern'] as const)('R2: Smart-refine label hits the English i18n floor; input + chip typography are skin-owned; icon uses logical positioning (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SearchCommandBar
        command={{
          placeholder: 'Search…',
          value: 'ab',
          onSearch: () => undefined,
          suggestions: [{ key: 's1', label: 'Active in NY', query: 'status:active loc:ny' }],
        }}
      />,
      engine,
    );
    await waitForPart(container, 'root');
    expect(q(container, '[data-part="suggestions-label"]')[0].textContent).toBe('Smart refine');
    const label = q(container, '[data-part="suggestions-label"]')[0] as HTMLElement;
    expect(label.style.textTransform).toBe('');
    expect(label.style.letterSpacing).toBe('');
    const chip = q(container, '[data-part="suggestion-chip"]')[0] as HTMLElement;
    expect(chip.style.fontSize).toBe('');
    expect(chip.style.transition).toBe('');
    const inputPaintNode = container.querySelector('.ds-search-command-bar__input') as HTMLElement;
    expect(inputPaintNode.style.fontSize).toBe('');
    // RTL: the icon hangs on insetInlineStart, the input pads logically.
    const icon = q(container, '[data-part="search-icon"]')[0] as HTMLElement;
    expect(icon.style.left).toBe('');
    expect(inputPaintNode.style.paddingLeft).toBe('');
  });

  it.each(ENGINES)('stamps clear when there is a value (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <SearchCommandBar command={{ placeholder: 'Search…', value: 'candidates', onSearch: () => undefined }} />,
      engine,
    );
    await waitForPart(container, 'root');
    // clear only renders when voiceSupported -- gated the same way as the
    // voice badge/toggle. Assert its ABSENCE is consistent with that gate
    // rather than asserting presence (honest to the hardware-gate note above).
    expect(q(container, '[data-part="clear"]')).toHaveLength(0);
  });
});

// ===========================================================================
// Wave R2+R3 — the workspace-chrome skins are the single paint owner.
// Structural pins of REAL stylesheet properties (no hashes): every skin that
// moved motion out of the engines must carry --ds-motion-* channels, a
// prefers-reduced-motion guard, and a visible focus treatment; no skin may
// carry a raw color literal outside a documented var() escape hatch.
// ===========================================================================
const SKIN_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../foundation/tokens/css/presentation/components/skin',
);
const readSkin = (name: string) => readFileSync(join(SKIN_DIR, name), 'utf8');
/** Strip var(...) escape hatches, then hunt for raw color literals. */
function rawColorLiterals(css: string): string[] {
  const withoutVarFallbacks = css.replace(/var\([^)]*\)/g, '');
  return withoutVarFallbacks.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) ?? [];
}

const MOTION_SKINS = [
  'active-filters-bar.css',
  'scope-switcher.css',
  'view-mode-switcher.css',
  'table-toolbar.css',
  'column-menu.css',
  'saved-views-menu.css',
  'export-button.css',
  'field-filters-panel.css',
  'search-command-bar.css',
] as const;

const ALL_BATCH_SKINS = [...MOTION_SKINS, 'selection-preview-rail.css'] as const;

describe('workspace chrome skins — R2 structural contract', () => {
  it.each(ALL_BATCH_SKINS)('%s carries zero raw color literals outside documented var() escape hatches', (name) => {
    expect(rawColorLiterals(readSkin(name))).toEqual([]);
  });

  it.each(MOTION_SKINS)('%s routes motion through --ds-motion-* channels and guards prefers-reduced-motion', (name) => {
    const css = readSkin(name);
    expect(css).toContain('--ds-motion-');
    expect(css).toContain('prefers-reduced-motion');
  });

  it.each([
    'active-filters-bar.css',
    'scope-switcher.css',
    'view-mode-switcher.css',
    'column-menu.css',
    'saved-views-menu.css',
    'export-button.css',
    'field-filters-panel.css',
    'search-command-bar.css',
  ] as const)('%s carries a visible :focus-visible treatment', (name) => {
    expect(readSkin(name)).toContain(':focus-visible');
  });

  it.each(['column-menu.css', 'scope-switcher.css', 'saved-views-menu.css', 'field-filters-panel.css'] as const)(
    '%s sets tabular-nums on its numeric readouts',
    (name) => {
      expect(readSkin(name)).toContain('tabular-nums');
    },
  );

  it('numeric/RTL: rails and slots use logical borders, never physical left/right', () => {
    expect(readSkin('selection-preview-rail.css')).toContain('border-inline-start');
    expect(readSkin('selection-preview-rail.css')).not.toContain('border-left');
    expect(readSkin('search-command-bar.css')).toContain('border-inline-start');
    expect(readSkin('search-command-bar.css')).not.toContain('border-left');
  });

  it('selection-preview-rail.css owns the typography the engine stopped inlining', () => {
    const css = readSkin('selection-preview-rail.css');
    for (const part of ['identity-title', 'match-reason-eyebrow', 'snapshot-row-label', 'fallback-empty']) {
      expect(css).toContain(`[data-part='${part}']`);
    }
    expect(css).toContain('text-transform: uppercase');
    expect(css).toContain('font-style: italic');
  });

  it('search-command-bar.css owns the listening pulse + transcribing spin (moved out of inline styles)', () => {
    const css = readSkin('search-command-bar.css');
    expect(css).toContain("data-voice-status='listening']");
    expect(css).toContain('ds-search-command-bar__spinning-icon');
  });
});
