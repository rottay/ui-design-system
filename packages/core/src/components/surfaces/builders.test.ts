/**
 * @fileoverview Tests verifying surface config builders inject mobile-safe
 * defaults while preserving explicit overrides.
 */

import { describe, expect, it } from 'vitest';

import {
  createActivitySurfaceConfig,
  createAuditSurfaceConfig,
  createAuthSurfaceConfig,
  createBillingSurfaceConfig,
  createChatSurfaceConfig,
  createCompareSurfaceConfig,
  createDashboardSurfaceConfig,
  createDetailFormSurfaceConfig,
  createDetailSurfaceConfig,
  createEditorSurfaceConfig,
  createEmptyStateSurfaceConfig,
  createFileBrowserSurfaceConfig,
  createFormSurfaceConfig,
  createHeaderSurfaceConfig,
  createImportExportSurfaceConfig,
  createIntegrationSurfaceConfig,
  createKanbanSurfaceConfig,
  createListSurfaceConfig,
  createMarketingSurfaceConfig,
  createMediaSurfaceConfig,
  createNotificationSurfaceConfig,
  createOnboardingSurfaceConfig,
  createOperationalSurfaceConfig,
  createPricingSurfaceConfig,
  createProfileSurfaceConfig,
  createReportSurfaceConfig,
  createSchedulerSurfaceConfig,
  createSearchSurfaceConfig,
  createSettingsSurfaceConfig,
  createSidebarSurfaceConfig,
  createTeamSurfaceConfig,
  createVisualizationSurfaceConfig,
  createWizardSurfaceConfig,
} from './builders';

describe('surface config builders', () => {
  // -------------------------------------------------------------------------
  // Original 6 builders with mobile defaults
  // -------------------------------------------------------------------------

  it('injects mobile defaults for the original responsive builder helpers', () => {
    const listConfig = createListSurfaceConfig({
      visual: {
        defaultView: 'table',
      },
      presentation: { chrome: { title: 'List' } },
      behavior: { columns: [] },
    } as any);

    const dashboardConfig = createDashboardSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Dashboard' } },
      behavior: {},
    } as any);

    const detailConfig = createDetailSurfaceConfig({
      visual: {},
      presentation: { title: () => 'Detail', tabs: [] },
      behavior: {},
    } as any);

    const formConfig = createFormSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Form' } },
      behavior: { fields: [] },
    } as any);

    const operationalConfig = createOperationalSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Ops' } },
      behavior: {},
    } as any);

    const marketingConfig = createMarketingSurfaceConfig({
      visual: {},
      presentation: { title: 'Marketing' },
      behavior: {},
    } as any);

    expect(listConfig.visual.mobileDefaultView).toBe('cards');
    expect(listConfig.visual.hideViewSwitchOnMobile).toBe(true);
    expect(listConfig.visual.mobileFiltersLayout).toBe('stacked');
    expect(dashboardConfig.visual.mobileStatsLimit).toBe(2);
    expect(dashboardConfig.visual.stackSectionsOnMobile).toBe(true);
    expect(detailConfig.visual.collapseSidebarOnMobile).toBe(true);
    expect(formConfig.visual.hideAsideOnMobile).toBe(true);
    expect(formConfig.visual.mobileActionsSticky).toBe(true);
    expect(operationalConfig.visual.mobileStatsLimit).toBe(2);
    expect(operationalConfig.visual.mobileQueuePosition).toBe('bottom');
    expect(operationalConfig.visual.mobileFeedPosition).toBe('bottom');
    expect(operationalConfig.visual.stackSectionsOnMobile).toBe(true);
    expect(marketingConfig.visual.stackOnMobile).toBe(true);
  });

  it('preserves explicit overrides from app configs (original builders)', () => {
    const listConfig = createListSurfaceConfig({
      visual: {
        defaultView: 'table',
        mobileDefaultView: 'table',
        hideViewSwitchOnMobile: false,
      },
      presentation: { chrome: { title: 'List' } },
      behavior: { columns: [] },
    } as any);

    const dashboardConfig = createDashboardSurfaceConfig({
      visual: {
        mobileStatsLimit: 4,
        stackSectionsOnMobile: false,
      },
      presentation: { chrome: { title: 'Dashboard' } },
      behavior: {},
    } as any);

    const detailConfig = createDetailSurfaceConfig({
      visual: {
        collapseSidebarOnMobile: false,
      },
      presentation: { title: () => 'Detail', tabs: [] },
      behavior: {},
    } as any);

    const formConfig = createFormSurfaceConfig({
      visual: {
        hideAsideOnMobile: false,
        mobileActionsSticky: false,
      },
      presentation: { chrome: { title: 'Form' } },
      behavior: { fields: [] },
    } as any);

    expect(listConfig.visual.mobileDefaultView).toBe('table');
    expect(listConfig.visual.hideViewSwitchOnMobile).toBe(false);
    expect(dashboardConfig.visual.mobileStatsLimit).toBe(4);
    expect(dashboardConfig.visual.stackSectionsOnMobile).toBe(false);
    expect(detailConfig.visual.collapseSidebarOnMobile).toBe(false);
    expect(formConfig.visual.hideAsideOnMobile).toBe(false);
    expect(formConfig.visual.mobileActionsSticky).toBe(false);
  });

  // -------------------------------------------------------------------------
  // New mobile defaults (20 builders)
  // -------------------------------------------------------------------------

  it('injects mobile defaults for auth surface', () => {
    const config = createAuthSurfaceConfig({
      visual: {},
      presentation: { title: 'Sign in', form: null },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactFormOnMobile).toBe(true);
  });

  it('injects mobile defaults for wizard surface', () => {
    const config = createWizardSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Wizard' } },
      behavior: { steps: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactStepsOnMobile).toBe(true);
  });

  it('injects mobile defaults for onboarding surface', () => {
    const config = createOnboardingSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Welcome' } },
      behavior: { steps: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.hideIllustrationOnMobile).toBe(true);
  });

  it('injects mobile defaults for report surface', () => {
    const config = createReportSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Reports' } },
      behavior: { templates: [], filters: [] },
    } as any);
    expect(config.visual.stackSectionsOnMobile).toBe(true);
    expect(config.visual.compactChartsOnMobile).toBe(true);
  });

  it('injects mobile defaults for scheduler surface', () => {
    const config = createSchedulerSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Calendar' } },
      behavior: { events: [] },
    } as any);
    expect(config.visual.mobileView).toBe('list');
    expect(config.visual.hideTimelineOnMobile).toBe(true);
  });

  it('injects mobile defaults for settings surface', () => {
    const config = createSettingsSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Settings' } },
      behavior: { tabs: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.collapseSidebarOnMobile).toBe(true);
  });

  it('injects mobile defaults for notification surface', () => {
    const config = createNotificationSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Notifications' } },
      behavior: { notifications: [], preferences: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactItemsOnMobile).toBe(true);
  });

  it('injects mobile defaults for sidebar surface', () => {
    const config = createSidebarSurfaceConfig({
      visual: {},
      presentation: { sidebar: null, content: null },
      behavior: {},
    } as any);
    expect(config.visual.collapsible).toBe(true);
    expect(config.visual.collapseOnMobile).toBe(true);
  });

  it('injects mobile defaults for media surface', () => {
    const config = createMediaSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Media' } },
      behavior: { items: [] },
    } as any);
    expect(config.visual.mobileColumnsLimit).toBe(2);
    expect(config.visual.stackOnMobile).toBe(true);
  });

  it('injects mobile defaults for chat surface', () => {
    const config = createChatSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Chat' } },
      behavior: { messages: [] },
    } as any);
    expect(config.visual.hideListOnMobile).toBe(true);
    expect(config.visual.stickyInputOnMobile).toBe(true);
  });

  it('injects mobile defaults for kanban surface', () => {
    const config = createKanbanSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Board' } },
      behavior: { columns: [] },
    } as any);
    expect(config.visual.mobileColumnsLimit).toBe(1);
    expect(config.visual.stackColumnsOnMobile).toBe(true);
  });

  it('injects mobile defaults for search surface', () => {
    const config = createSearchSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Search' } },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.stickySearchOnMobile).toBe(true);
  });

  it('injects mobile defaults for compare surface', () => {
    const config = createCompareSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Compare' } },
      behavior: { subjects: [], sections: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.mobileCompareLimit).toBe(2);
  });

  it('injects mobile defaults for editor surface', () => {
    const config = createEditorSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Editor' } },
      behavior: {},
    } as any);
    expect(config.visual.hideToolbarOnMobile).toBe(false);
    expect(config.visual.compactToolbarOnMobile).toBe(true);
  });

  it('injects mobile defaults for visualization surface', () => {
    const config = createVisualizationSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Analytics' } },
      behavior: { views: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactChartsOnMobile).toBe(true);
  });

  it('injects mobile defaults for profile surface', () => {
    const config = createProfileSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Profile' } },
      behavior: { sections: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.collapseSidebarOnMobile).toBe(true);
  });

  it('injects mobile defaults for team surface', () => {
    const config = createTeamSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Team' } },
      behavior: { members: [], roles: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.mobileDefaultView).toBe('cards');
  });

  it('injects mobile defaults for billing surface', () => {
    const config = createBillingSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Billing' } },
      behavior: { currentPlan: { name: 'Pro', price: '$49', interval: 'month', features: [] } },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.collapseSidebarOnMobile).toBe(true);
  });

  it('injects mobile defaults for audit surface', () => {
    const config = createAuditSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Audit' } },
      behavior: { columns: [], entries: [], filters: [] },
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactEntriesOnMobile).toBe(true);
  });

  it('injects mobile defaults for import-export surface', () => {
    const config = createImportExportSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Import' } },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Override tests for all 20 new builders
  // -------------------------------------------------------------------------

  it('preserves explicit overrides for newly responsive builders', () => {
    const auth = createAuthSurfaceConfig({
      visual: { stackOnMobile: false, compactFormOnMobile: false },
      presentation: { title: 'Sign in', form: null },
      behavior: {},
    } as any);
    expect(auth.visual.stackOnMobile).toBe(false);
    expect(auth.visual.compactFormOnMobile).toBe(false);

    const wizard = createWizardSurfaceConfig({
      visual: { stackOnMobile: false, compactStepsOnMobile: false },
      presentation: { chrome: { title: 'Wizard' } },
      behavior: { steps: [] },
    } as any);
    expect(wizard.visual.stackOnMobile).toBe(false);
    expect(wizard.visual.compactStepsOnMobile).toBe(false);

    const onboarding = createOnboardingSurfaceConfig({
      visual: { stackOnMobile: false, hideIllustrationOnMobile: false },
      presentation: { chrome: { title: 'Welcome' } },
      behavior: { steps: [] },
    } as any);
    expect(onboarding.visual.stackOnMobile).toBe(false);
    expect(onboarding.visual.hideIllustrationOnMobile).toBe(false);

    const report = createReportSurfaceConfig({
      visual: { stackSectionsOnMobile: false, compactChartsOnMobile: false },
      presentation: { chrome: { title: 'Reports' } },
      behavior: { templates: [], filters: [] },
    } as any);
    expect(report.visual.stackSectionsOnMobile).toBe(false);
    expect(report.visual.compactChartsOnMobile).toBe(false);

    const scheduler = createSchedulerSurfaceConfig({
      visual: { mobileView: 'day' as const, hideTimelineOnMobile: false },
      presentation: { chrome: { title: 'Calendar' } },
      behavior: { events: [] },
    } as any);
    expect(scheduler.visual.mobileView).toBe('day');
    expect(scheduler.visual.hideTimelineOnMobile).toBe(false);

    const settings = createSettingsSurfaceConfig({
      visual: { stackOnMobile: false, collapseSidebarOnMobile: false },
      presentation: { chrome: { title: 'Settings' } },
      behavior: { tabs: [] },
    } as any);
    expect(settings.visual.stackOnMobile).toBe(false);
    expect(settings.visual.collapseSidebarOnMobile).toBe(false);

    const notification = createNotificationSurfaceConfig({
      visual: { stackOnMobile: false, compactItemsOnMobile: false },
      presentation: { chrome: { title: 'Notifications' } },
      behavior: { notifications: [], preferences: [] },
    } as any);
    expect(notification.visual.stackOnMobile).toBe(false);
    expect(notification.visual.compactItemsOnMobile).toBe(false);

    const sidebar = createSidebarSurfaceConfig({
      visual: { collapsible: false, collapseOnMobile: false },
      presentation: { sidebar: null, content: null },
      behavior: {},
    } as any);
    expect(sidebar.visual.collapsible).toBe(false);
    expect(sidebar.visual.collapseOnMobile).toBe(false);

    const media = createMediaSurfaceConfig({
      visual: { mobileColumnsLimit: 3, stackOnMobile: false },
      presentation: { chrome: { title: 'Media' } },
      behavior: { items: [] },
    } as any);
    expect(media.visual.mobileColumnsLimit).toBe(3);
    expect(media.visual.stackOnMobile).toBe(false);

    const chat = createChatSurfaceConfig({
      visual: { hideListOnMobile: false, stickyInputOnMobile: false },
      presentation: { chrome: { title: 'Chat' } },
      behavior: { messages: [] },
    } as any);
    expect(chat.visual.hideListOnMobile).toBe(false);
    expect(chat.visual.stickyInputOnMobile).toBe(false);

    const kanban = createKanbanSurfaceConfig({
      visual: { mobileColumnsLimit: 2, stackColumnsOnMobile: false },
      presentation: { chrome: { title: 'Board' } },
      behavior: { columns: [] },
    } as any);
    expect(kanban.visual.mobileColumnsLimit).toBe(2);
    expect(kanban.visual.stackColumnsOnMobile).toBe(false);

    const search = createSearchSurfaceConfig({
      visual: { stackOnMobile: false, stickySearchOnMobile: false },
      presentation: { chrome: { title: 'Search' } },
      behavior: {},
    } as any);
    expect(search.visual.stackOnMobile).toBe(false);
    expect(search.visual.stickySearchOnMobile).toBe(false);

    const compare = createCompareSurfaceConfig({
      visual: { stackOnMobile: false, mobileCompareLimit: 4 },
      presentation: { chrome: { title: 'Compare' } },
      behavior: { subjects: [], sections: [] },
    } as any);
    expect(compare.visual.stackOnMobile).toBe(false);
    expect(compare.visual.mobileCompareLimit).toBe(4);

    const editor = createEditorSurfaceConfig({
      visual: { hideToolbarOnMobile: true, compactToolbarOnMobile: false },
      presentation: { chrome: { title: 'Editor' } },
      behavior: {},
    } as any);
    expect(editor.visual.hideToolbarOnMobile).toBe(true);
    expect(editor.visual.compactToolbarOnMobile).toBe(false);

    const visualization = createVisualizationSurfaceConfig({
      visual: { stackOnMobile: false, compactChartsOnMobile: false },
      presentation: { chrome: { title: 'Analytics' } },
      behavior: { views: [] },
    } as any);
    expect(visualization.visual.stackOnMobile).toBe(false);
    expect(visualization.visual.compactChartsOnMobile).toBe(false);

    const profile = createProfileSurfaceConfig({
      visual: { stackOnMobile: false, collapseSidebarOnMobile: false },
      presentation: { chrome: { title: 'Profile' } },
      behavior: { sections: [] },
    } as any);
    expect(profile.visual.stackOnMobile).toBe(false);
    expect(profile.visual.collapseSidebarOnMobile).toBe(false);

    const team = createTeamSurfaceConfig({
      visual: { stackOnMobile: false, mobileDefaultView: 'table' as const },
      presentation: { chrome: { title: 'Team' } },
      behavior: { members: [], roles: [] },
    } as any);
    expect(team.visual.stackOnMobile).toBe(false);
    expect(team.visual.mobileDefaultView).toBe('table');

    const billing = createBillingSurfaceConfig({
      visual: { stackOnMobile: false, collapseSidebarOnMobile: false },
      presentation: { chrome: { title: 'Billing' } },
      behavior: { currentPlan: { name: 'Pro', price: '$49', interval: 'month', features: [] } },
    } as any);
    expect(billing.visual.stackOnMobile).toBe(false);
    expect(billing.visual.collapseSidebarOnMobile).toBe(false);

    const audit = createAuditSurfaceConfig({
      visual: { stackOnMobile: false, compactEntriesOnMobile: false },
      presentation: { chrome: { title: 'Audit' } },
      behavior: { columns: [], entries: [], filters: [] },
    } as any);
    expect(audit.visual.stackOnMobile).toBe(false);
    expect(audit.visual.compactEntriesOnMobile).toBe(false);

    const importExport = createImportExportSurfaceConfig({
      visual: { stackOnMobile: false },
      presentation: { chrome: { title: 'Import' } },
      behavior: {},
    } as any);
    expect(importExport.visual.stackOnMobile).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Mobile defaults for formerly pass-through builders
  // -------------------------------------------------------------------------

  it('injects mobile defaults for header surface', () => {
    const config = createHeaderSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Header' } },
      behavior: {},
    } as any);
    expect(config.visual.compactOnMobile).toBe(true);
    expect(config.visual.hideSecondaryActionsOnMobile).toBe(true);
  });

  it('injects mobile defaults for detail-form surface', () => {
    const config = createDetailFormSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Edit' } },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.hideAsideOnMobile).toBe(true);
  });

  it('injects mobile defaults for empty-state surface', () => {
    const config = createEmptyStateSurfaceConfig({
      visual: {},
      presentation: { title: 'Nothing here' },
      behavior: {},
    } as any);
    expect(config.visual.compactOnMobile).toBe(true);
    expect(config.visual.hideIllustrationOnMobile).toBe(false);
  });

  it('injects mobile defaults for integration surface', () => {
    const config = createIntegrationSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Integrations' } },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactCardsOnMobile).toBe(true);
  });

  it('injects mobile defaults for activity surface', () => {
    const config = createActivitySurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Activity' } },
      behavior: {},
    } as any);
    expect(config.visual.compactEntriesOnMobile).toBe(true);
    expect(config.visual.stackOnMobile).toBe(true);
  });

  it('injects mobile defaults for file-browser surface', () => {
    const config = createFileBrowserSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Files' } },
      behavior: {},
    } as any);
    expect(config.visual.mobileView).toBe('list');
    expect(config.visual.stackOnMobile).toBe(true);
  });

  it('injects mobile defaults for pricing surface', () => {
    const config = createPricingSurfaceConfig({
      visual: {},
      presentation: { chrome: { title: 'Pricing' } },
      behavior: {},
    } as any);
    expect(config.visual.stackOnMobile).toBe(true);
    expect(config.visual.compactColumnsOnMobile).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Override tests for the 7 formerly pass-through builders
  // -------------------------------------------------------------------------

  it('preserves explicit overrides for formerly pass-through builders', () => {
    const header = createHeaderSurfaceConfig({
      visual: { compactOnMobile: false, hideSecondaryActionsOnMobile: false },
      presentation: { chrome: { title: 'Header' } },
      behavior: {},
    } as any);
    expect(header.visual.compactOnMobile).toBe(false);
    expect(header.visual.hideSecondaryActionsOnMobile).toBe(false);

    const detailForm = createDetailFormSurfaceConfig({
      visual: { stackOnMobile: false, hideAsideOnMobile: false },
      presentation: { chrome: { title: 'Edit' } },
      behavior: {},
    } as any);
    expect(detailForm.visual.stackOnMobile).toBe(false);
    expect(detailForm.visual.hideAsideOnMobile).toBe(false);

    const emptyState = createEmptyStateSurfaceConfig({
      visual: { compactOnMobile: false, hideIllustrationOnMobile: true },
      presentation: { title: 'Nothing here' },
      behavior: {},
    } as any);
    expect(emptyState.visual.compactOnMobile).toBe(false);
    expect(emptyState.visual.hideIllustrationOnMobile).toBe(true);

    const integration = createIntegrationSurfaceConfig({
      visual: { stackOnMobile: false, compactCardsOnMobile: false },
      presentation: { chrome: { title: 'Integrations' } },
      behavior: {},
    } as any);
    expect(integration.visual.stackOnMobile).toBe(false);
    expect(integration.visual.compactCardsOnMobile).toBe(false);

    const activity = createActivitySurfaceConfig({
      visual: { compactEntriesOnMobile: false, stackOnMobile: false },
      presentation: { chrome: { title: 'Activity' } },
      behavior: {},
    } as any);
    expect(activity.visual.compactEntriesOnMobile).toBe(false);
    expect(activity.visual.stackOnMobile).toBe(false);

    const fileBrowser = createFileBrowserSurfaceConfig({
      visual: { mobileView: 'grid' as const, stackOnMobile: false },
      presentation: { chrome: { title: 'Files' } },
      behavior: {},
    } as any);
    expect(fileBrowser.visual.mobileView).toBe('grid');
    expect(fileBrowser.visual.stackOnMobile).toBe(false);

    const pricing = createPricingSurfaceConfig({
      visual: { stackOnMobile: false, compactColumnsOnMobile: false },
      presentation: { chrome: { title: 'Pricing' } },
      behavior: {},
    } as any);
    expect(pricing.visual.stackOnMobile).toBe(false);
    expect(pricing.visual.compactColumnsOnMobile).toBe(false);
  });
});
