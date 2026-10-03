import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuidedDraftFormSurface } from '..';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

const sections = [{ key: 'info', title: 'Information', render: () => <div>Field content</div> }];

describe('GuidedDraftForm postures', () => {
  it.each(['hide', 'collapse'] as const)('removes the template toggle and picker interaction when an open picker becomes %s', async (disposition) => {
    const onSelect = vi.fn();
    const templates = { items: [{ id: 'starter', name: 'Starter' }], onSelect };
    const view = renderSurface(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={vi.fn()} templates={templates} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const toggle = await screen.findByRole('button', { name: 'Templates' });
    expect(toggle).not.toHaveAttribute('aria-controls');
    fireEvent.click(toggle);
    await screen.findByText('Starter');
    expect(document.getElementById(screen.getByRole('button', { name: 'Hide templates' }).getAttribute('aria-controls')!)).toHaveAttribute('role', 'region');
    view.rerender(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={vi.fn()} templates={templates} postures={{ phone: { regions: { templates: disposition } } }} />);
    expect(screen.queryByRole('button', { name: /templates/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Starter')).not.toBeInTheDocument();
    const picker = view.container.querySelector('[data-surface-region="templates"]');
    if (disposition === 'hide') expect(picker).toBeNull();
    else expect(picker?.childElementCount).toBe(0);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('offers no template toggle when there are no template items', async () => {
    renderSurface(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={vi.fn()} submitLabel="Save record" templates={{ items: [], onSelect: vi.fn() }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByRole('button', { name: 'Save record' });
    expect(screen.queryByRole('button', { name: 'Templates' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Form templates' })).not.toBeInTheDocument();
  });

  it('keeps the omitted-posture template workflow and references only a mounted picker', async () => {
    const onSelect = vi.fn();
    renderSurface(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={vi.fn()} templates={{ items: [{ id: 'starter', name: 'Starter' }], onSelect }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const toggle = await screen.findByRole('button', { name: 'Templates' });
    expect(toggle).not.toHaveAttribute('aria-controls');
    fireEvent.click(toggle);
    const picker = await screen.findByRole('region', { name: 'Form templates' });
    expect(screen.getByRole('button', { name: 'Hide templates' })).toHaveAttribute('aria-controls', picker.id);
    fireEvent.click(await screen.findByText('Starter'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith('starter');
    expect(screen.queryByRole('region', { name: 'Form templates' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Templates' })).not.toHaveAttribute('aria-controls');
  });
  it('lets explicit placement override adapt without leaving a second sticky action owner', async () => {
    const onSubmit = vi.fn();
    const { container } = renderSurface(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={onSubmit} submitLabel="Save record" adapt={{ phone: { actionBar: 'sticky-bottom' } }} postures={{ phone: { primaryAction: 'floating', regions: { 'section-navigation': 'hide' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const submit = await screen.findByRole('button', { name: 'Save record' });
    expect(screen.getAllByRole('button', { name: 'Save record' })).toHaveLength(1);
    expect(submit.closest('.ds-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(container.querySelector('[data-part="submit-bar"]')).toHaveAttribute('data-action-bar', 'inline');
    expect(container.querySelector('[data-part="section-nav"]')).toBeNull();
    expect(screen.getByText('Field content')).toBeInTheDocument();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('keeps the original adaptive submit bar when postures are omitted', async () => {
    const { container } = renderSurface(<GuidedDraftFormSurface title="Edit record" sections={sections} onSubmit={vi.fn()} submitLabel="Save record" />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByRole('button', { name: 'Save record' });
    expect(container.querySelector('[data-part="submit-bar"]')).toHaveAttribute('data-action-bar', 'sticky-bottom');
    expect(container.querySelector('.ds-action-dock')).toBeNull();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
  });
});
