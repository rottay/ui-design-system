/** @fileoverview DetailSurface view-transition tests -- record-derived body identity. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { recordTransitionName } from '../../../../../../motion';
import { DetailSurface } from '..';
import type { DetailSurfaceConfig, EntityAdapter } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

interface RawRecord {
  id: string;
  name: string;
}

const adapter: EntityAdapter<RawRecord, RawRecord> = {
  entity: 'record',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [{ key: 'name', fieldId: 'record.name' }],
};

function buildConfig(overrides: Partial<DetailSurfaceConfig<RawRecord>> = {}): DetailSurfaceConfig<RawRecord> {
  return {
    visual: {},
    presentation: { title: (item) => item.name },
    behavior: {},
    ...overrides,
  };
}

/** Finds the element carrying a given view-transition-name in the container. */
function findByTransitionName(container: HTMLElement, name: string): HTMLElement | undefined {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (el) => el.style.viewTransitionName === name
  );
}

describe('DetailSurface body view-transition name', () => {
  it('derives the body name from the configured recordKey via resolveRowKey', async () => {
    const config = buildConfig({ behavior: { recordKey: 'id' } });

    const { container } = renderSurface(
      <DetailSurface data={{ id: 'rec-1', name: 'Ana Gomez' }} adapter={adapter} config={config} />
    );

    await screen.findByText('Ana Gomez');

    expect(findByTransitionName(container, recordTransitionName('rec-1'))).toBeDefined();
  });

  it('keeps the constant detail-body name when no recordKey is configured, instead of guessing one', async () => {
    const config = buildConfig();

    const { container } = renderSurface(
      <DetailSurface data={{ id: 'rec-1', name: 'Ana Gomez' }} adapter={adapter} config={config} />
    );

    await screen.findByText('Ana Gomez');

    expect(findByTransitionName(container, 'ds-vt-detail-body')).toBeDefined();
    expect(findByTransitionName(container, recordTransitionName('rec-1'))).toBeUndefined();
  });

  it('supports a function-form recordKey, matching the rowKey contract shape', async () => {
    const config = buildConfig({ behavior: { recordKey: (item) => `custom-${item.id}` } });

    const { container } = renderSurface(
      <DetailSurface data={{ id: 'rec-1', name: 'Ana Gomez' }} adapter={adapter} config={config} />
    );

    await screen.findByText('Ana Gomez');

    expect(findByTransitionName(container, recordTransitionName('custom-rec-1'))).toBeDefined();
  });

  it('keeps the constant detail-body name while loading, even if recordKey is configured', async () => {
    const config = buildConfig({ behavior: { recordKey: 'id' } });

    const { container } = renderSurface(
      <DetailSurface data={null} adapter={adapter} config={config} loading />
    );

    expect(findByTransitionName(container, 'ds-vt-detail-body')).toBeDefined();
  });
});
