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
} from './builders';

describe('surface config builders', () => {
  const cases: Array<[string, (config: unknown) => unknown, unknown]> = [
    ['list', createListSurfaceConfig as (config: unknown) => unknown, { kind: 'list', behavior: { id: 'list' } }],
    ['dashboard', createDashboardSurfaceConfig as (config: unknown) => unknown, { kind: 'dashboard', presentation: { title: 'Dashboard' } }],
    ['chat', createChatSurfaceConfig as (config: unknown) => unknown, { kind: 'chat', behavior: { stream: true } }],
    ['detail', createDetailSurfaceConfig as (config: unknown) => unknown, { kind: 'detail', presentation: { title: 'Detail' } }],
    ['form', createFormSurfaceConfig as (config: unknown) => unknown, { kind: 'form', behavior: { submitLabel: 'Save' } }],
    ['wizard', createWizardSurfaceConfig as (config: unknown) => unknown, { kind: 'wizard', behavior: { currentStep: 1 } }],
    ['header', createHeaderSurfaceConfig as (config: unknown) => unknown, { kind: 'header', presentation: { title: 'Header' } }],
    ['sidebar', createSidebarSurfaceConfig as (config: unknown) => unknown, { kind: 'sidebar', visual: { collapsed: false } }],
    ['detail-form', createDetailFormSurfaceConfig as (config: unknown) => unknown, { kind: 'detail-form', presentation: { title: 'Edit' } }],
    ['visualization', createVisualizationSurfaceConfig as (config: unknown) => unknown, { kind: 'visualization', presentation: { title: 'Analytics' } }],
    ['search', createSearchSurfaceConfig as (config: unknown) => unknown, { kind: 'search', behavior: { query: 'events' } }],
    ['editor', createEditorSurfaceConfig as (config: unknown) => unknown, { kind: 'editor', behavior: { autosave: true } }],
    ['operational', createOperationalSurfaceConfig as (config: unknown) => unknown, { kind: 'operational', behavior: { feed: [] } }],
    ['media', createMediaSurfaceConfig as (config: unknown) => unknown, { kind: 'media', presentation: { title: 'Media' } }],
    ['scheduler', createSchedulerSurfaceConfig as (config: unknown) => unknown, { kind: 'scheduler', behavior: { initialView: 'week' } }],
    ['compare', createCompareSurfaceConfig as (config: unknown) => unknown, { kind: 'compare', presentation: { title: 'Compare' } }],
    ['auth', createAuthSurfaceConfig as (config: unknown) => unknown, { kind: 'auth', presentation: { title: 'Sign in' } }],
    ['onboarding', createOnboardingSurfaceConfig as (config: unknown) => unknown, { kind: 'onboarding', behavior: { step: 0 } }],
    ['empty-state', createEmptyStateSurfaceConfig as (config: unknown) => unknown, { kind: 'empty-state', presentation: { title: 'Nothing here' } }],
    ['settings', createSettingsSurfaceConfig as (config: unknown) => unknown, { kind: 'settings', presentation: { sections: [] } }],
    ['audit', createAuditSurfaceConfig as (config: unknown) => unknown, { kind: 'audit', behavior: { exportable: true } }],
    ['billing', createBillingSurfaceConfig as (config: unknown) => unknown, { kind: 'billing', presentation: { title: 'Billing' } }],
    ['profile', createProfileSurfaceConfig as (config: unknown) => unknown, { kind: 'profile', presentation: { title: 'Profile' } }],
    ['notification', createNotificationSurfaceConfig as (config: unknown) => unknown, { kind: 'notification', behavior: { unreadOnly: false } }],
    ['import-export', createImportExportSurfaceConfig as (config: unknown) => unknown, { kind: 'import-export', behavior: { mode: 'import' } }],
    ['report', createReportSurfaceConfig as (config: unknown) => unknown, { kind: 'report', behavior: { template: 'summary' } }],
  ];

  it.each(cases)('returns the same config reference for %s', (_name, builder, config) => {
    expect(builder(config)).toBe(config);
  });
});
