import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecordWorkbenchSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

const tabs = [{ key: 'overview', label: 'Overview', render: () => <div>Overview content</div> }];
const metadata = [{ key: 'status', label: 'Status', value: 'Active' }];

describe('RecordWorkbench posture landmarks', () => {
  it.each(['hide', 'collapse'] as const)('keeps record content named when tabs %s and sidebar collapses', async (disposition) => {
    const { container } = renderSurface(<RecordWorkbenchSurface title="Record" tabs={tabs} metadata={metadata} postures={{ phone: { regions: { tabs: disposition, sidebar: 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    expect(await screen.findByText('Overview content')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Record content' })).not.toHaveAttribute('aria-labelledby');
    const sidebar = screen.getByRole('complementary', { name: 'Details' });
    expect(sidebar).not.toHaveAttribute('aria-labelledby');
    expect(sidebar.childElementCount).toBe(0);
    for (const element of container.querySelectorAll('[aria-labelledby]')) {
      for (const id of element.getAttribute('aria-labelledby')!.split(/\s+/)) expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('preserves existing tab and sidebar heading references on omission', async () => {
    const { container } = renderSurface(<RecordWorkbenchSurface title="Record" tabs={tabs} metadata={metadata} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Overview content');
    await screen.findByRole('tab', { name: 'Overview' });
    const panel = screen.getByRole('tabpanel');
    expect(document.getElementById(panel.getAttribute('aria-labelledby')!)).toHaveTextContent('Overview');
    const sidebar = screen.getByRole('complementary', { name: 'Details' });
    expect(document.getElementById(sidebar.getAttribute('aria-labelledby')!)).toHaveTextContent('Details');
    expect(container.querySelector('[data-surface-region]')).toBeNull();
  });
});
