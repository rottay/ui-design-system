import type { SettingsPagePreset } from '../core';

import sidebarNav from './sidebar-nav';
import tabbed from './tabbed';

export const PRESETS: Record<SettingsPagePreset, any> = {
  'sidebar-nav': sidebarNav,
  tabbed,
};
