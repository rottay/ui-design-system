import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import type { FormSurfaceConfig } from '../../../../../foundation/contracts';

function config(): FormSurfaceConfig {
  return { visual: { mobileActionsSticky: true, hideAsideOnMobile: false }, presentation: { chrome: { title: 'Edit record' }, aside: <div>Field help</div> }, behavior: { fields: [], submitAction: { id: 'save', label: 'Save record', onClick: vi.fn() } } };
}

describe('FormSurface postures', () => {
  it('does not create a posture dock when access removes every action', async () => {
    const value = config();
    value.access = { mode: 'resolved', capabilities: [{ kind: 'action', id: 'save', visible: false }] };
    const { container } = renderSurface(<FormSurface config={value} postures={{ phone: { primaryAction: 'bottom-bar' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByText('Edit record');
    expect(screen.queryByRole('button', { name: 'Save record' })).not.toBeInTheDocument();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
    expect(value.behavior.submitAction.onClick).not.toHaveBeenCalled();
  });
  it('uses one sticky action dock inside the native form and preserves submission', async () => {
    const value = config();
    const { container } = renderSurface(<FormSurface config={value} postures={{ phone: { regions: { aside: 'hide' }, primaryAction: 'bottom-bar', density: 'spacious' } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const submit = await screen.findByRole('button', { name: 'Save record' });
    expect(container.querySelectorAll('.ds-action-dock')).toHaveLength(1);
    expect(submit.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'sticky');
    const form = submit.closest('form');
    expect(form).not.toBeNull();
    expect(container.querySelector('[data-density="spacious"]')).not.toBeNull();
    expect(screen.queryByText('Field help')).not.toBeInTheDocument();
    fireEvent.submit(form!);
    await waitFor(() => expect(value.behavior.submitAction.onClick).toHaveBeenCalledOnce());
    expect(value.behavior.submitAction.onClick).toHaveBeenCalledWith({});
  });

  it('retains the existing fixed mobile action dock and aside when omitted', async () => {
    const { container } = renderSurface(<FormSurface config={config()} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const submit = await screen.findByRole('button', { name: 'Save record' });
    expect(submit.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(screen.getByText('Field help')).toBeInTheDocument();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
  });
});
