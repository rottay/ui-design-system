import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Upload as ModernUpload } from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const imageFile = {
  uid: 'image',
  name: 'avatar.png',
  status: 'done' as const,
  type: 'image/png',
  thumbUrl: 'https://example.com/avatar.png',
};

const uploadingFile = {
  uid: 'uploading',
  name: 'draft.png',
  status: 'uploading' as const,
  percent: 42,
  type: 'image/png',
  thumbUrl: 'https://example.com/draft.png',
};

/**
 * Modern-engine ownership contract (K2-V Pass 1): the engine stamps anatomy
 * and runtime hatches only; geometry/paint belongs to the upload.css skin and
 * the composed DS Progress primitive.
 */
describe('Upload modern engine ownership', () => {
  it('picture-card file items carry no inline styles; parts are skin-addressable', async () => {
    const { container } = renderWithEngine(
      <ModernUpload listType="picture-card" defaultFileList={[imageFile, uploadingFile]} />,
      'modern'
    );

    const items = container.querySelectorAll('[data-part="file-item"]');
    expect(items).toHaveLength(2);
    items.forEach((item) => {
      expect(item.getAttribute('style')).toBeNull();
    });

    // New skin-addressable parts replacing anonymous wrapper divs/spans.
    expect(container.querySelector('[data-part="file-thumb"]')).not.toBeNull();
    expect(container.querySelector('[data-part="file-progress"]')).not.toBeNull();

    // The composed Progress primitive renders (lazy engine resolution).
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    // Overlay actions render without inline styles once hovered.
    const firstItem = screen.getByRole('listitem', { name: 'avatar.png' });
    fireEvent.mouseEnter(firstItem);
    const removeAction = await screen.findByRole('button', { name: 'Remove avatar.png' });
    expect(removeAction.getAttribute('style')).toBeNull();
  });

  it('hidden file input is skin-hidden via data-part, not an inline style', () => {
    const { container } = renderWithEngine(<ModernUpload />, 'modern');
    const fileInput = container.querySelector('input[data-part="file-input"]');
    expect(fileInput).not.toBeNull();
    expect(fileInput?.getAttribute('style')).toBeNull();
  });

  it('preview modal carries no z-index utility literal; close button has no inline style', async () => {
    renderWithEngine(
      <ModernUpload listType="picture-card" defaultFileList={[imageFile]} />,
      'modern'
    );

    fireEvent.mouseEnter(screen.getByRole('listitem', { name: 'avatar.png' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Preview avatar.png' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-part', 'preview-modal');
    expect(dialog.className).not.toContain('z-[9999]');

    const closeButton = screen.getByRole('button', { name: 'Close preview' });
    expect(closeButton.getAttribute('style')).toBeNull();
  });

  it('dragger dropzone height rides the governed custom property channel', async () => {
    const { Dragger } = await import('../engines/modern');
    const { container } = renderWithEngine(<Dragger height={240} />, 'modern');

    const dropzone = container.querySelector('[data-part="dropzone"]');
    expect(dropzone).not.toBeNull();
    expect((dropzone as HTMLElement).style.getPropertyValue('--ds-upload-dropzone-height')).toBe('240px');
    // No plain inline height: block-size ownership sits in the skin.
    expect((dropzone as HTMLElement).style.height).toBe('');
  });
});
