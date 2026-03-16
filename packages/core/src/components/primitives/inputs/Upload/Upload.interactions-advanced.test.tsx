import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Upload as ModernUpload, Dragger as ModernDragger } from './engines/modern';
import { Upload as RusticUpload, Dragger as RusticDragger } from './engines/rustic';
import { renderWithEngine } from '../../../../testing/helpers/engine-test-utils';

const imageFile = {
  uid: 'image',
  name: 'cover.png',
  status: 'done' as const,
  type: 'image/png',
  thumbUrl: 'https://example.com/cover.png',
};

const documentFile = {
  uid: 'doc',
  name: 'notes.pdf',
  status: 'done' as const,
  type: 'application/pdf',
};

describe.each([
  ['modern', ModernUpload, ModernDragger],
  ['rustic', RusticUpload, RusticDragger],
] as const)('Upload interaction coverage %s engine', (engine, UploadComponent, DraggerComponent) => {
  it('covers preview modal close paths and overlay removal actions in picture-card mode', async () => {
    const handleRemove = vi.fn().mockResolvedValue(true);
    const handleChange = vi.fn();

    renderWithEngine(
      <UploadComponent
        listType="picture-card"
        defaultFileList={[imageFile, documentFile]}
        onRemove={handleRemove}
        onChange={handleChange}
      />,
      engine
    );

    const imageItem = screen.getByRole('listitem', { name: 'cover.png' });
    fireEvent.mouseEnter(imageItem);
    fireEvent.click(await screen.findByRole('button', { name: 'Preview cover.png' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('dialog'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    fireEvent.mouseEnter(imageItem);
    fireEvent.click(await screen.findByRole('button', { name: 'Preview cover.png' }));
    fireEvent.click(await screen.findByRole('button', { name: /close preview/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const documentItem = screen.getByRole('listitem', { name: 'notes.pdf' });
    fireEvent.mouseEnter(documentItem);
    fireEvent.click(await screen.findByRole('button', { name: 'Remove notes.pdf' }));

    await waitFor(() => {
      expect(handleRemove).toHaveBeenCalledWith(expect.objectContaining({ name: 'notes.pdf' }));
    });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'removed', name: 'notes.pdf' }),
      })
    );
  });

  it('covers keyboard-triggered uploads for picture add buttons and default trigger buttons', async () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { rerender } = renderWithEngine(
      <UploadComponent listType="picture-circle" />,
      engine
    );

    const addButton = screen.getByRole('button', { name: 'Add file' });
    fireEvent.keyDown(addButton, { key: 'Enter' });
    fireEvent.keyDown(addButton, { key: ' ' });

    rerender(<UploadComponent>Upload from keyboard</UploadComponent>);

    fireEvent.click(screen.getByText('Upload from keyboard'));

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('covers dragger click + keyboard entry points and default preview modal handling', async () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderWithEngine(
      <DraggerComponent listType="picture" defaultFileList={[imageFile]}>
        Drop or click
      </DraggerComponent>,
      engine
    );

    const dropzone = screen.getByText('Drop or click').closest('[role="button"]');
    if (!dropzone) {
      throw new Error('Expected dragger button');
    }

    fireEvent.click(dropzone);
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();

    fireEvent.click(screen.getByRole('img', { name: 'cover.png' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
