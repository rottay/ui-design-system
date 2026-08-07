import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Dragger } from '../engines/modern';
import { filterDroppedFiles } from '../runtime/upload-behavior';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

/**
 * Drop-path constraint parity.
 *
 * `accept` and `multiple` are enforced by the native `<input type="file">` on
 * the picker path. A drop never passes through that input, so the dropzone used
 * to ingest files the component had explicitly refused: a `.exe` into an
 * `accept="image/*"` zone, or a whole batch into a `multiple={false}` zone.
 */
const makeFile = (name: string, type: string) =>
  new File(['x'], name, { type });

const drop = (zone: Element, files: File[]) =>
  fireEvent.drop(zone, { dataTransfer: { files, types: ['Files'] } });

describe('Upload modern dropzone constraints', () => {
  it('rejects a dropped file that the declared accept list excludes', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <Dragger accept="image/*" multiple onChange={onChange} />,
      'modern'
    );
    const zone = container.querySelector('[data-part="dropzone"]') as HTMLElement;

    drop(zone, [makeFile('payload.exe', 'application/x-msdownload'), makeFile('shot.png', 'image/png')]);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const accepted = onChange.mock.calls.map(([info]) => info.file.name);
    expect(accepted).toContain('shot.png');
    expect(accepted).not.toContain('payload.exe');
  });

  it('drops nothing at all when no dropped file matches accept', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(<Dragger accept=".pdf" onChange={onChange} />, 'modern');
    const zone = container.querySelector('[data-part="dropzone"]') as HTMLElement;

    drop(zone, [makeFile('notes.txt', 'text/plain')]);

    await waitFor(() => expect(zone).toBeInTheDocument());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('takes only the first dropped file when multiple is false', async () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(<Dragger multiple={false} onChange={onChange} />, 'modern');
    const zone = container.querySelector('[data-part="dropzone"]') as HTMLElement;

    drop(zone, [makeFile('a.png', 'image/png'), makeFile('b.png', 'image/png')]);

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const accepted = onChange.mock.calls.map(([info]) => info.file.name);
    expect(accepted).toEqual(['a.png']);
  });
});

describe('filterDroppedFiles grammar', () => {
  const png = makeFile('a.png', 'image/png');
  const pdf = makeFile('a.pdf', 'application/pdf');
  const typeless = makeFile('report.PDF', '');

  it('matches extensions case-insensitively even without a MIME type', () => {
    expect(filterDroppedFiles([typeless, png], '.pdf', true)).toEqual([typeless]);
  });

  it('matches wildcard and exact MIME clauses', () => {
    expect(filterDroppedFiles([png, pdf], 'image/*', true)).toEqual([png]);
    expect(filterDroppedFiles([png, pdf], 'application/pdf', true)).toEqual([pdf]);
    expect(filterDroppedFiles([png, pdf], 'image/png, application/pdf', true)).toEqual([png, pdf]);
  });

  it('passes everything through when accept is absent', () => {
    expect(filterDroppedFiles([png, pdf], undefined, true)).toEqual([png, pdf]);
  });
});
