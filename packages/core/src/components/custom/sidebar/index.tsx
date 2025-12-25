/**
 * Sidebar - Main Export
 * Automatically selects preset based on props
 */

// import React from 'react';
import type { SidebarProps } from './core';
import { SIDEBAR_DEFAULTS } from './core';
import { SIDEBAR_PRESETS } from './presets';

export { type SidebarProps, type SidebarPreset, type SidebarItem, SIDEBAR_DEFAULTS } from './core';
export * from './presets';

/**
 * Sidebar component
 * Renders the appropriate preset based on the preset prop
 */
export function Sidebar(props: SidebarProps): React.ReactElement {
  const preset = props.preset ?? SIDEBAR_DEFAULTS.preset ?? 'standard';
  const PresetComponent = SIDEBAR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

Sidebar.displayName = 'Sidebar';

// Also export individual presets as named exports for direct use
export { SlimSidebar, StandardSidebar, CollapsibleSidebar } from './presets';
