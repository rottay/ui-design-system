/**
 * @fileoverview Tests for surface config builder mobile defaults and
 * pass-through behavior where appropriate.
 */

import { describe, expect, it } from 'vitest';

import {
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
  createFormSurfaceConfig,
  createHeaderSurfaceConfig,
  createImportExportSurfaceConfig,
  createListSurfaceConfig,
  createMarketingSurfaceConfig,
  createMediaSurfaceConfig,
  createNotificationSurfaceConfig,
  createOnboardingSurfaceConfig,
  createOperationalSurfaceConfig,
  createProfileSurfaceConfig,
  createReportSurfaceConfig,
  createSchedulerSurfaceConfig,
  createSearchSurfaceConfig,
  createSettingsSurfaceConfig,
  createSidebarSurfaceConfig,
  createVisualizationSurfaceConfig,
  createWizardSurfaceConfig,
} from '../builders';

describe('surface config builders', () => {
  it('adds mobile-safe defaults for the responsive builders', () => {
    const listConfig = createListSurfaceConfig({
      visual: {
        defaultView: 'table',
      },
    } as any);
    const dashboardConfig = createDashboardSurfaceConfig({
      visual: {},
    } as any);
    const detailConfig = createDetailSurfaceConfig({
      visual: {},
    } as any);
    const formConfig = createFormSurfaceConfig({
      visual: {},
    } as any);
    const operationalConfig = createOperationalSurfaceConfig({
      visual: {},
    } as any);
    const marketingConfig = createMarketingSurfaceConfig({
      visual: {},
    } as any);

    expect(listConfig.visual.mobileDefaultView).toBe('cards');
    expect(listConfig.visual.hideViewSwitchOnMobile).toBe(true);
    expect(listConfig.visual.mobileFiltersLayout).toBe('stacked');
    expect(dashboardConfig.visual.mobileStatsLimit).toBe(2);
    expect(detailConfig.visual.collapseSidebarOnMobile).toBe(true);
    expect(formConfig.visual.hideAsideOnMobile).toBe(true);
    expect(formConfig.visual.mobileActionsSticky).toBe(true);
    expect(operationalConfig.visual.mobileQueuePosition).toBe('bottom');
    expect(marketingConfig.visual.stackOnMobile).toBe(true);
  });

  it('preserves explicit mobile overrides from app configs', () => {
    const listConfig = createListSurfaceConfig({
      visual: {
        mobileDefaultView: 'table',
      },
    } as any);
    const detailConfig = createDetailSurfaceConfig({
      visual: {
        collapseSidebarOnMobile: false,
      },
    } as any);
    const formConfig = createFormSurfaceConfig({
      visual: {
        hideAsideOnMobile: false,
        mobileActionsSticky: false,
      },
    } as any);

    expect(listConfig.visual.mobileDefaultView).toBe('table');
    expect(detailConfig.visual.collapseSidebarOnMobile).toBe(false);
    expect(formConfig.visual.hideAsideOnMobile).toBe(false);
    expect(formConfig.visual.mobileActionsSticky).toBe(false);
  });

  it('keeps the rest of the public builder helpers as pass-throughs', () => {
    const baseEntity = { entity: 'record', version: '1.0', map: (value: unknown) => value };
    const configs = [
      createChatSurfaceConfig({ messages: [] } as any),
      createWizardSurfaceConfig({ steps: [] } as any),
      createHeaderSurfaceConfig({ title: 'Header' } as any),
      createSidebarSurfaceConfig({ sections: [] } as any),
      createDetailFormSurfaceConfig({ adapter: baseEntity, fields: [] } as any),
      createVisualizationSurfaceConfig({ charts: [] } as any),
      createSearchSurfaceConfig({ results: [] } as any),
      createEditorSurfaceConfig({ mode: 'edit' } as any),
      createMediaSurfaceConfig({ items: [] } as any),
      createSchedulerSurfaceConfig({ events: [] } as any),
      createCompareSurfaceConfig({ items: [] } as any),
      createAuthSurfaceConfig({ mode: 'signin' } as any),
      createOnboardingSurfaceConfig({ steps: [] } as any),
      createEmptyStateSurfaceConfig({ title: 'Empty' } as any),
      createSettingsSurfaceConfig({ sections: [] } as any),
      createAuditSurfaceConfig({ entries: [] } as any),
      createBillingSurfaceConfig({ plans: [] } as any),
      createProfileSurfaceConfig({ sections: [] } as any),
      createNotificationSurfaceConfig({ items: [] } as any),
      createImportExportSurfaceConfig({ modes: [] } as any),
      createReportSurfaceConfig({ sections: [] } as any),
    ];

    expect(configs).toHaveLength(21);
    expect(configs[0]).toMatchObject({ messages: [] });
    expect(configs[8]).toMatchObject({ items: [] });
    expect(configs[11]).toMatchObject({ mode: 'signin' });
    expect(configs[14]).toMatchObject({ sections: [] });
    expect(configs[15]).toMatchObject({ entries: [] });
    expect(configs[16]).toMatchObject({ plans: [] });
    expect(configs[17]).toMatchObject({ sections: [] });
    expect(configs[18]).toMatchObject({ items: [] });
    expect(configs[19]).toMatchObject({ modes: [] });
    expect(configs[20]).toMatchObject({ sections: [] });
  });
});
