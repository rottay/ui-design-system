/**
 * usePdfExport Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePdfExport } from '../pdf-export';
import type { PdfExportOptions } from '../pdf-export';

// ============================================================================
// Mocks
// ============================================================================

let lastBlobContent: string | null = null;
let lastDownloadFilename: string | null = null;

const mockObjectUrl = 'blob:mock-url';

beforeEach(() => {
  lastBlobContent = null;
  lastDownloadFilename = null;

  // Mock Blob constructor to capture content
  vi.spyOn(globalThis, 'Blob').mockImplementation((parts?: any[]) => {
    lastBlobContent = parts?.[0] ?? null;
    return { size: lastBlobContent?.length ?? 0, type: '' } as Blob;
  });

  URL.createObjectURL = vi.fn().mockReturnValue(mockObjectUrl);
  URL.revokeObjectURL = vi.fn();

  // Intercept anchor clicks to capture the download filename
  const originalAppendChild = document.body.appendChild.bind(document.body);
  vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
    if (node instanceof HTMLAnchorElement) {
      lastDownloadFilename = node.download;
      node.click = vi.fn();
      return originalAppendChild(node);
    }
    // For iframes (used by printElement), just return the node
    if (node instanceof HTMLIFrameElement) {
      return originalAppendChild(node);
    }
    return originalAppendChild(node);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// Test Data
// ============================================================================

interface TestUser {
  id: number;
  name: string;
  email: string;
  balance: number;
  createdAt: string;
  active: boolean;
}

const testUsers: TestUser[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    balance: 1500.5,
    createdAt: '2026-01-15T10:30:00Z',
    active: true,
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    balance: 250.0,
    createdAt: '2026-02-20T14:00:00Z',
    active: false,
  },
  {
    id: 3,
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    balance: 0,
    createdAt: '2026-03-01T09:00:00Z',
    active: true,
  },
];

const basicColumns = [
  { key: 'name', header: 'Full Name' },
  { key: 'email', header: 'Email' },
];

// ============================================================================
// Tests
// ============================================================================

describe('usePdfExport', () => {
  // --------------------------------------------------------------------------
  // Initial State
  // --------------------------------------------------------------------------
  describe('Initial State', () => {
    it('starts with isExporting false', () => {
      const { result } = renderHook(() => usePdfExport());
      expect(result.current.isExporting).toBe(false);
    });

    it('provides all export functions', () => {
      const { result } = renderHook(() => usePdfExport());

      expect(typeof result.current.printElement).toBe('function');
      expect(typeof result.current.preparePdfData).toBe('function');
      expect(typeof result.current.generatePrintHtml).toBe('function');
      expect(typeof result.current.downloadAsHtml).toBe('function');
    });
  });

  // --------------------------------------------------------------------------
  // preparePdfData
  // --------------------------------------------------------------------------
  describe('preparePdfData', () => {
    it('returns headers from column definitions', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData(testUsers, basicColumns);

      expect(tableData.headers).toEqual(['Full Name', 'Email']);
    });

    it('maps data through columns into string rows', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData(testUsers, basicColumns);

      expect(tableData.rows).toHaveLength(3);
      expect(tableData.rows[0]).toEqual(['Alice Johnson', 'alice@example.com']);
      expect(tableData.rows[1]).toEqual(['Bob Smith', 'bob@example.com']);
      expect(tableData.rows[2]).toEqual(['Charlie Brown', 'charlie@example.com']);
    });

    it('applies custom render functions', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData(testUsers, [
        { key: 'name', header: 'Name' },
        {
          key: 'balance',
          header: 'Balance',
          render: (v: number) => `$${v.toFixed(2)}`,
        },
        {
          key: 'active',
          header: 'Status',
          render: (v: boolean) => (v ? 'Active' : 'Inactive'),
        },
      ]);

      expect(tableData.rows[0]).toEqual(['Alice Johnson', '$1500.50', 'Active']);
      expect(tableData.rows[1]).toEqual(['Bob Smith', '$250.00', 'Inactive']);
    });

    it('handles null and undefined values gracefully', () => {
      const { result } = renderHook(() => usePdfExport());

      const data = [{ name: null, email: undefined }] as any[];
      const tableData = result.current.preparePdfData(data, basicColumns);

      expect(tableData.rows[0]).toEqual(['', '']);
    });

    it('treats callable data rows as empty values', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData([(() => undefined) as any], basicColumns);

      expect(tableData.rows[0]).toEqual(['', '']);
    });

    it('handles empty data array', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData([], basicColumns);

      expect(tableData.headers).toEqual(['Full Name', 'Email']);
      expect(tableData.rows).toHaveLength(0);
    });

    it('serializes object values as JSON when no render function provided', () => {
      const { result } = renderHook(() => usePdfExport());

      const data = [{ name: 'Alice', metadata: { role: 'admin', level: 3 } }];
      const tableData = result.current.preparePdfData(data, [
        { key: 'name', header: 'Name' },
        { key: 'metadata', header: 'Metadata' },
      ]);

      expect(tableData.rows[0][1]).toBe('{"role":"admin","level":3}');
    });

    it('falls back to String(value) when render throws', () => {
      const { result } = renderHook(() => usePdfExport());

      const data = [{ name: 'Alice', email: 'alice@test.com' }];
      const tableData = result.current.preparePdfData(data, [
        {
          key: 'name',
          header: 'Name',
          render: () => {
            throw new Error('render crash');
          },
        },
        { key: 'email', header: 'Email' },
      ]);

      expect(tableData.rows[0]).toEqual(['Alice', 'alice@test.com']);
    });

    it('includes title from hook options', () => {
      const { result } = renderHook(() =>
        usePdfExport({ title: 'Sales Report' })
      );

      const tableData = result.current.preparePdfData(testUsers, basicColumns);

      expect(tableData.title).toBe('Sales Report');
    });

    it('title is undefined when not configured', () => {
      const { result } = renderHook(() => usePdfExport());

      const tableData = result.current.preparePdfData(testUsers, basicColumns);

      expect(tableData.title).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // generatePrintHtml
  // --------------------------------------------------------------------------
  describe('generatePrintHtml', () => {
    it('returns a complete HTML document', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Hello</p>');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    });

    it('includes the provided content', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml(
        '<table><tr><td>Data</td></tr></table>'
      );

      expect(html).toContain('<table><tr><td>Data</td></tr></table>');
    });

    it('includes @page print CSS rules', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('@media print');
      expect(html).toContain('@page');
    });

    it('applies A4 portrait by default', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('size: A4 portrait');
    });

    it('applies landscape orientation when configured', () => {
      const { result } = renderHook(() =>
        usePdfExport({ orientation: 'landscape' })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('size: A4 landscape');
    });

    it('applies letter paper size', () => {
      const { result } = renderHook(() =>
        usePdfExport({ paperSize: 'letter' })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('size: letter portrait');
    });

    it('applies legal paper size', () => {
      const { result } = renderHook(() =>
        usePdfExport({ paperSize: 'legal' })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('size: legal portrait');
    });

    it('applies custom margins', () => {
      const { result } = renderHook(() =>
        usePdfExport({
          margins: { top: 10, right: 15, bottom: 10, left: 15 },
        })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('margin: 10mm 15mm 10mm 15mm');
    });

    it('applies default 20mm margins when none specified', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('margin: 20mm 20mm 20mm 20mm');
    });

    it('includes title in header when configured', () => {
      const { result } = renderHook(() =>
        usePdfExport({ title: 'Monthly Report' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('Monthly Report');
      expect(html).toContain('pdf-export-header');
    });

    it('escapes HTML in title', () => {
      const { result } = renderHook(() =>
        usePdfExport({ title: 'Report <script>alert("xss")</script>' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('includes date when includeDate is true', () => {
      const { result } = renderHook(() =>
        usePdfExport({ includeDate: true, title: 'Test' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('pdf-export-meta');
      // Should contain a year (current date)
      expect(html).toContain(new Date().getFullYear().toString());
    });

    it('includes branding placeholder when includeBranding is true', () => {
      const { result } = renderHook(() =>
        usePdfExport({ includeBranding: true, title: 'Test' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('pdf-export-branding');
      expect(html).toContain('[Tenant Branding]');
    });

    it('includes custom headerHtml', () => {
      const { result } = renderHook(() =>
        usePdfExport({
          headerHtml: '<div class="logo">ACME Corp</div>',
        })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('<div class="logo">ACME Corp</div>');
    });

    it('includes custom footerHtml', () => {
      const { result } = renderHook(() =>
        usePdfExport({
          footerHtml: '<span>Confidential</span>',
        })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('pdf-export-footer');
      expect(html).toContain('<span>Confidential</span>');
    });

    it('does not include footer section when footerHtml is not set', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Content</p>');

      // The CSS class definition exists in the stylesheet, but no footer
      // element should be rendered in the body
      expect(html).not.toContain('<div class="pdf-export-footer">');
    });

    it('accepts override options', () => {
      const { result } = renderHook(() =>
        usePdfExport({ orientation: 'portrait', title: 'Default Title' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>', {
        orientation: 'landscape',
        title: 'Override Title',
      });

      expect(html).toContain('size: A4 landscape');
      expect(html).toContain('Override Title');
    });

    it('includes print-specific CSS rules for tables', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('page-break-inside: auto');
      expect(html).toContain('page-break-inside: avoid');
      expect(html).toContain('page-break-after: avoid');
    });

    it('includes .no-print hiding rule', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('.no-print');
      expect(html).toContain('display: none !important');
    });

    it('handles HTMLElement content', () => {
      const el = document.createElement('div');
      el.innerHTML = '<span>Element content</span>';

      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml(el);

      expect(html).toContain('<span>Element content</span>');
    });

    it('sets document title from options', () => {
      const { result } = renderHook(() =>
        usePdfExport({ title: 'My Report' })
      );

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('<title>My Report</title>');
    });

    it('uses "Export" as default document title', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Content</p>');

      expect(html).toContain('<title>Export</title>');
    });
  });

  // --------------------------------------------------------------------------
  // downloadAsHtml
  // --------------------------------------------------------------------------
  describe('downloadAsHtml', () => {
    it('triggers a file download with .html extension', () => {
      const { result } = renderHook(() =>
        usePdfExport({ filename: 'report' })
      );

      act(() => {
        result.current.downloadAsHtml('<p>Content</p>');
      });

      expect(lastDownloadFilename).toBe('report.html');
    });

    it('uses default filename when not specified', () => {
      const { result } = renderHook(() => usePdfExport());

      act(() => {
        result.current.downloadAsHtml('<p>Content</p>');
      });

      expect(lastDownloadFilename).toBe('export.html');
    });

    it('downloads a complete HTML document', () => {
      const { result } = renderHook(() =>
        usePdfExport({ title: 'Test Doc' })
      );

      act(() => {
        result.current.downloadAsHtml('<p>My content</p>');
      });

      expect(lastBlobContent).not.toBeNull();
      expect(lastBlobContent).toContain('<!DOCTYPE html>');
      expect(lastBlobContent).toContain('<p>My content</p>');
      expect(lastBlobContent).toContain('Test Doc');
    });

    it('includes print CSS in downloaded file', () => {
      const { result } = renderHook(() =>
        usePdfExport({ orientation: 'landscape', paperSize: 'letter' })
      );

      act(() => {
        result.current.downloadAsHtml('<p>Content</p>');
      });

      expect(lastBlobContent).toContain('@media print');
      expect(lastBlobContent).toContain('size: letter landscape');
    });

    it('handles HTMLElement content', () => {
      const el = document.createElement('div');
      el.innerHTML = '<strong>Bold text</strong>';

      const { result } = renderHook(() => usePdfExport());

      act(() => {
        result.current.downloadAsHtml(el);
      });

      expect(lastBlobContent).toContain('<strong>Bold text</strong>');
    });

    it('resets isExporting after download', () => {
      const { result } = renderHook(() => usePdfExport());

      act(() => {
        result.current.downloadAsHtml('<p>Content</p>');
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // printElement
  // --------------------------------------------------------------------------
  describe('printElement', () => {
    it('does nothing when element is null', () => {
      const { result } = renderHook(() => usePdfExport());

      act(() => {
        result.current.printElement(null);
      });

      // Should not throw, isExporting stays false
      expect(result.current.isExporting).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Options merging
  // --------------------------------------------------------------------------
  describe('Options merging', () => {
    it('uses hook-level options as defaults', () => {
      const { result } = renderHook(() =>
        usePdfExport({
          title: 'Hook Title',
          orientation: 'landscape',
          paperSize: 'letter',
        })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>');

      expect(html).toContain('Hook Title');
      expect(html).toContain('size: letter landscape');
    });

    it('overrides merge correctly with generatePrintHtml', () => {
      const { result } = renderHook(() =>
        usePdfExport({
          title: 'Default',
          paperSize: 'a4',
          orientation: 'portrait',
        })
      );

      const html = result.current.generatePrintHtml('<p>Test</p>', {
        title: 'Override',
        orientation: 'landscape',
      });

      // Title should be overridden
      expect(html).toContain('Override');
      // Orientation should be overridden
      expect(html).toContain('landscape');
      // Paper size should come from base (a4)
      expect(html).toContain('A4');
    });

    it('works with no options at all', () => {
      const { result } = renderHook(() => usePdfExport());

      const html = result.current.generatePrintHtml('<p>Minimal</p>');

      // Should produce valid HTML with defaults
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('size: A4 portrait');
      expect(html).toContain('margin: 20mm 20mm 20mm 20mm');
      expect(html).toContain('<p>Minimal</p>');
    });
  });
});
