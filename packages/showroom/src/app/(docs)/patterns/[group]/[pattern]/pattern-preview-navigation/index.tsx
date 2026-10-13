'use client';

import { useState } from 'react';
import {
  PatternCommandPalette,
  PatternEnvironmentToggle,
  PatternLocaleSwitcher,
  PatternShortcutsOverlay,
  PatternWorkspaceSwitcher,
} from '@rottay/design-system';

export function EnvironmentTogglePreview() {
  const [activeEnvironment, setActiveEnvironment] = useState('staging');

  return (
    <PatternEnvironmentToggle
      environments={[
        { id: 'dev', name: 'Development', color: '#3b82f6', badge: 'DEV' },
        { id: 'staging', name: 'Staging', color: '#f59e0b', badge: 'STG' },
        { id: 'prod', name: 'Production', color: '#22c55e' },
      ]}
      activeEnvironment={activeEnvironment}
      onChange={setActiveEnvironment}
      showBanner={false}
      productionId="prod"
      variant="pills"
    />
  );
}

export function LocaleSwitcherPreview() {
  const [locale, setLocale] = useState('en');

  return (
    <PatternLocaleSwitcher
      locale={locale}
      onChange={setLocale}
      locales={[
        { code: 'es', label: 'Espanol', flag: 'ES' },
        { code: 'en', label: 'English', flag: 'EN' },
        { code: 'pt', label: 'Portugues', flag: 'PT' },
      ]}
      showLabel
    />
  );
}

export function WorkspaceSwitcherPreview() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws-1');

  return (
    <PatternWorkspaceSwitcher
      workspaces={[
        {
          id: 'ws-1',
          name: 'Rottay Shell',
          role: 'Admin',
          plan: 'enterprise',
          unreadCount: 5,
          online: 23,
        },
        {
          id: 'ws-2',
          name: 'BitHire Ops',
          role: 'Member',
          plan: 'pro',
          unreadCount: 1,
          online: 8,
        },
        {
          id: 'ws-3',
          name: 'Evnto Growth',
          role: 'Owner',
          plan: 'starter',
          unreadCount: 0,
          online: 3,
        },
      ]}
      activeWorkspaceId={activeWorkspaceId}
      onSwitch={setActiveWorkspaceId}
      onCreate={() => undefined}
      onSettings={() => undefined}
      currentUser={{ name: 'Daniel Avila', email: 'daniel@rottay.com' }}
      position="header"
    />
  );
}

export function CommandPalettePreview() {
  return (
    <PatternCommandPalette
      open
      onOpenChange={() => undefined}
      placeholder="Jump to a surface or action"
      items={[
        { id: 'cmd-1', label: 'Open dashboard', group: 'Navigation', onSelect: () => undefined },
        { id: 'cmd-2', label: 'Review approvals', group: 'Actions', onSelect: () => undefined },
      ]}
      recentItems={[
        { id: 'recent-1', label: 'Create event', group: 'Recent', onSelect: () => undefined },
      ]}
    />
  );
}

export function ShortcutsOverlayPreview() {
  return (
    <PatternShortcutsOverlay
      open
      onOpenChange={() => undefined}
      title="Keyboard shortcuts"
      shortcuts={[
        { key: 'ctrl+k', description: 'Open command palette', category: 'Global' },
        { key: 'shift+?', description: 'Show keyboard shortcuts', category: 'Global' },
        { key: 'g+d', description: 'Go to dashboard', category: 'Navigation' },
        { key: 'c', description: 'Create item', category: 'Actions' },
      ]}
      footer="Press Esc to close"
    />
  );
}
