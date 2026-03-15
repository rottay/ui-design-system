import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Upload as ModernUpload, Dragger as ModernDragger } from './engines/modern';
import { Upload as RusticUpload, Dragger as RusticDragger } from './engines/rustic';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

function makeFile(name: string, type = 'text/plain') {
  return new File([`file:${name}`], name, { type });
}

function getHiddenFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Expected upload input[type="file"] to exist');
  }
  return input;
}

describe.each([
  ['modern', ModernUpload, ModernDragger],
  ['rustic', RusticUpload, RusticDragger],
] as const)('Upload advanced %s engine coverage', (_engine, UploadComponent, DraggerComponent) => {
  it('covers controlled file lists, transformed beforeUpload results, hidden lists, and empty file changes', async () => {
    const handleChange = vi.fn();
    const transformedFile = makeFile('normalized.txt');
    const beforeUpload = vi.fn(async () => transformedFile);
    const controlledFileList = [{ uid: 'existing', name: 'existing.txt', status: 'done' as const }];

    const { container } = renderWithEngine(
      <UploadComponent
        fileList={controlledFileList}
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        Upload files
      </UploadComponent>,
      _engine
    );

    const input = getHiddenFileInput(container);

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [makeFile('raw.txt')],
        },
      });
    });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    expect(beforeUpload).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0]?.[0]?.file.name).toBe('normalized.txt');
    expect(handleChange.mock.calls[0]?.[0]?.fileList).toHaveLength(2);
    expect(screen.queryByText('existing.txt')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [],
        },
      });
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('covers disabled dragger guards for click/drop, rejected files, drag states, and removable dropped files', async () => {
    const disabledClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    const disabledDrop = vi.fn();
    const disabledChange = vi.fn();

    const { unmount } = renderWithEngine(
      <DraggerComponent disabled onDrop={disabledDrop} onChange={disabledChange}>
        Disabled dragger
      </DraggerComponent>,
      _engine
    );

    const disabledDropzone = screen.getByText('Disabled dragger').closest('div');
    if (!disabledDropzone) {
      throw new Error('Expected disabled dragger dropzone');
    }

    fireEvent.click(disabledDropzone);
    await act(async () => {
      fireEvent.drop(disabledDropzone, {
        dataTransfer: { files: [makeFile('blocked.txt')] },
      });
    });

    expect(disabledClickSpy).not.toHaveBeenCalled();
    expect(disabledDrop).not.toHaveBeenCalled();
    expect(disabledChange).not.toHaveBeenCalled();
    expect(screen.queryByText('blocked.txt')).not.toBeInTheDocument();
    disabledClickSpy.mockRestore();

    unmount();

    const handleDrop = vi.fn();
    const handleChange = vi.fn();
    const onRemove = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const beforeUpload = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    renderWithEngine(
      <DraggerComponent
        beforeUpload={beforeUpload}
        onDrop={handleDrop}
        onChange={handleChange}
        onRemove={onRemove}
      >
        Active dragger
      </DraggerComponent>,
      _engine
    );

    const activeDropzone = screen.getByText('Active dragger').closest('div');
    if (!activeDropzone) {
      throw new Error('Expected active dragger dropzone');
    }

    fireEvent.dragOver(activeDropzone);
    if (_engine === 'modern') {
      expect(activeDropzone.className).toContain('border-primary');
    } else {
      expect(activeDropzone.parentElement).toHaveClass('rottay-upload-dragger--drag-over');
    }

    fireEvent.dragLeave(activeDropzone);
    if (_engine === 'modern') {
      expect(activeDropzone.className).not.toContain('bg-primary/10');
    } else {
      expect(activeDropzone.parentElement).not.toHaveClass('rottay-upload-dragger--drag-over');
    }

    await act(async () => {
      fireEvent.drop(activeDropzone, {
        dataTransfer: { files: [makeFile('rejected.txt')] },
      });
    });

    await waitFor(() => {
      expect(beforeUpload).toHaveBeenCalledTimes(1);
    });
    expect(handleDrop).toHaveBeenCalledTimes(1);
    expect(handleChange).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.drop(activeDropzone, {
        dataTransfer: { files: [makeFile('accepted.txt')] },
      });
    });

    expect(await screen.findByText('accepted.txt')).toBeInTheDocument();

    const removeButton = await screen.findByRole('button', { name: 'Remove accepted.txt' });

    await act(async () => {
      fireEvent.click(removeButton);
    });
    expect(screen.getByText('accepted.txt')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('accepted.txt')).not.toBeInTheDocument();
    });

    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'removed' }),
      })
    );
  });
});
