'use client';

/* Structure probe: each family renders under three engine scopes with
   identical props, so engine is the only variable the browser can observe. */

import type { ReactNode } from 'react';
import { EngineProvider } from '@rottay/design-system';
import {
  ActionDock,
  ActiveFiltersBar,
  ActivityCards,
  ActivityCompact,
  ActivityTicker,
  ActivityTimeline,
  AppShell,
  BottomTabBar,
  CollectionHeader,
  ColumnMenu,
  ConnectedCommandPalette,
  DashboardHeader,
  DataTerminalCard,
  DetailHeader,
  EditHeader,
  ExportButton,
  FieldFiltersPanel,
  FormHeader,
  FormSections,
  InlineEditControl,
  InlineEditField,
  InlineEditFooter,
  InlineEditGrid,
  InlineEditSection,
  InlineEditor,
  InlineEditorGroup,
  LoadingOverlay,
  MetricsCards,
  MetricsChart,
  MetricsMinimal,
  MetricsRows,
  MobileHeader,
  MoreFieldsToggle,
  RecordActionBar,
  RecordField,
  RecordFieldGrid,
  RecordPanel,
  RecordSummaryStrip,
  SavedViewsMenu,
  ScopeSwitcher,
  SearchCommandBar,
  SelectionPreviewRail,
  StatsHeader,
  TableToolbar,
  ViewModeSwitcher
} from '@rottay/design-system';
import type { StructureCase } from './cases';

const ENGINES = ['modern', 'classic', 'rustic'] as const;

function Family({ only }: { only: StructureCase }): ReactNode {
  switch (only) {
    case 'collection-header':
      return <CollectionHeader eyebrow="Reviewers" title="Reviewers" subtitle="Manage reviewer assignments" />;
    case 'dashboard-header':
      return <DashboardHeader title="Overview" />;
    case 'detail-header':
      return <DetailHeader title="Candidate profile" backHref="/candidates" />;
    case 'edit-header':
      return <EditHeader title="Edit reviewer" backHref="/reviewers" />;
    case 'form-header':
      return <FormHeader icon={(props: any) => null} title="New reviewer" backHref="/reviewers" />;
    case 'mobile-header':
      return <MobileHeader  />;
    case 'action-dock':
      return <ActionDock  />;
    case 'active-filters-bar':
      return <ActiveFiltersBar activeFilters={[{ key: 'status', label: 'Status', value: 'Active' }]} onRemoveFilter={() => undefined} onClearAll={() => undefined} />;
    case 'column-menu':
      return <ColumnMenu columns={[{ key: 'name', title: 'Name' }, { key: 'status', title: 'Status' }]} visibleColumns={['name', 'status']} onColumnsChange={() => undefined} onReset={() => undefined} />;
    case 'connected-command-palette':
      return <ConnectedCommandPalette  />;
    case 'search-command-bar':
      return <SearchCommandBar command={{ placeholder: 'Search reviewers', value: '', onSearch: () => undefined }} />;
    case 'export-button':
      return <ExportButton data={[{ name: 'Alpha' }, { name: 'Beta' }]} columns={[{ key: 'name', header: 'Name' }]} />;
    case 'field-filters-panel':
      return <FieldFiltersPanel filters={[{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }] }]} values={{ status: 'active' }} onChange={() => undefined} />;
    case 'saved-views-menu':
      return <SavedViewsMenu views={[{ key: 'all', label: 'All reviewers', state: {} }]} activeViewKey="all" onViewSelect={() => undefined} />;
    case 'scope-switcher':
      return <ScopeSwitcher scopes={[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active', count: 3 }]} activeScope="all" onScopeChange={() => undefined} />;
    case 'selection-preview-rail':
      return <SelectionPreviewRail item={{ id: '1', fullName: 'Jordan Rivers', status: 'active' }} itemKey="1" itemIndex={0} columns={[{ key: 'status', title: 'Status' }]} onClose={() => undefined} mode="selection" />;
    case 'table-toolbar':
      return <TableToolbar  />;
    case 'view-mode-switcher':
      return <ViewModeSwitcher modes={[{ key: 'table', icon: <span />, label: 'Table view' }, { key: 'kanban', icon: <span />, label: 'Kanban view' }]} value="table" onChange={() => undefined} />;
    case 'record-content':
      return (
        <>
          <div data-export="RecordSummaryStrip"><RecordSummaryStrip items={[{ label: 'Status', value: 'Active' }]} /></div>
          <div data-export="RecordFieldGrid"><RecordFieldGrid children={"Grid"} /></div>
          <div data-export="RecordField"><RecordField label="Employer" value="Acme Corp" /></div>
          <div data-export="RecordActionBar"><RecordActionBar  /></div>
          <div data-export="RecordPanel"><RecordPanel children={"Panel"} /></div>
        </>
      );
    case 'form-sections':
      return <FormSections sections={[{ key: 's1', title: 'Contact details', children: 'Section content' }]} />;
    case 'edit-fields':
      return (
        <>
          <div data-export="InlineEditorGroup"><InlineEditorGroup children={"Group"} /></div>
          <div data-export="InlineEditor"><InlineEditor children={"Field content"} title="Profile" /></div>
          <div data-export="InlineEditGrid"><InlineEditGrid children={"Grid"} /></div>
          <div data-export="InlineEditSection"><InlineEditSection children={"Sec"} title="Section" /></div>
          <div data-export="InlineEditControl"><InlineEditControl children={"Ctl"} /></div>
          <div data-export="InlineEditField"><InlineEditField children={"F"} label="Label" /></div>
          <div data-export="MoreFieldsToggle"><MoreFieldsToggle expanded={true} onToggle={() => undefined} /></div>
          <div data-export="InlineEditFooter"><InlineEditFooter  /></div>
        </>
      );
    case 'stats-header':
      return <StatsHeader stats={[{ key: 'total', label: 'Total reviewers', value: 42, change: 8, changeType: 'increase', periodLabel: 'this week' }]} />;
    case 'data-terminal-card':
      return <DataTerminalCard label="Active reviews" value={42} icon={(props: any) => null} path="/reviews" variant={1} />;
    case 'dashboard-insights':
      return (
        <>
          <div data-export="MetricsRows"><MetricsRows metrics={[{ label: 'Open reviews', value: '12', change: '+2', positive: true, icon: (() => null) as never }]} /></div>
          <div data-export="MetricsCards"><MetricsCards metrics={[{ label: 'Open reviews', value: '12', change: '+2', positive: true, icon: (() => null) as never }]} /></div>
          <div data-export="MetricsMinimal"><MetricsMinimal metrics={[{ label: 'Open reviews', value: '12', change: '+2', positive: true, icon: (() => null) as never }]} /></div>
          <div data-export="MetricsChart"><MetricsChart metrics={[{ label: 'Open reviews', value: '12', change: '+2', positive: true, icon: (() => null) as never }]} /></div>
          <div data-export="ActivityTimeline"><ActivityTimeline items={[{ text: 'Review closed', time: '2m', type: 'success' as const }]} /></div>
          <div data-export="ActivityCompact"><ActivityCompact items={[{ text: 'Review closed', time: '2m', type: 'success' as const }]} /></div>
          <div data-export="ActivityCards"><ActivityCards items={[{ text: 'Review closed', time: '2m', type: 'success' as const }]} /></div>
          <div data-export="ActivityTicker"><ActivityTicker items={[{ text: 'Review closed', time: '2m', type: 'success' as const }]} /></div>
        </>
      );
    case 'loading-overlay':
      return <LoadingOverlay visible={true} />;
    case 'app-shell':
      return <AppShell children="Page content" />;
    case 'bottom-tab-bar':
      return <BottomTabBar items={[{ key: 'home', label: 'Home', icon: <span /> }, { key: 'search', label: 'Search', icon: <span /> }, { key: 'profile', label: 'Profile', icon: <span />, badge: 3 }]} />;
    default:
      return null;
  }
}

/** One family, rendered under all three engines with identical props. */
export function StructureScene({ only }: { only: StructureCase }) {
  return (
    <div data-testid="lab-scene">
      <div data-testid={`lab-struct-${only}`}>
        {ENGINES.map((engine) => (
          <div key={engine} data-engine-band={engine}>
            <EngineProvider defaultEngine={engine}>
              <Family only={only} />
            </EngineProvider>
          </div>
        ))}
      </div>
      <p data-testid="lab-struct-readout">{`family: ${only} / engines: ${ENGINES.join(',')}`}</p>
    </div>
  );
}
