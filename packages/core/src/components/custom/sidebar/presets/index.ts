/**
 * Sidebar - All Presets
 */

import type { SidebarPreset } from '../core';
import { SlimSidebar } from './slim';
import { StandardSidebar } from './standard';
import { CollapsibleSidebar } from './collapsible';

export { SlimSidebar } from './slim';
export { StandardSidebar } from './standard';
export { CollapsibleSidebar } from './collapsible';

export const SIDEBAR_PRESETS: Record<SidebarPreset, React.ComponentType<any>> = {
  slim: SlimSidebar,
  standard: StandardSidebar,
  collapsible: CollapsibleSidebar,
};
