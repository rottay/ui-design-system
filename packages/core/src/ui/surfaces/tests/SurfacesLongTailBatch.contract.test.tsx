import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockMatchMedia } from '../../../tooling/testing/helpers/browser/match-media';
import { renderSurface } from '../foundation/common/test-utils';
import { SurfaceAccentBar } from '../runtime/profile-defaults/personality';
import {
  SurfaceActionBar,
  SurfaceSectionCard,
  SurfaceTabbedLabel,
} from '../runtime/helpers/rendering';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingState,
  SurfaceEmptyStateCard,
  SurfaceErrorStateCard,
  SurfaceLoadingSkeleton,
  SurfaceOfflineBanner,
  SurfaceStaleBanner,
} from '../runtime/helpers/states';
import { WorkspaceShell } from '../composition/layout/collection-shell';
import { HeaderSurface } from '../composition/layout/page-shell/header';
import { SidebarSurface } from '../composition/layout/sidebar';
import { AuditSurface } from '../presentation/pages/admin/audit';
import { BillingSurface } from '../presentation/pages/admin/billing';
import { ImportExportSurface } from '../presentation/pages/admin/import-export';
import { IntegrationSurface } from '../presentation/pages/admin/integration';
import { ProfileSurface } from '../presentation/pages/admin/profile';
import { SettingsSurface } from '../presentation/pages/admin/settings';
import { TeamSurface } from '../presentation/pages/admin/team';
import { CompareSurface } from '../presentation/pages/data/compare';
import { DashboardSurface } from '../presentation/pages/data/dashboard';
import { ListSurface } from '../presentation/pages/data/list';
import { ReportSurface } from '../presentation/pages/data/report';
import { SearchSurface } from '../presentation/pages/data/search';
import { VisualizationSurface } from '../presentation/pages/data/visualization';
import { AuthSurface } from '../presentation/pages/experience/auth';
import { ChatSurface } from '../presentation/pages/experience/chat';
import { EditorSurface } from '../presentation/pages/experience/editor';
import { MarketingSurface } from '../presentation/pages/experience/marketing';
import { MediaSurface } from '../presentation/pages/experience/media';
import { NotificationSurface } from '../presentation/pages/experience/notification';
import { PricingSurface } from '../presentation/pages/experience/pricing';
import { ActivitySurface } from '../presentation/pages/operations/activity';
import { KanbanSurface } from '../presentation/pages/operations/kanban';
import { CollectionWorkspaceSurface } from '../presentation/pages/workspace/collection-workspace';
import { CollectionRenderDispatch } from '../presentation/pages/workspace/collection-workspace/render-dispatch';
import { CommandCenterSurface } from '../presentation/pages/workspace/command-center';
import { DecisionInboxSurface } from '../presentation/pages/workspace/decision-inbox';
import { RecordWorkbenchSurface } from '../presentation/pages/workspace/record-workbench';

// WO-SKIN-06 CK-I pre-migration anatomy contract (Units I-1, I-3, I-4, I-5).
//
// The 39-entry manifest is conceptual: StatsGrid's modern/rustic engine files
// are one component entry, but both engine implementations are rendered in the
// sibling PatternsLongTailBatch contract. Runtime keeps its two state files
// separate because both export independently rendered anatomy islands.
const CK_I_RENDERABLE_SOURCES = [
  'runtime/profile-defaults/personality',
  'runtime/helpers/rendering',
  'runtime/helpers/states/index',
  'runtime/helpers/states/i18n/components',
  'patterns/data/stats-grid/engines/{modern,rustic}',
  'patterns/data/gallery-view',
  'patterns/data/grid-view',
  'patterns/data/cell-renderers',
  'patterns/data/bulk-select-toggle',
  'composition/layout/collection-shell',
  'composition/layout/page-shell/header',
  'composition/layout/sidebar',
  'presentation/pages/workspace/collection-workspace',
  'presentation/pages/workspace/collection-workspace/render-dispatch',
  'presentation/pages/workspace/record-workbench',
  'presentation/pages/workspace/command-center',
  'presentation/pages/workspace/decision-inbox',
  'presentation/pages/admin/audit',
  'presentation/pages/admin/billing',
  'presentation/pages/admin/import-export',
  'presentation/pages/admin/integration',
  'presentation/pages/admin/profile',
  'presentation/pages/admin/settings',
  'presentation/pages/admin/team',
  'presentation/pages/data/compare',
  'presentation/pages/data/dashboard',
  'presentation/pages/data/list',
  'presentation/pages/data/report',
  'presentation/pages/data/search',
  'presentation/pages/data/visualization',
  'presentation/pages/experience/auth',
  'presentation/pages/experience/chat',
  'presentation/pages/experience/editor',
  'presentation/pages/experience/marketing',
  'presentation/pages/experience/media',
  'presentation/pages/experience/notification',
  'presentation/pages/experience/pricing',
  'presentation/pages/operations/activity',
  'presentation/pages/operations/kanban',
] as const;

const q = (container: HTMLElement, selector: string) => container.querySelectorAll(selector);

async function waitForSelector(container: HTMLElement, selector: string): Promise<HTMLElement> {
  await waitFor(() => expect(container.querySelector(selector)).not.toBeNull(), { timeout: 3_000 });
  return container.querySelector(selector) as HTMLElement;
}

async function waitForSelectors(container: HTMLElement, selectors: string[]): Promise<void> {
  await waitFor(() => {
    for (const selector of selectors) {
      expect(container.querySelector(selector), selector).not.toBeNull();
    }
  }, { timeout: 3_000 });
}

beforeEach(() => {
  mockMatchMedia(1280);
});

describe('CK-I source census', () => {
  it('keeps the pre-migration DOM contract tied to all 39 renderable sources', () => {
    expect(CK_I_RENDERABLE_SOURCES).toHaveLength(39);
    expect(new Set(CK_I_RENDERABLE_SOURCES).size).toBe(39);
  });
});

describe('CK-I foundation anatomy (I-1)', () => {
  it('pins every multi-export anatomy island and its selector-bearing state', async () => {
    const { container } = renderSurface(
      <div>
        <SurfaceAccentBar position="top" thickness={3} barStyle="animated" />
        <SurfaceAccentBar position="left" thickness={4} barStyle="gradient" />

        <SurfaceActionBar
          actions={[
            { id: 'enabled', label: 'Enabled', onClick: () => undefined },
            { id: 'disabled', label: 'Disabled', disabled: true, onClick: () => undefined },
          ]}
        />
        <SurfaceTabbedLabel view={{ label: 'Tab label', badge: <span>3</span> }} />
        <SurfaceSectionCard
          title="Section title"
          description="Section description"
          actions={<button type="button">Section action</button>}
        >
          Section content
        </SurfaceSectionCard>

        <SurfaceLoadingState title="Loading title" description="Loading copy" />
        <SurfaceEmptyState title="Empty title" description="Empty copy" />
        <SurfaceErrorState error="Failure" onRetry={() => undefined} />

        <SurfaceLoadingSkeleton rows={2} showHeader />
        <SurfaceEmptyStateCard
          icon="?"
          title="Nothing here"
          description="Create the first item"
          action={{ label: 'Create', onClick: () => undefined }}
        />
        <SurfaceErrorStateCard error="Broken" onRetry={() => undefined} />
        <SurfaceStaleBanner message="Stale" refreshing onRefresh={() => undefined} />
        <SurfaceStaleBanner message="Fresh enough" refreshing={false} />
        <SurfaceOfflineBanner message="Offline" showCachedNotice />
      </div>,
    );

    await waitForSelectors(container, [
      '.ds-surface.ds-accent-bar[data-part="bar"][data-position="top"][data-style="animated"]',
      '.ds-surface.ds-accent-bar[data-part="bar"][data-position="left"][data-style="gradient"]',
      '.ds-surface.ds-section-card',
      '.ds-surface.ds-loading-state',
      '.ds-surface.ds-empty-state',
      '.ds-surface.ds-error-state',
      '.ds-surface.ds-loading-skeleton[data-part="root"]',
      '.ds-surface.ds-empty-state-card',
      '.ds-surface.ds-error-state-card',
      '.ds-surface.ds-stale-banner[data-part="banner"][data-refreshing="true"]',
      '.ds-surface.ds-stale-banner[data-part="banner"][data-refreshing="false"]',
      '.ds-surface.ds-offline-banner',
    ]);

    expect(q(container, '[data-surface-action="enabled"]')).toHaveLength(1);
    expect(q(container, '[data-surface-action="disabled"]')).toHaveLength(1);
    expect(q(container, '.ds-section-card__body')).toHaveLength(1);
    expect(q(container, '[data-part="header"][data-has-actions="true"]')).toHaveLength(1);
    expect(q(container, '.ds-loading-state__skeleton')).toHaveLength(1);
    expect(q(container, '.ds-error-state__alert')).toHaveLength(1);
    expect(q(container, '.ds-error-state__retry')).toHaveLength(1);
    expect(q(container, '.ds-loading-skeleton__header-primary')).toHaveLength(1);
    expect(q(container, '.ds-loading-skeleton__header-secondary')).toHaveLength(1);
    expect(q(container, '.ds-loading-skeleton__rows')).toHaveLength(1);
    expect(q(container, '.ds-empty-state-card__action')).toHaveLength(1);
    expect(q(container, '.ds-error-state-card__retry')).toHaveLength(1);
    expect(q(container, '.ds-stale-banner__refresh')).toHaveLength(1);
  });
});

describe('CK-I layout and workspace anatomy (I-3)', () => {
  it('pins all three layout roots, responsive state and child landing hooks', async () => {
    const { container } = renderSurface(
      <div>
        <WorkspaceShell
          variant="default"
          mood="focus"
          intensity="high"
          continuity="segmented"
          fieldPattern="orbital"
          focusReaction
          previewEmphasis
          focusActive
          previewActive
        >
          Workspace content
        </WorkspaceShell>
        <HeaderSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Header' },
              description: 'Header description',
            },
            behavior: { tabs: [] },
          }}
        />
        <SidebarSurface
          config={{
            visual: { collapsible: true, bordered: false },
            presentation: {
              sidebar: <div>Navigation</div>,
              content: <div>Main</div>,
              aside: <div>Aside</div>,
            },
            behavior: { collapsed: true },
          }}
        />
      </div>,
    );

    await waitForSelectors(container, [
      '.ds-surface.ds-collection-shell[data-part="root"][data-variant="default"][data-mood="focus"][data-intensity="high"][data-continuity="segmented"][data-field-pattern="orbital"][data-focus-reaction="true"][data-preview-emphasis="true"][data-focus-active="true"][data-preview-active="true"]',
      '.ds-surface.ds-header[data-part="root"][data-loading="false"]',
      '.ds-surface.ds-sidebar[data-part="root"][data-collapsed="true"][data-stacked="false"][data-bordered="false"]',
    ]);
    expect(q(container, '.ds-collection-shell__overlay[data-part="overlay"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-shell__content[data-part="content"]')).toHaveLength(1);
    expect(q(container, '.ds-header__muted-text[data-part="muted-text"]')).toHaveLength(1);
    expect(q(container, '.ds-sidebar__panel')).toHaveLength(1);
    expect(q(container, '.ds-sidebar__toggle[data-collapsed="true"]')).toHaveLength(1);
    expect(q(container, '.ds-sidebar__navigation[data-part="navigation"]')).toHaveLength(1);
    expect(q(container, '.ds-sidebar__main[data-part="main"]')).toHaveLength(1);
    expect(q(container, '.ds-sidebar__aside')).toHaveLength(1);
  });

  it('pins workspace roots, lifecycle/tone/active/disabled states and BEM primitive hooks', async () => {
    const rows = [
      { id: '1', name: 'Alpha', status: 'todo' },
      { id: '2', name: 'Beta', status: 'done' },
      { id: '3', name: 'Gamma', status: 'done' },
    ];
    const columns = [
      { key: 'name', title: 'Name', dataIndex: 'name' },
      { key: 'status', title: 'Status', dataIndex: 'status' },
    ];

    const { container } = renderSurface(
      <div>
        <CollectionWorkspaceSurface
          title="Collection"
          subtitle="Workspace subtitle"
          header={{ eyebrow: 'Workspace', title: 'Collection', subtitle: 'Workspace subtitle' }}
          data={rows}
          columns={columns as any}
          rowKey="id"
          behavior={{
            focus: { enabled: true, focusedKey: '2', onFocusChange: () => undefined },
            previewRail: { enabled: true, render: (row) => <div>Preview {(row as typeof rows[number]).name}</div> },
          }}
          presentation={{ enhancedInteractions: true, shell: { variant: 'default' } }}
        />

        <CollectionRenderDispatch
          viewMode="cards"
          data={rows}
          columns={columns as any}
          rowKey="id"
          viewModes={{ cards: { columns: 2 } } as any}
          pagination={{
            current: 1,
            pageSize: 2,
            total: 5,
            pageSizeOptions: [2, 5],
            onChange: () => undefined,
          }}
        />
        <CollectionRenderDispatch
          viewMode="cards"
          data={[]}
          columns={columns as any}
          rowKey="id"
          loading
        />
        <CollectionRenderDispatch
          viewMode="calendar"
          data={[]}
          columns={columns as any}
          rowKey="id"
          error={<div>Dispatch failure</div>}
        />

        <CommandCenterSurface
          title="Command center"
          greeting="Welcome"
          quickActions={[{ key: 'create', label: 'Create', description: 'Create item', onClick: () => undefined }]}
          insights={[
            { id: 'i', type: 'info', title: 'Info' },
            { id: 'w', type: 'warning', title: 'Warning' },
            { id: 's', type: 'success', title: 'Success' },
            { id: 'e', type: 'error', title: 'Error' },
          ]}
        />

        <DecisionInboxSurface
          queueName="Decision queue"
          subtitle="Needs review"
          workspace={{
            data: rows.slice(0, 2),
            behavior: { selection: { enabled: true, selectedKeys: ['1', '2'] } },
          }}
          columns={columns as any}
          rowKey="id"
          decisions={[{ key: 'approve', label: 'Approve', variant: 'primary' }]}
          onDecision={() => undefined}
          batchDecisions
        />
        <DecisionInboxSurface
          queueName="Loading queue"
          workspace={{ data: [], loading: true }}
          columns={columns as any}
          rowKey="id"
          decisions={[]}
          onDecision={() => undefined}
        />

        <RecordWorkbenchSurface
          title="Record"
          subtitle="Record subtitle"
          status={{ label: 'At risk', variant: 'warning' }}
          actions={[
            { key: 'save', label: 'Save', variant: 'primary', onClick: () => undefined },
            { key: 'delete', label: 'Delete', variant: 'danger', disabled: true, onClick: () => undefined },
          ]}
          tabs={[
            { key: 'overview', label: 'Overview', badge: 2, render: () => <div>Overview</div> },
            { key: 'history', label: 'History', render: () => <div>History</div> },
          ]}
          showSidebar
          metadata={[{ key: 'owner', label: 'Owner', value: 'Daniel' }]}
        />
      </div>,
    );

    await waitForSelectors(container, [
      '.ds-surface.ds-collection-workspace[data-part="root"]',
      '.ds-surface.ds-collection-render-dispatch[data-part="root"][data-view-mode="cards"][data-state="ready"]',
      '.ds-surface.ds-collection-render-dispatch[data-part="root"][data-view-mode="cards"][data-state="loading"]',
      '.ds-surface.ds-collection-render-dispatch[data-part="root"][data-view-mode="calendar"][data-state="error"]',
      '.ds-surface.ds-command-center[data-part="root"][data-loading="false"][data-empty="false"]',
      '.ds-surface.ds-decision-inbox[data-part="root"][data-loading="false"][data-empty="false"]',
      '.ds-surface.ds-decision-inbox[data-part="root"][data-loading="true"][data-empty="false"]',
      '.ds-surface.ds-record-workbench[data-part="root"][data-loading="false"]',
    ]);

    expect(q(container, '.ds-collection-workspace__content[data-part="content"][data-loading="false"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-workspace__content[data-part="root"]')).toHaveLength(0);
    expect(q(container, '.ds-collection-preview-rail__resize[data-part="preview-rail-resize"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-preview-rail__resize-bar[data-part="preview-rail-resize-bar"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-workspace__collection[data-part="collection"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-render-dispatch__card-item[data-part="card-item"]')).toHaveLength(3);
    expect(q(container, '.ds-collection-render-dispatch__card-item[data-lone-final="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="pagination-prev"][data-disabled="true"]')).toHaveLength(1);
    expect(q(container, '[data-part="pagination-next"][data-disabled="false"]')).toHaveLength(1);
    expect(q(container, '.ds-collection-render-dispatch__page-size-select[data-part="page-size-select"]')).toHaveLength(1);
    for (const tone of ['info', 'warning', 'success', 'error']) {
      expect(q(container, `.ds-command-center__insight-tile[data-part="insight-tile"][data-tone="${tone}"]`)).toHaveLength(1);
      expect(q(container, `.ds-command-center__insight-accent[data-part="insight-accent"][data-tone="${tone}"]`)).toHaveLength(1);
    }
    expect(q(container, '.ds-command-center__quick-action-card')).toHaveLength(1);
    expect(q(container, '.ds-decision-inbox__selection-bar')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__status-badge[data-part="status-badge"][data-variant="warning"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__action[data-action-variant="primary"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__action[data-action-variant="danger"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__tab[data-active="true"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__tab[data-active="false"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__tab-badge[data-part="tab-badge"]')).toHaveLength(1);
    expect(q(container, '.ds-record-workbench__sidebar[data-part="sidebar"]')).toHaveLength(1);
  });
});

describe('CK-I admin/data thin-tail anatomy (I-4)', () => {
  it('pins all 13 roots, layout/loading state and child primitive landing hooks', async () => {
    const adapter = {
      entity: 'person',
      version: '1.0.0',
      map: (item: { id: string; name: string }) => item,
      fields: [{ key: 'name', fieldId: 'person.name' }],
    };

    const { container } = renderSurface(
      <div>
        <AuditSurface
          config={{
            visual: { density: 'compact' },
            presentation: { chrome: { title: 'Audit' } },
            behavior: {
              columns: [{ key: 'action', label: 'Action' }],
              entries: [{
                id: 'a1', timestamp: '2026-07-14', actor: 'Daniel', action: 'read',
                resource: 'Record', severity: 'info', details: 'Audit details',
              }],
              filters: [],
              pagination: { current: 1, total: 1, pageSize: 10 },
            },
          }}
        />
        <BillingSurface
          config={{
            visual: { layout: 'sections' },
            presentation: { chrome: { title: 'Billing' } },
            behavior: {
              currentPlan: { name: 'Pro', price: '$10', interval: 'month', features: ['Feature'] },
              usage: [{ label: 'Storage', current: 1, limit: 10, unit: 'GB' }],
              invoices: [{ id: 'inv', date: '2026-07-14', amount: '$10', status: 'paid' }],
              paymentMethods: [],
            },
          }}
        />
        <ImportExportSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Import export' } },
            behavior: {
              mode: 'both',
              importConfig: { acceptedFormats: ['.csv'] },
              exportConfig: {
                formats: ['csv'],
                fields: [{ key: 'name', label: 'Name', selected: true }],
              },
              history: [{ id: 'h1', type: 'import', date: '2026-07-14', status: 'completed', recordCount: 1 }],
            },
          }}
        />
        <IntegrationSurface
          config={{
            visual: { layout: 'sections' },
            presentation: { chrome: { title: 'Integrations' } },
            behavior: {
              apiKeys: [{ id: 'k1', name: 'Key', key: 'secret', createdAt: 'today', status: 'active' }],
              webhooks: [{ id: 'w1', url: 'https://example.test', events: ['event'], status: 'active' }],
              connectedApps: [{ id: 'app1', name: 'App', status: 'connected' }],
            },
          }}
        />
        <ProfileSurface
          config={{
            visual: { layout: 'stacked' },
            presentation: { chrome: { title: 'Profile' } },
            behavior: {
              sections: [{
                key: 'identity', label: 'Identity', description: 'Profile description',
                fields: [{ key: 'name', label: 'Name', value: 'Daniel', type: 'text' }],
              }],
            },
          }}
        />
        <SettingsSurface
          config={{
            visual: { tabsType: 'line' },
            presentation: { chrome: { title: 'Settings' }, intro: 'Settings intro' },
            behavior: {
              tabs: [{ key: 'general', label: 'General', description: 'General description', content: <div>General settings</div> }],
            },
          }}
        />
        <TeamSurface
          config={{
            visual: { layout: 'table' },
            presentation: { chrome: { title: 'Team populated' } },
            behavior: {
              members: [{ id: 'm1', name: 'Ana', email: 'ana@example.test', role: 'admin', status: 'active' }],
              roles: [{ id: 'admin', label: 'Admin' }],
            },
          }}
        />
        <TeamSurface
          config={{
            visual: { layout: 'table' },
            presentation: { chrome: { title: 'Team empty' } },
            behavior: { members: [], roles: [] },
          }}
        />

        <CompareSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Compare' } },
            behavior: {
              subjects: [{ key: 'a', label: 'A', description: 'Subject A' }],
              sections: [{
                key: 'main', title: 'Main', description: 'Section description',
                rows: [{ key: 'feature', label: 'Feature', description: 'Feature description', values: { a: 'Yes' } }],
              }],
            },
          }}
        />
        <DashboardSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Dashboard' },
              sections: [{ key: 'main', title: 'Main section', description: 'Dashboard description', content: <div>Dashboard content</div> }],
            },
            behavior: {},
          }}
        />
        <ListSurface
          data={[{ id: '1', name: 'Ana' }]}
          adapter={adapter as any}
          config={{
            visual: { defaultView: 'cards', allowViewSwitch: false },
            presentation: { chrome: { title: 'List' } },
            behavior: {
              columns: [{ key: 'name', fieldId: 'person.name', header: 'Name' }],
              rowKey: 'id',
            },
          } as any}
        />
        <ReportSurface
          config={{
            visual: { layout: 'top-filters' },
            presentation: { chrome: { title: 'Report' } },
            behavior: {
              templates: [{ id: 't1', name: 'Template', description: 'Template description' }],
              selectedTemplate: 't1',
              filters: [],
              reportData: {
                columns: [{ key: 'name', label: 'Name' }],
                rows: [{ name: 'Report row' }],
                summary: { Total: '1' },
              },
            },
          }}
        />
        <SearchSurface
          config={{
            visual: { layout: 'split', minQueryLength: 1 },
            presentation: {
              chrome: { title: 'Search' },
              placeholder: 'Search',
              resultPreview: (result) => <div>Preview {result.title}</div>,
            },
            behavior: {
              query: 'ana',
              results: [{ id: 'r1', title: 'Ana', description: 'Result description', meta: <span>Result meta</span> }],
              filters: [],
            },
          }}
        />
        <SearchSurface
          config={{
            visual: { layout: 'stack', minQueryLength: 1 },
            presentation: { chrome: { title: 'Empty search' }, placeholder: 'Empty search' },
            behavior: { query: 'missing', results: [], filters: [] },
          }}
        />
        <VisualizationSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Visualization' }, intro: <div>Visualization intro</div> },
            behavior: {
              views: [{ key: 'chart', label: 'Chart', description: 'Chart description', content: <div>Chart content</div> }],
            },
          }}
        />
      </div>,
    );

    await waitForSelectors(container, [
      '.ds-surface.ds-audit[data-part="root"][data-density="compact"][data-loading="false"]',
      '.ds-surface.ds-billing.ds-billing--sections',
      '.ds-surface.ds-import-export[data-part="root"][data-mode="both"][data-loading="false"]',
      '.ds-surface.ds-integration.ds-integration--sections',
      '.ds-surface.ds-profile[data-part="root"][data-layout="stacked"][data-loading="false"]',
      '.ds-surface.ds-settings.ds-settings--wide',
      '.ds-surface.ds-team.ds-team--populated',
      '.ds-surface.ds-team.ds-team--empty',
      '.ds-surface.ds-compare[data-part="root"][data-layout="table"][data-loading="false"]',
      '.ds-surface.ds-dashboard[data-part="root"][data-mobile="false"][data-loading="false"]',
      '.ds-surface.ds-list[data-part="root"][data-view="cards"][data-mobile="false"][data-loading="false"]',
      '.ds-surface.ds-report.ds-report--top-filters',
      '.ds-surface.ds-search[data-part="root"][data-layout="split"][data-loading="false"][data-preview="true"]',
      '.ds-search__empty-state[data-part="empty-state"][data-state="results"]',
      '.ds-surface.ds-visualization.ds-visualization--wide',
    ]);

    for (const selector of [
      '.ds-audit__muted-text[data-part="muted-text"]',
      '.ds-billing__muted-text[data-part="muted-text"]',
      '.ds-billing__divider',
      '.ds-import-export__dropzone',
      '.ds-import-export__muted-text[data-part="muted-text"]',
      '.ds-integration__divider',
      '.ds-integration__muted-text[data-part="muted-text"]',
      '.ds-profile__section-card',
      '.ds-profile__muted-text[data-part="muted-text"]',
      '.ds-settings__muted-text[data-part="muted-text"]',
      '.ds-team__divider',
      '.ds-team__muted-text[data-part="muted-text"]',
      '.ds-compare__section-heading[data-part="section-heading"]',
      '.ds-compare__muted-text[data-part="muted-text"]',
      '.ds-dashboard__muted-text[data-part="muted-text"]',
      '.ds-list__card-label[data-part="card-label"]',
      '.ds-list__card-value[data-part="card-value"]',
      '.ds-report__template-card--selected',
      '.ds-report__muted-text[data-part="muted-text"]',
      '.ds-search__result-card--selected',
      '.ds-search__result-title[data-part="result-title"]',
      '.ds-search__result-meta[data-part="result-meta"]',
      '.ds-visualization__muted-text[data-part="muted-text"]',
    ]) {
      expect(container.querySelector(selector), selector).not.toBeNull();
    }
  });
});

describe('CK-I experience/operations thin-tail anatomy (I-5)', () => {
  it('pins all 9 roots plus selected/unread/loading/layout state and BEM landing hooks', async () => {
    const { container } = renderSurface(
      <div>
        <AuthSurface
          config={{
            visual: { layout: 'split', heroPosition: 'start' },
            presentation: {
              eyebrow: 'Secure access',
              title: 'Sign in',
              subtitle: 'Use your account',
              form: <div>Auth form</div>,
              hero: <div>Auth hero</div>,
            },
            behavior: {},
          }}
        />
        <ChatSurface
          config={{
            visual: { composerRows: 2 },
            presentation: {
              chrome: { title: 'Chat' },
              composerPlaceholder: 'Ask',
              sidebar: <div>Chat sidebar</div>,
            },
            behavior: {
              messages: [{ id: 'm1', author: 'Assistant', body: 'Hello' }],
              assistantTyping: true,
              onSend: () => undefined,
            },
          }}
        />
        <EditorSurface
          config={{
            visual: { layout: 'split' },
            presentation: {
              chrome: { title: 'Editor' },
              description: 'Editor description',
              helperText: 'Editor helper',
              preview: <div>Editor preview</div>,
            },
            behavior: { initialValue: 'Draft' },
          }}
        />
        <MarketingSurface
          config={{
            visual: { heroPosition: 'end' },
            presentation: {
              eyebrow: 'Platform',
              title: 'Modern product',
              description: 'Marketing description',
              hero: <div>Marketing hero</div>,
              supporting: <div>Supporting copy</div>,
            },
            behavior: {},
          }}
        />
        <MediaSurface
          config={{
            visual: { layout: 'detail', columns: 2 },
            presentation: {
              chrome: { title: 'Media' },
              renderDetails: (item) => <div>Details {item.title}</div>,
            },
            behavior: {
              items: [
                { id: 'asset-1', src: '/one.png', title: 'One', description: 'First asset' },
                { id: 'asset-2', src: '/two.png', title: 'Two', description: 'Second asset' },
              ],
              selectedItemId: 'asset-1',
              itemActions: [],
            },
          }}
        />
        <NotificationSurface
          config={{
            visual: { layout: 'sections' },
            presentation: { chrome: { title: 'Notifications' } },
            behavior: {
              notifications: [
                {
                  id: 'n1', title: 'Unread', message: 'Unread message', timestamp: 'now',
                  read: false, type: 'warning', icon: <span>!</span>,
                  action: { label: 'Open', onClick: () => undefined },
                },
                { id: 'n2', title: 'Read', message: 'Read message', timestamp: 'before', read: true, type: 'info' },
              ],
              preferences: [{
                id: 'p1', label: 'Email', description: 'Email preference',
                channel: 'email', enabled: true, category: 'General',
              }],
              onMarkRead: () => undefined,
              onDelete: () => undefined,
              onPreferenceChange: () => undefined,
            },
          }}
        />
        <PricingSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Pricing' }, intro: 'Pricing intro' },
            behavior: {
              plans: [{ id: 'pro', name: 'Pro', price: 10, cta: 'Choose', features: { users: '10' } }],
              features: [{ key: 'users', label: 'Users' }],
              currentPlan: 'pro',
              billingCycle: 'monthly',
            },
          }}
        />
        <ActivitySurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Activity' } },
            behavior: {
              activities: [{ id: 'a1', user: { name: 'Daniel' }, action: 'Updated', timestamp: 'today' }],
              pagination: { current: 1, total: 10, pageSize: 5 },
            },
          }}
        />
        <KanbanSurface
          config={{
            visual: {},
            presentation: { chrome: { title: 'Kanban' } },
            behavior: {
              columns: [{ id: 'todo', title: 'Todo', color: '#f00', items: [{ id: 'c1', title: 'Card' }] }],
              filters: [{ key: 'status', label: 'Status', type: 'text' }],
              filterValues: { status: 'open' },
            },
          }}
        />
      </div>,
    );

    await waitForSelectors(container, [
      '.ds-surface.ds-auth[data-part="root"][data-layout="split"][data-mobile="false"][data-hero-position="start"]',
      '.ds-surface.ds-chat.ds-chat--split:not(.ds-chat--loading)',
      '.ds-surface.ds-editor.ds-editor--split:not(.ds-editor--loading)',
      '.ds-surface.ds-marketing[data-part="root"][data-layout="split"][data-mobile="false"][data-hero-position="end"]',
      '.ds-surface.ds-media.ds-media--split:not(.ds-media--loading)',
      '.ds-surface.ds-notification.ds-notification--sections[data-part="root"][data-layout="sections"][data-loading="false"]',
      '.ds-surface.ds-pricing[data-part="root"][data-loading="false"]',
      '.ds-pattern-activity-log.ds-surface.ds-activity',
      '.ds-surface.ds-kanban[data-part="root"][data-loading="false"][data-has-items="true"][data-has-filters="true"]',
    ]);

    await waitForSelectors(container, [
      '.ds-auth__form-panel',
      '.ds-auth__hero-panel',
      '.ds-auth__muted-text[data-part="muted-text"]',
      '.ds-chat__transcript[data-part="transcript"]',
      '.ds-chat__typing[data-part="typing-indicator"]',
      '.ds-chat__composer-input',
      '.ds-chat__send-button',
      '.ds-chat__sidebar',
      '.ds-editor__muted-text[data-part="muted-text"]',
      '.ds-editor__input',
      '.ds-editor__preview',
      '.ds-marketing__hero[data-part="hero"]',
      '.ds-marketing__muted-text[data-part="muted-text"]',
      '.ds-marketing__description[data-part="description"]',
      '.ds-media__item[data-part="media-item"][data-selected="true"]',
      '.ds-media__item[data-part="media-item"][data-selected="false"]',
      '.ds-media__card',
      '.ds-media__muted-text[data-part="muted-text"]',
      '.ds-notification__list[data-part="notification-list"]',
      '.ds-notification__item--unread',
      '.ds-notification__item--read',
      '.ds-notification__icon[data-part="icon"]',
      '.ds-notification__item-action[data-part="item-action"]',
      '.ds-notification__destructive-text[data-part="destructive-text"]',
      '.ds-notification__preferences[data-part="preferences"]',
      '.ds-pricing__muted-text[data-part="muted-text"]',
      '.ds-activity__pagination[data-part="pagination"]',
      '.ds-surface.ds-activity.ds-activity__pagination .ds-activity__muted-text[data-part="muted-text"]',
      '.ds-kanban__filters',
    ]);
  });
});
