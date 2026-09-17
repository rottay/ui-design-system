/**
 * Export kernel contract.
 *
 * Every exporter in the package routes its escaping, document shape, download
 * and clipboard write through this owner, so an escaping or fallback change
 * here changes every export surface at once.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadBlob, escapeDelimited, serializeDelimited, writeClipboard } from '..';

// ============================================================================
// escapeDelimited
// ============================================================================

describe('escapeDelimited', () => {
  it('leaves a plain value untouched', () => {
    expect(escapeDelimited('Ada Lovelace')).toBe('Ada Lovelace');
  });

  it('quotes a value containing the delimiter', () => {
    expect(escapeDelimited('Lovelace, Ada')).toBe('"Lovelace, Ada"');
  });

  it('doubles embedded quotes and wraps the cell', () => {
    expect(escapeDelimited('say "hello"')).toBe('"say ""hello"""');
    expect(escapeDelimited('"')).toBe('""""');
  });

  it('quotes LF, CR and CRLF line breaks', () => {
    expect(escapeDelimited('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeDelimited('line1\rline2')).toBe('"line1\rline2"');
    expect(escapeDelimited('line1\r\nline2')).toBe('"line1\r\nline2"');
  });

  it('leaves an empty cell empty rather than quoting it', () => {
    expect(escapeDelimited('')).toBe('');
  });

  it('does not quote unicode that carries no delimiter meaning', () => {
    expect(escapeDelimited('Ångström — 日本語 🙂')).toBe('Ångström — 日本語 🙂');
  });

  it('keys quoting on the delimiter it is given, not on the comma', () => {
    expect(escapeDelimited('a,b', '\t')).toBe('a,b');
    expect(escapeDelimited('a\tb', '\t')).toBe('"a\tb"');
    expect(escapeDelimited('a\tb')).toBe('a\tb');
  });

  it('quotes a semicolon cell only under a semicolon delimiter', () => {
    expect(escapeDelimited('a;b', ';')).toBe('"a;b"');
    expect(escapeDelimited('a;b')).toBe('a;b');
  });
});

// ============================================================================
// serializeDelimited
// ============================================================================

describe('serializeDelimited', () => {
  const rows = [
    ['Name', 'Note'],
    ['Ada', 'first, and foremost'],
    ['Grace', 'said "hi"'],
  ];

  it('joins a grid with the CSV defaults', () => {
    expect(serializeDelimited(rows)).toBe(
      'Name,Note\nAda,"first, and foremost"\nGrace,"said ""hi"""',
    );
  });

  it('escapes the header row with the same policy as the data rows', () => {
    expect(serializeDelimited([['a,b', 'c']])).toBe('"a,b",c');
  });

  it('honours a CRLF row separator', () => {
    expect(serializeDelimited([['a'], ['b']], { rowSeparator: '\r\n' })).toBe('a\r\nb');
  });

  it('prepends the UTF-8 BOM only when asked', () => {
    expect(serializeDelimited([['a']], { byteOrderMark: true })).toBe('﻿a');
    expect(serializeDelimited([['a']])).toBe('a');
  });

  it('switches delimiter and quoting together', () => {
    expect(serializeDelimited([['a,b', 'c\td']], { delimiter: '\t' })).toBe('a,b\t"c\td"');
  });

  it('lets a caller replace the cell policy entirely', () => {
    const sanitize = (value: string): string => value.replace(/\t/g, ' ');
    expect(
      serializeDelimited([['a\tb', 'c']], { delimiter: '\t', escapeValue: sanitize }),
    ).toBe('a b\tc');
  });

  it('serializes a header-only grid without a trailing separator', () => {
    expect(serializeDelimited([['Name', 'Note']])).toBe('Name,Note');
  });

  it('serializes an empty grid as an empty document', () => {
    expect(serializeDelimited([])).toBe('');
    expect(serializeDelimited([], { byteOrderMark: true })).toBe('﻿');
  });

  it('keeps empty cells as empty positions', () => {
    expect(serializeDelimited([['', 'b', '']])).toBe(',b,');
  });

  it('keeps ragged rows at their own width', () => {
    expect(serializeDelimited([['a', 'b'], ['c']])).toBe('a,b\nc');
  });
});

// ============================================================================
// downloadBlob
// ============================================================================

describe('downloadBlob', () => {
  let createdUrls: string[];
  let revokedUrls: string[];
  let blobParts: unknown[];
  let blobTypes: string[];

  beforeEach(() => {
    createdUrls = [];
    revokedUrls = [];
    blobParts = [];
    blobTypes = [];

    vi.spyOn(globalThis, 'Blob').mockImplementation((function (this: Blob, parts?: BlobPart[], options?: BlobPropertyBag) {
      blobParts.push(parts?.[0]);
      blobTypes.push(options?.type ?? '');
      return { size: 0, type: options?.type ?? '' } as Blob;
    }) as (this: Blob, blobParts?: BlobPart[], options?: BlobPropertyBag) => Blob);

    URL.createObjectURL = vi.fn(() => {
      const url = `blob:mock-${createdUrls.length}`;
      createdUrls.push(url);
      return url;
    });
    URL.revokeObjectURL = vi.fn((url: string) => {
      revokedUrls.push(url);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wraps the content, clicks a detached anchor and releases the URL', () => {
    const clicks: HTMLAnchorElement[] = [];
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function click(this: HTMLAnchorElement) {
        clicks.push(this);
      });

    downloadBlob('id,name\n1,Ada', 'people.csv', 'text/csv;charset=utf-8');

    expect(blobParts).toEqual(['id,name\n1,Ada']);
    expect(blobTypes).toEqual(['text/csv;charset=utf-8']);
    expect(clicks).toHaveLength(1);
    expect(clicks[0].download).toBe('people.csv');
    expect(clicks[0].href).toBe('blob:mock-0');
    expect(clicks[0].style.display).toBe('none');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokedUrls).toEqual(createdUrls);
  });

  it('leaves no anchor behind in the document', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadBlob('body', 'report.html', 'text/html;charset=utf-8');

    expect(document.querySelector('a[download="report.html"]')).toBeNull();
  });

  it('is a no-op when there is no document to append to', () => {
    const documentSpy = vi
      .spyOn(globalThis, 'document', 'get')
      .mockReturnValue(undefined as unknown as Document);

    expect(() => downloadBlob('body', 'x.csv', 'text/csv')).not.toThrow();
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    documentSpy.mockRestore();
  });
});

// ============================================================================
// writeClipboard
// ============================================================================

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

describe('writeClipboard', () => {
  afterEach(() => {
    setClipboard(undefined);
    vi.restoreAllMocks();
  });

  it('reports success when the Clipboard API accepts the write', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    await expect(writeClipboard('payload')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('payload');
  });

  it('reports failure without throwing when the Clipboard API is absent', async () => {
    setClipboard(undefined);

    await expect(writeClipboard('payload')).resolves.toBe(false);
  });

  it('reports failure without throwing when the write is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setClipboard({ writeText });

    await expect(writeClipboard('payload')).resolves.toBe(false);
  });

  it('touches no DOM on the default path, so no selection is disturbed', async () => {
    setClipboard(undefined);
    const execCommand = vi.fn().mockReturnValue(true);
    (document as unknown as { execCommand: unknown }).execCommand = execCommand;
    const createElement = vi.spyOn(document, 'createElement');

    await expect(writeClipboard('payload')).resolves.toBe(false);

    expect(execCommand).not.toHaveBeenCalled();
    expect(createElement).not.toHaveBeenCalled();
  });

  it('falls back to execCommand from an off-screen textarea when opted in', async () => {
    setClipboard(undefined);
    const selected: string[] = [];
    vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(
      function select(this: HTMLTextAreaElement) {
        selected.push(this.value);
        expect(this.style.position).toBe('fixed');
        expect(this.style.left).toBe('-9999px');
        expect(this.isConnected).toBe(true);
      },
    );
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(true);

    await expect(writeClipboard('payload', { legacyFallback: true })).resolves.toBe(true);

    expect(selected).toEqual(['payload']);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    setClipboard({ writeText });
    vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(() => {});
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(true);

    await expect(writeClipboard('payload', { legacyFallback: true })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('payload');
  });

  it('reports the refusal when the legacy path itself declines', async () => {
    setClipboard(undefined);
    vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(() => {});
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(false);

    await expect(writeClipboard('payload', { legacyFallback: true })).resolves.toBe(false);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('reports failure when the legacy path throws', async () => {
    setClipboard(undefined);
    (document as unknown as { execCommand: unknown }).execCommand = vi.fn(() => {
      throw new Error('unsupported');
    });
    vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(() => {});

    await expect(writeClipboard('payload', { legacyFallback: true })).resolves.toBe(false);
  });
});
