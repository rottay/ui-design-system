/**
 * Composed Components
 */

// Factory
export { createPreset, createPresets } from './factory';
export type { PresetConfig, PresetContext } from './factory';

// AuthLayout
export { AuthLayout } from './auth-layout';
export type { AuthLayoutProps, AuthLayoutPreset } from './auth-layout';
export {
  MinimalAuthLayout,
  StandardAuthLayout,
  BrandedAuthLayout,
  SocialAuthLayout,
  EnterpriseAuthLayout
} from './auth-layout';

// DashboardCard
export { DashboardCard } from './dashboard-card';
export type { DashboardCardProps, DashboardCardPreset, TrendDirection } from './dashboard-card';
export { CompactDashboardCard, TrendingDashboardCard, ChartDashboardCard, DetailedDashboardCard } from './dashboard-card';

// DataTable
export { DataTable } from './data-table';
export type { DataTableProps, DataTablePreset, DataTableColumn } from './data-table';
export { SimpleDataTable, SearchableDataTable, SelectableDataTable, FullDataTable } from './data-table';

// SearchBar
export { SearchBar } from './search-bar';
export type { SearchBarProps, SearchBarPreset, SearchSuggestion } from './search-bar';
export { BasicSearchBar, SuggestionsSearchBar, CommandSearchBar } from './search-bar';

// UserMenu
export { UserMenu } from './user-menu';
export type { UserMenuProps, UserMenuPreset, UserMenuItem } from './user-menu';
export { AvatarUserMenu, NamedUserMenu, DetailedUserMenu } from './user-menu';

// Sidebar
export { Sidebar } from './sidebar';
export type { SidebarProps, SidebarPreset, SidebarItem } from './sidebar';
export { SlimSidebar, StandardSidebar, CollapsibleSidebar } from './sidebar';
