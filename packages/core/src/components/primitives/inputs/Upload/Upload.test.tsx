import React, { createRef } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Upload } from '.';
import { renderWithEngine, STABLE_ENGINES } from '../../../../_internal/testing/helpers/engine-test-utils';

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

describe('Upload integration', () => {
  it.each(STABLE_ENGINES)('renders the live component with the %s engine', async (engine) => {
    const ref = createRef<HTMLDivElement>();

    const { container } = renderWithEngine(
      <Upload ref={ref} engine={engine}>
        Upload contract
      </Upload>,
      engine
    );

    expect(await screen.findByText('Upload contract')).toBeInTheDocument();
    expect(ref.current).toBeTruthy();
    expect(getHiddenFileInput(container)).toBeInTheDocument();
  });
});

describe.each(['modern', 'rustic'] as const)('Upload live %s engine', (engine) => {
  it('adds selected files and respects maxCount inside a single change event', async () => {
    const handleChange = vi.fn();
    const { container } = renderWithEngine(
      <Upload engine={engine} maxCount={1} onChange={handleChange}>
        Upload files
      </Upload>,
      engine
    );

    expect(await screen.findByText('Upload files')).toBeInTheDocument();
    const input = getHiddenFileInput(container);

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [makeFile('one.txt'), makeFile('two.txt')],
        },
      });
    });

    expect(await screen.findByText('one.txt')).toBeInTheDocument();
    expect(screen.queryByText('two.txt')).not.toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0]?.[0]?.fileList).toHaveLength(1);
  });

  it('honors beforeUpload when it rejects a file', async () => {
    const beforeUpload = vi.fn().mockResolvedValue(false);
    const handleChange = vi.fn();
    const { container } = renderWithEngine(
      <Upload engine={engine} beforeUpload={beforeUpload} onChange={handleChange}>
        Upload files
      </Upload>,
      engine
    );

    expect(await screen.findByText('Upload files')).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(getHiddenFileInput(container), {
        target: {
          files: [makeFile('blocked.txt')],
        },
      });
    });

    await waitFor(() => {
      expect(beforeUpload).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('blocked.txt')).not.toBeInTheDocument();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('removes files and lets onRemove block the deletion', async () => {
    const onRemove = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const { container, unmount } = renderWithEngine(
      <Upload
        engine={engine}
        onRemove={onRemove}
        defaultFileList={[
          { uid: '1', name: 'keep.txt', status: 'done' },
        ]}
      >
        Upload files
      </Upload>,
      engine
    );

    expect(await screen.findByText('keep.txt')).toBeInTheDocument();

    const firstRemoveButton = await screen.findByRole('button', { name: 'Remove keep.txt' });

    await act(async () => {
      fireEvent.click(firstRemoveButton);
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByText('keep.txt')).toBeInTheDocument();

    unmount();

    renderWithEngine(
      <Upload
        engine={engine}
        onRemove={onRemove}
        defaultFileList={[
          { uid: '2', name: 'drop.txt', status: 'done' },
        ]}
      >
        Upload files
      </Upload>,
      engine
    );

    expect(await screen.findByText('drop.txt')).toBeInTheDocument();
    const secondRemoveButton = await screen.findByRole('button', { name: 'Remove drop.txt' });

    await act(async () => {
      fireEvent.click(secondRemoveButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('drop.txt')).not.toBeInTheDocument();
    });

    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it('processes dropped files through the dragger flow', async () => {
    const onDrop = vi.fn();
    renderWithEngine(
      <Upload.Dragger engine={engine} onDrop={onDrop}>
        Drop files here
      </Upload.Dragger>,
      engine
    );

    expect(await screen.findByText('Drop files here')).toBeInTheDocument();
    const file = makeFile('dropped.txt');
    const dropTarget = screen.getByText('Drop files here').closest('div');

    if (!dropTarget) {
      throw new Error('Expected dragger drop target');
    }

    await act(async () => {
      fireEvent.drop(dropTarget, {
        dataTransfer: { files: [file] },
      });
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('dropped.txt')).toBeInTheDocument();
  });
});
