'use client';

import { type CSSProperties } from 'react';
import {
  Box,
  DEFAULT_LOCALES,
  PatternCommandPalette,
  PatternEnvironmentToggle,
  PatternLocaleSwitcher,
  PatternShortcutsOverlay,
  PatternWorkspaceSwitcher,
  Stack,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-G -- patterns/navigation family torture section (?navigation=1).
//
// Distinct from the WO-SKIN-04 PRIMITIVES navigation family (?nav=1 /
// probe-nav): this is the five PATTERNS (command-palette, environment-toggle,
// workspace-switcher, shortcuts-overlay, locale-switcher).
//
// The two position:fixed overlays (command-palette, shortcuts-overlay) are
// wrapped in a transform'd ancestor so their fixed position resolves to the
// band instead of the viewport -- a CSS containing-block trick that changes
// ONLY where they sit, never their paint, and lives here in the showroom, never
// in a component. Both render `open`. command-palette carries recent + grouped
// items so BOTH duplicated result sections and a group-label render, and so the
// spec has a keyboard-active row (activeIndex 0) to hover a DIFFERENT row
// against (the guard). The two absolute-dropdown switchers render at rest --
// their `open` is internal state, and per the inventory both are 100%
// STATE-SELECTED with zero imperative writes, so the imperative-write risk the
// visual pins exist to catch lives entirely in command-palette.
// ---------------------------------------------------------------------------

const NAV_ENVIRONMENTS = [
  { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
  { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
  { id: 'prod', name: 'Production', color: '#ef4444', badge: 'PROD' },
];

const NAV_COMMAND_ITEMS = [
  {
    id: 'nav-dashboard',
    label: 'Open dashboard',
    description: 'Jump to the control plane',
    group: 'Navigation',
    shortcut: 'G D',
    onSelect: () => undefined,
  },
  {
    id: 'nav-approvals',
    label: 'Review approvals',
    description: 'Pending sign-offs',
    group: 'Actions',
    shortcut: 'A',
    onSelect: () => undefined,
  },
];

const NAV_COMMAND_RECENT = [
  {
    id: 'nav-recent',
    label: 'Create event',
    description: 'Last used',
    shortcut: 'C',
    onSelect: () => undefined,
  },
];

const NAV_SHORTCUTS = [
  { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
  {
    key: 'shift+?',
    description: 'Show keyboard shortcuts',
    category: 'Global',
  },
  { key: 'g d', description: 'Go to dashboard', category: 'Navigation' },
];

const NAV_WORKSPACES = [
  {
    id: 'ws-1',
    name: 'Rottay Shell',
    role: 'Admin',
    plan: 'enterprise',
    unreadCount: 5,
    online: 23,
  },
  { id: 'ws-2', name: 'BitHire Ops', role: 'Member', plan: 'pro' },
];

const NAV_OVERLAY_BAND: CSSProperties = {
  position: 'relative',
  transform: 'translateZ(0)',
  height: 520,
  overflow: 'hidden',
  borderRadius: 12,
  border: '1px solid var(--ds-color-border)',
};

export function NavigationPatternsFbStates() {
  return (
    <Box
      data-testid="probe-navigation-patterns"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-navigation-patterns-command-palette">
          <Box style={NAV_OVERLAY_BAND}>
            <PatternCommandPalette
              open
              onOpenChange={() => undefined}
              placeholder="Jump to a surface or action"
              items={NAV_COMMAND_ITEMS}
              recentItems={NAV_COMMAND_RECENT}
              footer="Press Esc to close"
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-shortcuts-overlay">
          <Box style={NAV_OVERLAY_BAND}>
            <PatternShortcutsOverlay
              open
              onOpenChange={() => undefined}
              title="Keyboard shortcuts"
              shortcuts={NAV_SHORTCUTS}
              footer="Press Esc to close"
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-environment-toggle">
          <PatternEnvironmentToggle
            environments={NAV_ENVIRONMENTS}
            activeEnvironment="staging"
            onChange={() => undefined}
            productionId="prod"
            variant="toggle"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-workspace-switcher">
          <PatternWorkspaceSwitcher
            workspaces={NAV_WORKSPACES}
            activeWorkspaceId="ws-1"
            onSwitch={() => undefined}
            onCreate={() => undefined}
            onSettings={() => undefined}
            currentUser={{ name: 'Jane Doe', email: 'jane@rottay.com' }}
            position="sidebar"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-navigation-patterns-locale-switcher">
          <PatternLocaleSwitcher locale="en" onChange={() => undefined} locales={DEFAULT_LOCALES} showLabel />
        </Stack>
      </Stack>
    </Box>
  );
}
