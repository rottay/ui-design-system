/**
 * @fileoverview The export kernel: one owner for the three mechanics every
 * exporter in the package re-implemented -- escaping a cell for a delimited
 * document, joining rows into that document, handing a document to the browser
 * as a download, and writing text to the system clipboard.
 *
 * @remarks
 * The kernel owns document SHAPE and platform plumbing only. Cell policy stays
 * with the caller: which columns are exported, how a raw value becomes a
 * string, and whether a refused clipboard write is reported to the user are
 * decisions the calling surface makes, not this module.
 *
 * @module System/Data/ExportKernel
 * @category System
 * @package @rottay/design-system
 */

// ============================================================================
// Delimited documents
// ============================================================================

/**
 * Escape one cell for a delimited document, per RFC 4180.
 *
 * A value containing the delimiter, a double quote, or a line break is wrapped
 * in double quotes and its own quotes are doubled.
 *
 * @param value     - Cell text. Callers coerce their raw value first.
 * @param delimiter - Cell separator the document uses. Defaults to a comma.
 * @returns The cell, quoted only when quoting is required.
 */
export function escapeDelimited(value: string, delimiter: string = ','): string {
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Options controlling the shape of a delimited document.
 */
export interface SerializeDelimitedOptions {
  /** Cell separator. Defaults to a comma (CSV); pass `'\t'` for TSV. */
  delimiter?: string;

  /** Row separator. Defaults to `'\n'`; RFC 4180 writers pass `'\r\n'`. */
  rowSeparator?: string;

  /**
   * Prepend the UTF-8 byte order mark. Excel on Windows needs it to detect the
   * encoding; without it accented names and currency symbols arrive garbled.
   * @default false
   */
  byteOrderMark?: boolean;

  /**
   * Per-cell escape. Defaults to `escapeDelimited` bound to `delimiter`.
   * Surfaces whose format sanitizes rather than quotes (tab-separated
   * clipboard payloads) pass their own policy here.
   */
  escapeValue?: (value: string) => string;
}

/**
 * Join a grid of already-stringified cells into one delimited document.
 *
 * The header row, when there is one, is simply the first row: the kernel
 * applies the same escape to every row.
 *
 * @param rows    - Rows of cells, header row included.
 * @param options - Delimiter, row separator, BOM and escape policy.
 * @returns The serialized document.
 */
export function serializeDelimited(
  rows: readonly (readonly string[])[],
  options: SerializeDelimitedOptions = {},
): string {
  const { delimiter = ',', rowSeparator = '\n', byteOrderMark = false, escapeValue } = options;
  const escape = escapeValue ?? ((value: string) => escapeDelimited(value, delimiter));

  const document = rows.map((row) => row.map(escape).join(delimiter)).join(rowSeparator);

  return byteOrderMark ? `﻿${document}` : document;
}

// ============================================================================
// Downloads
// ============================================================================

/**
 * Hand content to the browser as a file download.
 *
 * Wraps the content in a Blob, clicks a detached anchor, then releases the
 * object URL. No-op outside the browser, so server rendering is safe.
 *
 * @param content  - File body.
 * @param filename - Download name, extension included.
 * @param mimeType - Blob type, charset included where it matters.
 */
export function downloadBlob(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Clipboard
// ============================================================================

/**
 * Options controlling how hard a clipboard write tries.
 */
export interface WriteClipboardOptions {
  /**
   * Fall back to `document.execCommand('copy')` from an off-screen textarea
   * when the Clipboard API is absent or refuses. Off by default: that path
   * moves the document selection, which a caller must opt into.
   * @default false
   */
  legacyFallback?: boolean;
}

/**
 * Write text to the system clipboard, reporting success instead of throwing.
 *
 * A caller decides what a `false` means for its surface: confirm nothing, offer
 * a recovery path, or stay silent. The kernel never claims a write it did not
 * make.
 *
 * @param text    - Text to place on the clipboard.
 * @param options - Whether to attempt the legacy `execCommand` path.
 * @returns `true` only when a write actually succeeded.
 */
export async function writeClipboard(
  text: string,
  options: WriteClipboardOptions = {},
): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API refused -- the legacy option decides what happens next.
  }

  if (!options.legacyFallback) return false;

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
