/**
 * Sidebar - All Presets
 */

import type { SidebarPreset, SidebarProps } from '../core';
import type { ComponentType } from 'react';
import { SlimSidebar } from './slim';
import { StandardSidebar } from './standard';
import { CollapsibleSidebar } from './collapsible';

export { SlimSidebar } from './slim';
export { StandardSidebar } from './standard';
export { CollapsibleSidebar } from './collapsible';

export const SIDEBAR_PRESETS: Record<SidebarPreset, ComponentType<SidebarProps>> = {
  slim: SlimSidebar,
  standard: StandardSidebar,
  collapsible: CollapsibleSidebar,
};
