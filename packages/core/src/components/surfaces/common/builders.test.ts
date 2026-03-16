/**
 * @fileoverview Tests for surface config builder identity functions.
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
  it('return the same config object for every public builder helper', () => {
    const baseEntity = { entity: 'record', version: '1.0', map: (value: unknown) => value };
    const configs = [
      createListSurfaceConfig({ adapter: baseEntity } as any),
      createDashboardSurfaceConfig({ sections: [] } as any),
      createChatSurfaceConfig({ messages: [] } as any),
      createDetailSurfaceConfig({ adapter: baseEntity } as any),
      createFormSurfaceConfig({ fields: [] } as any),
      createWizardSurfaceConfig({ steps: [] } as any),
      createHeaderSurfaceConfig({ title: 'Header' } as any),
      createSidebarSurfaceConfig({ sections: [] } as any),
      createDetailFormSurfaceConfig({ adapter: baseEntity, fields: [] } as any),
      createVisualizationSurfaceConfig({ charts: [] } as any),
      createSearchSurfaceConfig({ results: [] } as any),
      createEditorSurfaceConfig({ mode: 'edit' } as any),
      createOperationalSurfaceConfig({ feed: [] } as any),
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

    expect(configs).toHaveLength(26);
    expect(configs[0]).toMatchObject({ adapter: baseEntity });
    expect(configs[2]).toMatchObject({ messages: [] });
    expect(configs[13]).toMatchObject({ items: [] });
    expect(configs[19]).toMatchObject({ sections: [] });
    expect(configs[20]).toMatchObject({ entries: [] });
    expect(configs[21]).toMatchObject({ plans: [] });
    expect(configs[22]).toMatchObject({ sections: [] });
    expect(configs[23]).toMatchObject({ items: [] });
    expect(configs[24]).toMatchObject({ modes: [] });
    expect(configs[25]).toMatchObject({ sections: [] });
  });
});
