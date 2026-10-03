import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Table as ModernTable } from '../engines/modern';
import { Table as RusticTable } from '../engines/rustic';

const COLUMNS = [{ title: 'Name', dataIndex: 'name', key: 'name' }];
const DATA = [{ key: '1', name: 'Ada' }];

describe('Table default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} />, 'modern');
    expect(byDefault.container.querySelector('[data-part="table"]')).toHaveAttribute('data-size', 'md');
    byDefault.unmount();

    const explicit = renderWithEngine(
      <ModernTable columns={COLUMNS} dataSource={DATA} pagination={false} size="md" />,
      'modern',
    );
    expect(explicit.container.querySelector('[data-part="table"]')).toHaveAttribute('data-size', 'md');
  });

  it('renders the same rustic table markup with no size and with the md step', () => {
    const geometry = (container: HTMLElement) => container.querySelector('table')?.outerHTML;

    const byDefault = renderWithEngine(<RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} />, 'rustic');
    const defaultGeometry = geometry(byDefault.container);
    expect(defaultGeometry).toBeTruthy();
    byDefault.unmount();

    const explicit = renderWithEngine(
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} size="md" />,
      'rustic',
    );
    expect(geometry(explicit.container)).toBe(defaultGeometry);

    const small = renderWithEngine(
      <RusticTable columns={COLUMNS} dataSource={DATA} pagination={false} size="sm" />,
      'rustic',
    );
    expect(geometry(small.container)).not.toBe(defaultGeometry);
  });
});
