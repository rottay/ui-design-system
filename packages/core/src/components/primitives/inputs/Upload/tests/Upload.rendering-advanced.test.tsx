import React from 'react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Upload as ModernUpload } from '../engines/modern';
import { Upload as RusticUpload } from '../engines/rustic';
import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

const imageFile = {
  uid: 'image',
  name: 'avatar.png',
  status: 'done' as const,
  type: 'image/png',
  thumbUrl: 'https://example.com/avatar.png',
};

const uploadingImageFile = {
  uid: 'uploading',
  name: 'draft.png',
  status: 'uploading' as const,
  percent: 42,
  type: 'image/png',
  thumbUrl: 'https://example.com/draft.png',
};

const documentFile = {
  uid: 'document',
  name: 'brief.pdf',
  status: 'error' as const,
  type: 'application/pdf',
};

describe.each([
  ['modern', ModernUpload],
  ['rustic', RusticUpload],
] as const)('Upload rendering advanced %s engine coverage', (engine, UploadComponent) => {
  it('covers picture-card previews, custom itemRender wrappers, and progress gradients', async () => {
    const itemRender = vi.fn((originNode: React.ReactNode, file: { uid: string }) => (
      <div data-testid={`wrapped-${file.uid}`}>{originNode}</div>
    ));

    renderWithEngine(
      <UploadComponent
        listType="picture-card"
        defaultFileList={[imageFile, uploadingImageFile]}
        itemRender={itemRender}
        progress={{
          strokeColor: { from: '#111111', to: '#999999' },
          strokeWidth: 4,
        }}
      />,
      engine
    );

    expect(screen.getByTestId('wrapped-image')).toBeInTheDocument();
    expect(screen.getByTestId('wrapped-uploading')).toBeInTheDocument();
    expect(itemRender).toHaveBeenCalledTimes(2);

    const progressbar = screen.getByRole('progressbar', { name: /42%/ });
    expect(progressbar.style.getPropertyValue('--ds-upload-progress-fill')).toBe('linear-gradient(to right, #111111, #999999)');

    const imageItem = screen.getByRole('listitem', { name: 'avatar.png' });
    fireEvent.mouseEnter(imageItem);
    fireEvent.click(await screen.findByRole('button', { name: 'Preview avatar.png' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('covers picture-circle maxCount, directory attrs, and custom preview handlers', async () => {
    const onPreview = vi.fn();
    const { container } = renderWithEngine(
      <UploadComponent
        listType="picture-circle"
        maxCount={1}
        directory
        defaultFileList={[imageFile]}
        onPreview={onPreview}
      />,
      engine
    );

    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected upload input[type="file"] to exist');
    }

    expect(input.hasAttribute('directory') || input.hasAttribute('webkitdirectory')).toBe(true);
    expect(screen.queryByLabelText('Add file')).not.toBeInTheDocument();

    const imageItem = screen.getByRole('listitem', { name: 'avatar.png' });
    fireEvent.mouseEnter(imageItem);
    fireEvent.click(await screen.findByRole('button', { name: 'Preview avatar.png' }));

    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'avatar.png' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('covers picture-list non-image rendering, default trigger fallback, and hidden upload lists', async () => {
    const { rerender } = renderWithEngine(
      <UploadComponent listType="picture" defaultFileList={[documentFile]} />,
      engine
    );

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();

    const pictureItem = screen.getByRole('listitem', { name: 'brief.pdf' });
    expect(within(pictureItem).queryByRole('img')).not.toBeInTheDocument();

    rerender(
      <UploadComponent
        listType="picture"
        defaultFileList={[documentFile]}
        showUploadList={false}
      />
    );

    expect(screen.queryByRole('listitem', { name: 'brief.pdf' })).not.toBeInTheDocument();
  });
});
