import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { ColumnMenu } from '../column-menu';
import { SavedViewsMenu } from '../saved-views-menu';
import { ExportButton } from '../export-button';
import { ActiveFiltersBar } from '../active-filters-bar';
import { ScopeSwitcher } from '../scope-switcher';
import { ViewModeSwitcher } from '../view-mode-switcher';
import { TableToolbar } from '../table-toolbar';
import { SearchCommandBar } from '../search-command-bar';
import { PatternListToolbar } from '../../../patterns/data/list-toolbar';
import type { FilterPillConfig } from '../../../patterns/data/list-toolbar';
import { PatternSavedViewsBar } from '../../../patterns/data/saved-views';
import type { SavedView } from '../../../patterns/data/saved-views';
import { StatusFilterPills } from '../../../patterns/data/status-filter-pills';
import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
import { mockMatchMedia } from '../../../../_internal/testing/helpers/match-media';

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
    // density + view segmented controls -- both are nested inside a <Tooltip>,
    // a separately lazy-loaded DS primitive; wait for it specifically before
    // asserting (its Suspense chunk resolves on a later tick than root's).
    await waitForPart(container, 'segmented-control');
    expect(q(container, '[data-part="segmented-control"]').length).toBeGreaterThanOrEqual(2);
    expect(q(container, '[data-part="segment"][data-active="true"]').length).toBeGreaterThanOrEqual(2);
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
    await waitForPart(container, 'filter-dropdown-item');
    expect(q(container, '[data-part="filter-dropdown-item"][data-selected="true"]').length).toBeGreaterThanOrEqual(1);
    expect(q(container, '[data-part="filter-checkmark"]').length).toBeGreaterThanOrEqual(1);
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
  it.each(ENGINES)('stamps root/pill/pill-label/count-badge, all keyed on data-selected (%s)', async (engine) => {
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

  it.each(ENGINES)('groups render group-toggle/group-toggle-label + action rows render action-row/action-section (%s)', async (engine) => {
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
  it.each(ENGINES)('trigger carries ds-structure ds-saved-views-menu; opened panel carries ds-structure ds-saved-views-menu-panel STANDALONE (%s)', async (engine) => {
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

  it.each(ENGINES)('stamps empty-state when there are no views (%s)', async (engine) => {
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
  it.each(ENGINES)('root carries ds-structure ds-export-button; opened panel carries ds-structure ds-export-button-panel STANDALONE; data-export-item + data-part coexist (%s)', async (engine) => {
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
});

// ===========================================================================
// active-filters-bar
// ===========================================================================
describe('active-filters-bar -- data-part contract (CK-C)', () => {
  it.each(ENGINES)('stamps root/pill/chip/chip-label/chip-value/chip-remove/clear-all/add-filter (%s)', async (engine) => {
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
  it.each(ENGINES)('stamps root/pill/pill-label/count-badge, both data-active branches (%s)', async (engine) => {
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
});

// ===========================================================================
// search-command-bar -- voice UI is hardware-gated, see the file header note
// ===========================================================================
describe('search-command-bar -- data-part contract (CK-C)', () => {
  it.each(ENGINES)('stamps root/suggestion-chip/search-shell/search-icon/input/status/suggestions/actions-slot (%s)', async (engine) => {
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

  it.each(ENGINES)('stamps suggestion-chip/suggestions/suggestions-label when suggestions are provided (%s)', async (engine) => {
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
