'use client';

/**
 * @fileoverview PDF Export Hook - Rottay Design System
 * @description React hook for generating PDF-ready content from DS components.
 * Since the design system does not bundle a PDF library (jsPDF, pdfmake, etc.),
 * this hook provides multiple export strategies:
 *
 * 1. **Print-to-PDF** - Opens the browser print dialog with optimized print CSS
 * 2. **Structured Data** - Returns `{ headers, rows }` for consumers using their own PDF library
 * 3. **Print HTML** - Generates a self-contained HTML document with print CSS
 * 4. **Download as HTML** - Triggers a `.html` file download that can be opened and printed
 *
 * All DOM operations are SSR-safe (guarded by browser detection).
 *
 * @example Basic print-to-PDF
 * ```tsx
 * import { usePdfExport } from '@rottay/design-system';
 *
 * function ReportPage() {
 *   const tableRef = useRef<HTMLDivElement>(null);
 *   const { printElement, isExporting } = usePdfExport({
 *     title: 'Monthly Report',
 *     orientation: 'landscape',
 *   });
 *
 *   return (
 *     <>
 *       <Box ref={tableRef}><MyTable /></Box>
 *       <Button onClick={() => printElement(tableRef.current)} disabled={isExporting}>
 *         Print PDF
 *       </Button>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Structured data for jsPDF/pdfmake
 * ```tsx
 * const { preparePdfData } = usePdfExport();
 *
 * const tableData = preparePdfData(users, [
 *   { key: 'name', header: 'Full Name' },
 *   { key: 'email', header: 'Email' },
 *   { key: 'createdAt', header: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
 * ]);
 * // tableData = { headers: ['Full Name', 'Email', 'Joined'], rows: [['Alice', ...], ...] }
 * // Pass to jsPDF autoTable, pdfmake, etc.
 * ```
 *
 * @module System/Hooks/Data/PdfExport
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Page margin configuration in millimeters.
 */
export interface PdfMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Configuration options for PDF export.
 */
export interface PdfExportOptions {
  /** Document title displayed in the header. */
  title?: string;

  /**
   * Base filename for downloaded files (without extension).
   * @default 'export'
   */
  filename?: string;

  /**
   * Page orientation.
   * @default 'portrait'
   */
  orientation?: 'portrait' | 'landscape';

  /**
   * Paper size.
   * @default 'a4'
   */
  paperSize?: 'a4' | 'letter' | 'legal';

  /** Page margins in millimeters. Defaults to 20mm on all sides. */
  margins?: PdfMargins;

  /** Custom HTML to insert at the top of each page (e.g. a logo bar). */
  headerHtml?: string;

  /** Custom HTML to insert at the bottom of each page (e.g. disclaimer). */
  footerHtml?: string;

  /**
   * Whether to include the current date in the header.
   * @default false
   */
  includeDate?: boolean;

  /**
   * Whether to include tenant branding placeholder in the header.
   * @default false
   */
  includeBranding?: boolean;
}

/**
 * Structured table data for consumers using their own PDF library.
 */
export interface PdfTableData {
  /** Column header labels. */
  headers: string[];

  /** Two-dimensional array of string cell values. */
  rows: string[][];

  /** Optional table title. */
  title?: string;
}

/**
 * Column definition for mapping data to PDF table rows.
 */
export interface PdfExportColumn {
  /** Property key to read from each data item. */
  key: string;

  /** Display header for this column. */
  header: string;

  /**
   * Optional render function to format the raw value as a string.
   * If it throws, the hook falls back to `String(rawValue)`.
   */
  render?: (value: any) => string;
}

/**
 * Return type of the `usePdfExport` hook.
 */
export interface UsePdfExportReturn {
  /**
   * Opens the browser print dialog with the element's content rendered inside
   * a hidden iframe with optimized print CSS. Headers, footers, page rules,
   * and margins are applied automatically from options.
   */
  printElement: (element: HTMLElement | null) => void;

  /**
   * Maps an array of data items through column definitions and returns
   * structured `{ headers, rows, title }` ready for jsPDF autoTable,
   * pdfmake, or any other PDF library.
   */
  preparePdfData: <T>(
    data: T[],
    columns: PdfExportColumn[]
  ) => PdfTableData;

  /**
   * Generates a self-contained HTML document string with full print CSS,
   * `@page` rules, headers, footers, and DS token variables.
   * Can be opened in a browser and printed to PDF.
   */
  generatePrintHtml: (
    content: string | HTMLElement,
    overrides?: PdfExportOptions
  ) => string;

  /**
   * Downloads a self-contained HTML file generated via `generatePrintHtml`.
   * The consumer can open it in a browser and print to PDF.
   */
  downloadAsHtml: (content: string | HTMLElement) => void;

  /** Whether an export operation is currently in progress. */
  isExporting: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * CSS paper-size keywords for the @page `size` rule.
 */
const PAPER_SIZES: Record<string, string> = {
  a4: 'A4',
  letter: 'letter',
  legal: 'legal',
};

// ============================================================================
// Internal Utilities
// ============================================================================

/**
 * Check if we are running in a browser environment.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Read a value from a data item by key, returning empty string for nullish items.
 */
function readValue(item: any, key: string): any {
  if (item === null || item === undefined) return '';
  return item[key];
}

/**
 * Resolve a cell value to a string, applying the optional render function.
 */
function resolveCell(item: any, column: PdfExportColumn): string {
  const raw = readValue(item, column.key);

  if (column.render) {
    try {
      return column.render(raw);
    } catch {
      return String(raw ?? '');
    }
  }

  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}

/**
 * Build a full set of margins with defaults.
 */
function resolveMargins(margins?: PdfMargins): Required<PdfMargins> {
  return {
    top: margins?.top ?? 20,
    right: margins?.right ?? 20,
    bottom: margins?.bottom ?? 20,
    left: margins?.left ?? 20,
  };
}

/**
 * Merge two PdfExportOptions objects (overrides take precedence).
 */
function mergeOptions(
  base: PdfExportOptions | undefined,
  overrides: PdfExportOptions | undefined
): PdfExportOptions {
  if (!overrides) return base ?? {};
  if (!base) return overrides;
  return { ...base, ...overrides };
}

/**
 * Extract text content from an HTMLElement or return the string as-is.
 */
function resolveContent(content: string | HTMLElement): string {
  if (typeof content === 'string') return content;
  if (!isBrowser()) return '';
  return content.outerHTML;
}

/**
 * Format the current date in a locale-friendly way.
 */
function formatDate(): string {
  return new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build the print-optimized CSS block.
 */
function buildPrintCss(opts: PdfExportOptions): string {
  const margins = resolveMargins(opts.margins);
  const size = PAPER_SIZES[opts.paperSize ?? 'a4'] ?? 'A4';
  const orientation = opts.orientation ?? 'portrait';

  return `
    @media print {
      @page {
        size: ${size} ${orientation};
        margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, sans-serif;
        color: #000;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .no-print {
        display: none !important;
      }

      /* Table page-break rules */
      table {
        page-break-inside: auto;
        border-collapse: collapse;
        width: 100%;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      /* Heading page-break rules */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }

      /* Image handling */
      img {
        max-width: 100% !important;
        page-break-inside: avoid;
      }

      /* Link URLs - show href in print */
      a[href]:after {
        content: none;
      }
    }

    /* Screen styles for the print document itself */
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.5;
      margin: 0;
      padding: 20px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .pdf-export-header {
      border-bottom: 2px solid #333;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .pdf-export-header h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
    }

    .pdf-export-header .pdf-export-meta {
      color: #666;
      font-size: 12px;
    }

    .pdf-export-footer {
      border-top: 1px solid #ccc;
      padding-top: 12px;
      margin-top: 20px;
      color: #666;
      font-size: 11px;
    }

    .pdf-export-content {
      min-height: 100px;
    }
  `;
}

/**
 * Build the document header HTML.
 */
function buildHeader(opts: PdfExportOptions): string {
  const parts: string[] = [];

  if (opts.headerHtml) {
    parts.push(opts.headerHtml);
  }

  const hasTitle = !!opts.title;
  const hasDate = opts.includeDate === true;
  const hasBranding = opts.includeBranding === true;

  if (hasTitle || hasDate || hasBranding) {
    const metaParts: string[] = [];

    if (hasDate) {
      metaParts.push(formatDate());
    }
    if (hasBranding) {
      metaParts.push('<span class="pdf-export-branding">[Tenant Branding]</span>');
    }

    parts.push('<div class="pdf-export-header">');
    if (hasTitle) {
      parts.push(`  <h1>${escapeHtml(opts.title!)}</h1>`);
    }
    if (metaParts.length > 0) {
      parts.push(`  <div class="pdf-export-meta">${metaParts.join(' | ')}</div>`);
    }
    parts.push('</div>');
  }

  return parts.join('\n');
}

/**
 * Build the document footer HTML.
 */
function buildFooter(opts: PdfExportOptions): string {
  if (!opts.footerHtml) return '';
  return `<div class="pdf-export-footer">${opts.footerHtml}</div>`;
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Trigger a file download in the browser via a temporary anchor element.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  if (!isBrowser()) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for generating PDF-ready content from Design System components.
 *
 * Provides four export strategies without bundling a PDF library:
 *
 * 1. `printElement` - Print-to-PDF via hidden iframe and `window.print()`
 * 2. `preparePdfData` - Structured table data for jsPDF / pdfmake consumers
 * 3. `generatePrintHtml` - Full HTML document with print CSS
 * 4. `downloadAsHtml` - Download an HTML file for manual print-to-PDF
 *
 * @param options - Default export configuration
 * @returns Export functions and loading state
 *
 * @example
 * ```tsx
 * const { printElement, preparePdfData, isExporting } = usePdfExport({
 *   title: 'Sales Report',
 *   orientation: 'landscape',
 *   includeDate: true,
 * });
 * ```
 */
export function usePdfExport(options?: PdfExportOptions): UsePdfExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  // Use a ref so callbacks always see the latest options without re-creation
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // ------------------------------------------------------------------
  // Method 1: Print Element via hidden iframe
  // ------------------------------------------------------------------
  const printElement = useCallback((element: HTMLElement | null): void => {
    if (!isBrowser() || !element) return;

    setIsExporting(true);

    try {
      const opts = optionsRef.current ?? {};
      const printHtml = buildFullHtmlDocument(element.innerHTML, opts);

      // A hidden iframe is used instead of window.print() on the main document
      // because it isolates the print content from the application's own styles
      // and lets us inject custom @page rules, headers, and footers without
      // affecting the main page layout.
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        setIsExporting(false);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(printHtml);
      iframeDoc.close();

      // Wait for content to render before printing
      const handleLoad = (): void => {
        try {
          iframe.contentWindow?.print();
        } finally {
          // Cleanup after a short delay to allow the print dialog to open
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
            setIsExporting(false);
          }, 100);
        }
      };

      // Use iframe load event, with a fallback timeout
      iframe.addEventListener('load', handleLoad);

      // Safety timeout: some browsers (especially in CI environments) do not
      // fire the iframe load event reliably. After 2 seconds we proceed anyway
      // to avoid leaving the user stuck in a "printing" state.
      setTimeout(() => {
        iframe.removeEventListener('load', handleLoad);
        handleLoad();
      }, 2000);
    } catch {
      setIsExporting(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Method 2: Prepare structured PDF data
  // ------------------------------------------------------------------
  const preparePdfData = useCallback(
    <T,>(data: T[], columns: PdfExportColumn[]): PdfTableData => {
      const opts = optionsRef.current ?? {};

      const headers = columns.map((col) => col.header);
      const rows = data.map((item) =>
        columns.map((col) => resolveCell(item, col))
      );

      return {
        headers,
        rows,
        title: opts.title,
      };
    },
    []
  );

  // ------------------------------------------------------------------
  // Method 3: Generate print-friendly HTML string
  // ------------------------------------------------------------------
  const generatePrintHtml = useCallback(
    (content: string | HTMLElement, overrides?: PdfExportOptions): string => {
      const mergedOpts = mergeOptions(optionsRef.current, overrides);
      const contentHtml = resolveContent(content);
      return buildFullHtmlDocument(contentHtml, mergedOpts);
    },
    []
  );

  // ------------------------------------------------------------------
  // Method 4: Download as HTML file
  // ------------------------------------------------------------------
  const downloadAsHtml = useCallback(
    (content: string | HTMLElement): void => {
      if (!isBrowser()) return;

      setIsExporting(true);

      try {
        const opts = optionsRef.current ?? {};
        const html = generatePrintHtml(content);
        const filename = `${opts.filename ?? 'export'}.html`;

        downloadFile(html, filename, 'text/html;charset=utf-8');
      } finally {
        setIsExporting(false);
      }
    },
    [generatePrintHtml]
  );

  return {
    printElement,
    preparePdfData,
    generatePrintHtml,
    downloadAsHtml,
    isExporting,
  };
}

// ============================================================================
// Full HTML Document Builder
// ============================================================================

/**
 * Build a complete, self-contained HTML document with print CSS, header,
 * content, and footer.
 */
function buildFullHtmlDocument(
  contentHtml: string,
  opts: PdfExportOptions
): string {
  const css = buildPrintCss(opts);
  const header = buildHeader(opts);
  const footer = buildFooter(opts);
  const title = opts.title ? escapeHtml(opts.title) : 'Export';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  ${header}
  <div class="pdf-export-content">
    ${contentHtml}
  </div>
  ${footer}
</body>
</html>`;
}
