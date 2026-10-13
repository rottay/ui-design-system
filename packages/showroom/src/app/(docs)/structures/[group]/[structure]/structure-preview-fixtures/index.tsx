'use client';

import { type ReactNode } from 'react';

import {
  CollectionHeaderPreview,
  DashboardHeaderPreview,
  DetailHeaderPreview,
  EditHeaderPreview,
  FormHeaderPreview,
  MobileHeaderPreview,
  HeaderSurfacePreview,
  SectionFramePreview,
} from './headers';
import {
  SearchCommandBarPreview,
  TableToolbarPreview,
  ActiveFiltersBarPreview,
  ViewModeSwitcherPreview,
  ExportButtonPreview,
  ColumnMenuPreview,
  FieldFiltersPanelPreview,
  SavedViewsMenuPreview,
  ScopeSwitcherPreview,
  SelectionPreviewRailPreview,
  ActionDockPreview,
  ConnectedCommandPalettePreview,
} from './workspace';
import {
  RecordSummaryStripPreview,
  RecordFieldPreview,
  RecordFieldGridPreview,
  RecordPanelPreview,
  RecordActionBarPreview,
  FormSectionsPreview,
  EditFieldsPreview,
} from './record';
import {
  StatsHeaderPreview,
  DataTerminalCardPreview,
  DashboardInsightsFamilyPreview,
} from './dashboard';
import {
  LoadingOverlayPreview,
  SurfaceLifecyclePreview,
  SurfaceCapabilityAnatomyPreview,
} from './feedback';
import {
  BottomTabBarPreview,
  PageShellSurfacePreview,
  AppShellPreview,
  SidebarSurfacePreview,
  SurfaceChromePreview,
  WorkspaceShellPreview,
} from './shell';

export const STRUCTURE_PREVIEWS: Record<string, ReactNode> = {
  'mobile-header': <MobileHeaderPreview />,
  'collection-header': <CollectionHeaderPreview />,
  'dashboard-header': <DashboardHeaderPreview />,
  'detail-header': <DetailHeaderPreview />,
  'edit-header': <EditHeaderPreview />,
  'form-header': <FormHeaderPreview />,
  'header-surface': <HeaderSurfacePreview />,
  'section-frame': <SectionFramePreview />,
  'active-filters-bar': <ActiveFiltersBarPreview />,
  'action-dock': <ActionDockPreview />,
  'column-menu': <ColumnMenuPreview />,
  'connected-command-palette': <ConnectedCommandPalettePreview />,
  'export-button': <ExportButtonPreview />,
  'field-filters-panel': <FieldFiltersPanelPreview />,
  'saved-views-menu': <SavedViewsMenuPreview />,
  'scope-switcher': <ScopeSwitcherPreview />,
  'search-command-bar': <SearchCommandBarPreview />,
  'selection-preview-rail': <SelectionPreviewRailPreview />,
  'table-toolbar': <TableToolbarPreview />,
  'view-mode-switcher': <ViewModeSwitcherPreview />,
  'record-summary-strip': <RecordSummaryStripPreview />,
  'record-field': <RecordFieldPreview />,
  'record-field-grid': <RecordFieldGridPreview />,
  'record-panel': <RecordPanelPreview />,
  'record-action-bar': <RecordActionBarPreview />,
  'form-sections': <FormSectionsPreview />,
  'edit-fields': <EditFieldsPreview />,
  'stats-header': <StatsHeaderPreview />,
  'data-terminal-card': <DataTerminalCardPreview />,
  'dashboard-insights': <DashboardInsightsFamilyPreview />,
  'capability-anatomy': <SurfaceCapabilityAnatomyPreview />,
  'loading-overlay': <LoadingOverlayPreview />,
  'surface-lifecycle': <SurfaceLifecyclePreview />,
  'app-shell': <AppShellPreview />,
  'bottom-tab-bar': <BottomTabBarPreview />,
  'page-shell-surface': <PageShellSurfacePreview />,
  'sidebar-surface': <SidebarSurfacePreview />,
  'surface-chrome': <SurfaceChromePreview />,
  'workspace-shell': <WorkspaceShellPreview />,
};
