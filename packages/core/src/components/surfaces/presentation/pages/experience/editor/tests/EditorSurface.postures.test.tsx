import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { EditorSurfaceConfig } from '../../../../../foundation/contracts';
import type { SurfacePostures } from '../../../../../foundation/contracts/postures';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { EditorSurface } from '..';

function config(): EditorSurfaceConfig {
  return {
    visual: { layout: 'split', previewWidth: 300 },
    presentation: { chrome: { title: 'Compose' }, preview: <div>Review copy</div> },
    behavior: { initialValue: 'Draft', saveAction: { id: 'save', label: 'Save draft', onClick: vi.fn() } },
  };
}

const postures: SurfacePostures = {
  phone: { regions: { preview: 'hide' }, density: 'compact', primaryAction: 'floating' },
  desktop: { regions: { preview: 'render' }, primaryAction: 'app-bar' },
};

describe('EditorSurface postures', () => {
  it('preserves absent toolbar chrome when postures are omitted', async () => {
    const { container } = renderSurface(<EditorSurface config={config()} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByDisplayValue('Draft');
    const header = container.querySelector('.ds-editor .ds-section-card__header');
    expect(header).toHaveAttribute('data-has-actions', 'false');
    expect(header?.querySelector('[data-part="header-actions"]')).toBeNull();
  });

  it('does not create a posture dock for inaccessible actions', async () => {
    const value = config();
    value.access = { mode: 'resolved', capabilities: [] };
    const { container } = renderSurface(<EditorSurface config={value} postures={postures} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByDisplayValue('Draft');
    expect(screen.queryByRole('button', { name: 'Save draft' })).toBeNull();
    expect(container.querySelector('.ds-action-dock')).toBeNull();
  });

  it('keeps one save control and its current-value callback after relocation', async () => {
    const value = config();
    const { container } = renderSurface(<EditorSurface config={value} postures={postures} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    const input = await screen.findByDisplayValue('Draft');
    fireEvent.change(input, { target: { value: 'Edited' } });
    await screen.findByRole('button', { name: 'Save draft' });
    const save = screen.getAllByRole('button', { name: 'Save draft' });
    expect(save).toHaveLength(1);
    expect(save[0].closest('.ds-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(save[0].closest('.ds-action-dock')?.parentElement).toHaveClass('ds-page-shell-surface');
    fireEvent.click(save[0]);
    expect(value.behavior.saveAction?.onClick).toHaveBeenCalledOnce();
    expect(value.behavior.saveAction?.onClick).toHaveBeenCalledWith('Edited');
    expect(container.querySelector('[data-surface-region="preview"]')).toBeNull();
  });

  it('collapses a preview in its existing grid host and removes its content', async () => {
    const { container } = renderSurface(<EditorSurface config={config()} postures={{ phone: { regions: { preview: 'collapse' } } }} />, { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT });
    await screen.findByRole('button', { name: 'Save draft' });
    expect(screen.queryByText('Review copy')).not.toBeInTheDocument();
    expect(container.querySelector('[data-surface-region="preview"]')).toHaveAttribute('data-region-disposition', 'collapse');
    expect(container.querySelector('[data-surface-region="preview"]')?.childElementCount).toBe(0);
  });
});
