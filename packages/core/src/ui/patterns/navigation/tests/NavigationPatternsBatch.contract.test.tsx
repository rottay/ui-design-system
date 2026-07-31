import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

import { PatternCommandPalette } from '../command-palette';
import type { CommandItem } from '../command-palette';
import { PatternEnvironmentToggle } from '../environment-toggle';
import type { EnvironmentDef } from '../environment-toggle';
import { PatternWorkspaceSwitcher } from '../workspace-switcher';
import type { Workspace } from '../workspace-switcher';
import { PatternShortcutsOverlay } from '../shortcuts-overlay';
import type { ShortcutDisplayItem } from '../shortcuts-overlay';
import { PatternLocaleSwitcher, DEFAULT_LOCALES } from '../locale-switcher';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-06 checkpoint CK-G -- the patterns/navigation family
// (CommandPalette, EnvironmentToggle, WorkspaceSwitcher, ShortcutsOverlay,
// LocaleSwitcher) data-part contract evidence.
//
// The inert pre-step stamps the pattern-tier scope class (ds-pattern-<comp> +
// ds-engine-<engine>, matching every shipped pattern skin -- detail-panel,
// filter-panel, the header patterns) plus `data-part` and state attributes onto
// the ten engine files (modern + rustic for all five) WITHOUT moving any paint.
// Three of the five (environment-toggle, workspace-switcher, locale-switcher)
// already carried ds-pattern-<comp> on at least one engine; command-palette and
// shortcuts-overlay had no first-party class and get ds-pattern-<comp> minted
// fresh. This test is the only thing in the chain that catches a stamp that
// never reaches the DOM.
//
// WHY THE ASSERTIONS ARE THE P-79 SURVIVAL PROOF: `BaseComponentProps` declares
// `data-part` on every component, so `tsc` accepts the stamp anywhere, but the
// engines build their DOM props from allowlists and Grid/Card/Button silently
// DROP it. This ENTIRE family renders raw DOM exclusively (div/span/button/
// input/kbd/svg/h2 -- zero DS primitives are imported in any of the ten engine
// files), so P-79 cannot bite here and every stamp below is expected to land.
// That is a property of today's source, not a licence to skip the assertion:
// the day one of these files composes a Box or a Button, this test is what
// notices.
//
// FACTS THIS TEST PINS (code over inventory / brief):
//
//   1. ALL FIVE COMPONENTS HAVE REAL modern AND rustic ENGINES. Unlike CK-B
//      (Cockpit/Workbench mapped rustic -> classic), every rustic.tsx here is a
//      real file on disk, so both engines of all five are asserted.
//
//   2. THE FAMILY IS NOT PORTALED. `createPortal` appears nowhere in
//      patterns/navigation; both dialogs use position:fixed and stay DOM
//      descendants of the tenant-scoped root. The stamps are therefore reachable
//      by ordinary descendant selectors from the scope class -- no portal-root
//      escape needed, none minted.
//
//   3. ENGINE ANATOMY ASYMMETRIES, preserved (not defects):
//      - command-palette: modern's "Recent" heading is NOT stamped group-label
//        (its colour rides the shared menuSectionTitleStyle spread, resolving to
//        --ds-color-text-muted, while the grouped header additionally reads
//        --ds-search-category-color). rustic's Recent heading IS group-label
//        (identical const to its group headers). So group-label count differs by
//        engine and that is honest.
//      - shortcuts-overlay / workspace-switcher: rustic paints title / meta /
//        description / user-email via inline colour tokens (so they carry
//        data-part), while modern paints them via Tailwind utilities (no counted
//        paint, no stamp). Those parts are asserted rustic-only.
// ---------------------------------------------------------------------------

const noop = () => undefined;

/** Every `data-part` present in the container, after the root has mounted. */
async function partsOf(container: HTMLElement): Promise<Set<string>> {
  await waitFor(() => {
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
  });
  return new Set(
    Array.from(container.querySelectorAll('[data-part]')).map(
      (el) => el.getAttribute('data-part') as string,
    ),
  );
}

function partCount(container: HTMLElement, part: string): number {
  return container.querySelectorAll(`[data-part="${part}"]`).length;
}

/** Open a self-managed dropdown/menu by clicking its trigger and waiting for the panel. */
async function openPanel(container: HTMLElement, triggerTestId: string): Promise<void> {
  const trigger = container.querySelector(`[data-testid="${triggerTestId}"]`);
  expect(trigger, `trigger [data-testid="${triggerTestId}"] must exist`).not.toBeNull();
  fireEvent.click(trigger as Element);
  await waitFor(() => {
    expect(container.querySelector('[data-part="panel"]')).not.toBeNull();
  });
}

const ENGINES = ['modern', 'rustic'] as const;

// ===========================================================================
// command-palette
// ===========================================================================
const CMD_ITEMS: CommandItem[] = [
  { id: 'deploy', label: 'Deploy', description: 'Ship the build', group: 'Actions', shortcut: 'D', onSelect: noop },
  { id: 'rollback', label: 'Rollback', group: 'Actions', shortcut: 'R', onSelect: noop },
];
const CMD_RECENT: CommandItem[] = [
  { id: 'recent-search', label: 'Recent Search', description: 'last query', shortcut: 'S', onSelect: noop },
];

describe('command-palette -- data-part contract (CK-G)', () => {
  it.each(ENGINES)('stamps every part + the activeIndex discriminator (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternCommandPalette
        open
        onOpenChange={noop}
        items={CMD_ITEMS}
        recentItems={CMD_RECENT}
        footer={<span>press esc to close</span>}
      />,
      engine,
    );
    const parts = await partsOf(container);

    const expectedParts = ['root', 'backdrop', 'dialog', 'search', 'item', 'description', 'shortcut', 'group-label', 'footer'];
    if (engine === 'rustic') expectedParts.push('input');
    for (const part of expectedParts) {
      expect(parts, `command-palette/${engine} must stamp data-part="${part}"`).toContain(part);
    }
    if (engine === 'modern') {
      expect(container.querySelector('[data-part="search"] input[data-part="root"]')).not.toBeNull();
    }

    // activeIndex starts at 0 -> exactly the first row across all sections is
    // keyboard-active. This is the guard a shared :hover rule must not clobber.
    expect(container.querySelectorAll('[data-part="item"][data-active="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="item"][data-active="false"]').length).toBeGreaterThanOrEqual(1);
    // Recent + two grouped rows all render one row markup.
    expect(partCount(container, 'item')).toBe(3);

    // The scope class the migration keys on, minted greenfield (command-palette
    // had no first-party class before this pre-step).
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('ds-pattern-command-palette');
    expect(root.className).toContain(`ds-engine-${engine}`);
  });

  it.each(ENGINES)('stamps the empty branch when nothing matches (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternCommandPalette open onOpenChange={noop} items={[]} />,
      engine,
    );
    const parts = await partsOf(container);
    expect(parts, `command-palette/${engine} empty branch`).toContain('empty');
  });
});

// ===========================================================================
// environment-toggle -- the hatch component, three variants
// ===========================================================================
const ENVS: EnvironmentDef[] = [
  { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
  { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
  { id: 'prod', name: 'Production', color: '#ef4444', badge: 'PROD' },
];

describe('environment-toggle -- data-part contract (CK-G)', () => {
  it.each(ENGINES)('stamps banner + banner-dot for a non-production active env (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEnvironmentToggle environments={ENVS} activeEnvironment="dev" onChange={noop} productionId="prod" />,
      engine,
    );
    const parts = await partsOf(container);
    expect(parts, `${engine} banner`).toContain('banner');
    expect(parts, `${engine} banner-dot`).toContain('banner-dot');
  });

  it.each(ENGINES)('stamps the segmented (toggle) variant with active + positional state (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEnvironmentToggle environments={ENVS} activeEnvironment="dev" onChange={noop} variant="toggle" productionId="prod" />,
      engine,
    );
    await partsOf(container);

    const toggle = container.querySelector('[data-part="toggle"]') as HTMLElement;
    expect(toggle.getAttribute('data-variant')).toBe('toggle');
    expect(container.querySelectorAll('[data-part="option"][data-active="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="option"][data-active="false"]')).toHaveLength(2);
    // Engine asymmetry, preserved: modern's segmented buttons carry per-button
    // border-radius selected by position (first/middle/last), so they are
    // stamped data-position; rustic shares the radius via the container's
    // overflow:hidden and its buttons have NO border-radius, hence no
    // data-position. The migration must not invent one for rustic.
    if (engine === 'modern') {
      expect(container.querySelector('[data-part="option"][data-position="first"]')).not.toBeNull();
      expect(container.querySelector('[data-part="option"][data-position="middle"]')).not.toBeNull();
      expect(container.querySelector('[data-part="option"][data-position="last"]')).not.toBeNull();
    } else {
      expect(container.querySelector('[data-part="option"][data-position]')).toBeNull();
    }
  });

  it.each(ENGINES)('stamps the pills variant (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEnvironmentToggle environments={ENVS} activeEnvironment="dev" onChange={noop} variant="pills" productionId="prod" />,
      engine,
    );
    await partsOf(container);
    const toggle = container.querySelector('[data-part="toggle"]') as HTMLElement;
    expect(toggle.getAttribute('data-variant')).toBe('pills');
    expect(container.querySelectorAll('[data-part="option"][data-active="true"]')).toHaveLength(1);
  });

  it.each(ENGINES)('stamps the dropdown variant + its panel/dot/badge/check on open (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEnvironmentToggle environments={ENVS} activeEnvironment="dev" onChange={noop} variant="dropdown" productionId="prod" />,
      engine,
    );
    await partsOf(container);
    await openPanel(container, 'env-toggle-trigger');
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part') as string),
    );
    for (const part of ['toggle', 'trigger', 'dot', 'badge', 'panel', 'option', 'check']) {
      expect(parts, `env-toggle/${engine} dropdown must stamp data-part="${part}"`).toContain(part);
    }
    // The active env's option carries the check + data-active="true".
    expect(container.querySelectorAll('[data-part="option"][data-active="true"]')).toHaveLength(1);
  });

  it.each(ENGINES)('stamps the production confirm modal when a guarded switch fires (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternEnvironmentToggle
        environments={ENVS}
        activeEnvironment="dev"
        onChange={noop}
        variant="dropdown"
        productionId="prod"
        confirmProductionSwitch="This affects live data. Continue?"
      />,
      engine,
    );
    await partsOf(container);
    await openPanel(container, 'env-toggle-trigger');
    fireEvent.click(container.querySelector('[data-testid="env-option-prod"]') as Element);

    if (engine === 'modern') {
      // ConfirmDialog owns a portaled, native top-layer contract in Modern.
      await waitFor(() => {
        expect(document.querySelector('[data-part="surface"][role="alertdialog"]')).not.toBeNull();
      });
      expect(document.querySelector('[data-part="backdrop"][data-overlay-kind="modal"]')).not.toBeNull();
      expect(document.querySelector('[data-part="action"][data-action="cancel"]')).not.toBeNull();
      expect(document.querySelector('[data-part="action"][data-action="confirm"]')).not.toBeNull();
    } else {
      await waitFor(() => {
        expect(container.querySelector('[data-part="confirm-dialog"]')).not.toBeNull();
      });
      const parts = new Set(
        Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part') as string),
      );
      for (const part of ['confirm-dialog', 'confirm-cancel', 'confirm-submit']) {
        expect(parts, `env-toggle/${engine} confirm must stamp data-part="${part}"`).toContain(part);
      }
      expect(parts).toContain('confirm-overlay');
      expect(parts).toContain('confirm-message');
    }
  });
});

// ===========================================================================
// workspace-switcher
// ===========================================================================
const WORKSPACES: Workspace[] = [
  { id: 'w1', name: 'Acme Corp', role: 'Admin', plan: 'pro', online: 3, unreadCount: 5 },
  { id: 'w2', name: 'Beta LLC', role: 'Member' },
];

describe('workspace-switcher -- data-part contract (CK-G)', () => {
  it.each(ENGINES)('stamps every part + active/focused state on open (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternWorkspaceSwitcher
        workspaces={WORKSPACES}
        activeWorkspaceId="w1"
        onSwitch={noop}
        onCreate={noop}
        onSettings={noop}
        currentUser={{ name: 'Jane Doe', email: 'jane@example.com' }}
        position="sidebar"
      />,
      engine,
    );
    await partsOf(container);
    await openPanel(container, 'workspace-trigger');
    if (engine === 'modern') {
      await waitFor(() => {
        expect(container.querySelector('[data-part="badge"]')).not.toBeNull();
      });
    }

    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part') as string),
    );
    const common = ['root', 'trigger', 'panel', 'header', 'item', 'check', 'online-dot', 'badge', 'settings', 'divider', 'create'];
    for (const part of common) {
      expect(parts, `workspace-switcher/${engine} must stamp data-part="${part}"`).toContain(part);
    }

    // Active vs inactive row, and the keyboard/hover focus discriminator that
    // must coexist with active selection.
    expect(container.querySelectorAll('[data-part="item"][data-active="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="item"][data-active="false"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="item"][data-focused="false"]')).toHaveLength(2);
    fireEvent.mouseEnter(container.querySelector('[data-testid="workspace-item-w2"]') as Element);
    await waitFor(() => {
      expect(container.querySelector('[data-part="item"][data-focused="true"]')).not.toBeNull();
    });

    // Engine asymmetry: Modern composes Avatar (root + fallback) inside an
    // owned avatar-frame; Rustic remains on its frozen bespoke avatar part.
    if (engine === 'modern') {
      expect(parts).toContain('avatar-frame');
      expect(parts).toContain('fallback');
    } else {
      expect(parts).toContain('avatar');
      expect(parts).toContain('meta');
      expect(parts).toContain('user-email');
    }
  });
});

// ===========================================================================
// shortcuts-overlay -- 100% static, no interaction paint
// ===========================================================================
const SHORTCUTS: ShortcutDisplayItem[] = [
  { key: 'ctrl+s', description: 'Save', category: 'File' },
  { key: 'ctrl+shift+z', description: 'Redo', category: 'Edit' },
];

describe('shortcuts-overlay -- data-part contract (CK-G)', () => {
  it.each(ENGINES)('stamps every part it renders (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternShortcutsOverlay open onOpenChange={noop} shortcuts={SHORTCUTS} footer={<span>tip</span>} />,
      engine,
    );
    await partsOf(container);
    if (engine === 'modern') {
      await waitFor(() => {
        expect(container.querySelector('[data-part="category-label"]')).not.toBeNull();
      });
    }
    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part') as string),
    );

    const expectedParts = ['root', 'backdrop', 'dialog', 'header', 'close', 'search', 'category-label', 'item', 'kbd', 'footer'];
    if (engine === 'rustic') expectedParts.push('input');
    for (const part of expectedParts) {
      expect(parts, `shortcuts-overlay/${engine} must stamp data-part="${part}"`).toContain(part);
    }
    if (engine === 'modern') {
      expect(container.querySelector('[data-part="search"] input[data-part="root"]')).not.toBeNull();
    }
    // Two categories -> two labels; two shortcut rows.
    expect(partCount(container, 'category-label')).toBe(2);
    expect(partCount(container, 'item')).toBe(2);

    // rustic paints title + row description via inline colour tokens; modern via
    // Tailwind (no stamp). Pinned as a preserved asymmetry.
    if (engine === 'rustic') {
      expect(parts).toContain('title');
      expect(parts).toContain('description');
    }
  });

  it.each(ENGINES)('stamps the empty branch when there are no shortcuts (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternShortcutsOverlay open onOpenChange={noop} shortcuts={[]} />,
      engine,
    );
    const parts = await partsOf(container);
    expect(parts, `shortcuts-overlay/${engine} empty branch`).toContain('empty');
  });
});

// ===========================================================================
// locale-switcher -- the one component that already carried a scope class
// ===========================================================================
describe('locale-switcher -- data-part contract (CK-G)', () => {
  it.each(ENGINES)('stamps every part + active/focused state on open (%s)', async (engine) => {
    const { container } = renderWithEngine(
      <PatternLocaleSwitcher locale="en" onChange={noop} locales={DEFAULT_LOCALES} />,
      engine,
    );
    await partsOf(container);
    await openPanel(container, 'locale-switcher-trigger');

    const parts = new Set(
      Array.from(container.querySelectorAll('[data-part]')).map((el) => el.getAttribute('data-part') as string),
    );
    for (const part of ['root', 'trigger', 'panel', 'option', 'check']) {
      expect(parts, `locale-switcher/${engine} must stamp data-part="${part}"`).toContain(part);
    }

    // The active locale ('en') carries data-active="true" + the check; all
    // others are false. focusIndex starts -1, so every option is data-focused
    // ="false" until a pointer enters one.
    expect(container.querySelectorAll('[data-part="option"][data-active="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part="option"][data-focused="false"]').length).toBe(DEFAULT_LOCALES.length);
    fireEvent.mouseEnter(container.querySelector('[data-testid="locale-option-es"]') as Element);
    await waitFor(() => {
      expect(container.querySelector('[data-part="option"][data-focused="true"]')).not.toBeNull();
    });

    // Both engines already carried ds-pattern-locale-switcher + ds-engine-<engine>
    // in source -- the pre-step keeps them as the skin anchor (no rottay-* mint).
    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('ds-pattern-locale-switcher');
    expect(root.className).toContain(`ds-engine-${engine}`);
  });
});
