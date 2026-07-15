/**
 * useTableExport Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableExport } from '../table-export';

// ============================================================================
// Mocks
// ============================================================================

// Track blob content and download triggers
let lastBlobContent: string | null = null;
let lastDownloadFilename: string | null = null;
let lastAnchorHref: string | null = null;

const mockObjectUrl = 'blob:mock-url';

beforeEach(() => {
  lastBlobContent = null;
  lastDownloadFilename = null;
  lastAnchorHref = null;

  // Mock Blob constructor to capture content
  vi.spyOn(globalThis, 'Blob').mockImplementation((parts?: any[]) => {
    lastBlobContent = parts?.[0] ?? null;
    return { size: lastBlobContent?.length ?? 0, type: '' } as Blob;
  });

  // jsdom doesn't provide URL.createObjectURL/revokeObjectURL, so assign them
  URL.createObjectURL = vi.fn().mockReturnValue(mockObjectUrl);
  URL.revokeObjectURL = vi.fn();

  // Intercept anchor clicks via document.body.appendChild
  // The downloadFile function creates an anchor, appends it, clicks it, removes it.
  // We intercept appendChild to capture the anchor's download attribute.
  const originalAppendChild = document.body.appendChild.bind(document.body);
  vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
    if (node instanceof HTMLAnchorElement) {
      lastDownloadFilename = node.download;
      lastAnchorHref = node.href;
      // Mock click - it's a no-op since we're just capturing metadata
      node.click = vi.fn();
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
    name: 'Charlie "Chuck" Brown',
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

describe('useTableExport', () => {
  describe('Initial State', () => {
    it('starts with isExporting false', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
        })
      );

      expect(result.current.isExporting).toBe(false);
    });

    it('provides all export functions', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
        })
      );

      expect(typeof result.current.exportCsv).toBe('function');
      expect(typeof result.current.exportJson).toBe('function');
      expect(typeof result.current.exportClipboard).toBe('function');
    });
  });

  describe('CSV Export', () => {
    it('generates CSV with header row', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      expect(lastBlobContent).not.toBeNull();
      // Remove BOM
      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      expect(lines[0]).toBe('Full Name,Email');
      expect(lines[1]).toBe('Alice Johnson,alice@example.com');
      expect(lines[2]).toBe('Bob Smith,bob@example.com');
    });

    it('escapes values containing commas', () => {
      const data = [{ name: 'Last, First', email: 'test@test.com' }];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      expect(lines[1]).toBe('"Last, First",test@test.com');
    });

    it('escapes values containing double quotes', () => {
      const data = [{ name: 'Charlie "Chuck" Brown', email: 'c@test.com' }];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      // Quotes inside the value should be doubled, and the value wrapped in quotes
      expect(lines[1]).toBe('"Charlie ""Chuck"" Brown",c@test.com');
    });

    it('escapes values containing newlines', () => {
      const data = [{ name: 'Line1\nLine2', email: 'test@test.com' }];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      // The value with a newline should be wrapped in quotes
      expect(content).toContain('"Line1\nLine2"');
    });

    it('applies custom column renderers', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: [
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
          ],
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      expect(lines[0]).toBe('Name,Balance,Status');
      expect(lines[1]).toBe('Alice Johnson,$1500.50,Active');
      expect(lines[2]).toBe('Bob Smith,$250.00,Inactive');
    });

    it('uses default filename when not specified', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      expect(lastDownloadFilename).toBe('export.csv');
    });

    it('uses custom filename', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
          filename: 'users-2026',
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      expect(lastDownloadFilename).toBe('users-2026.csv');
    });

    it('includes UTF-8 BOM for Excel compatibility', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      expect(lastBlobContent).not.toBeNull();
      expect(lastBlobContent!.startsWith('\uFEFF')).toBe(true);
    });

    it('handles null and undefined values', () => {
      const data = [
        { name: null, email: undefined },
      ] as any[];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      // Both should be empty strings
      expect(lines[1]).toBe(',');
    });

    it('treats callable data rows as empty values', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: [(() => undefined) as any],
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      expect(content.split('\r\n')[1]).toBe(',');
    });

    it('handles empty data array', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: [],
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      // Only header row
      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe('Full Name,Email');
    });
  });

  describe('JSON Export', () => {
    it('generates pretty-printed JSON with column headers as keys', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers.slice(0, 1),
          columns: basicColumns,
        })
      );

      act(() => {
        result.current.exportJson();
      });

      expect(lastBlobContent).not.toBeNull();
      const parsed = JSON.parse(lastBlobContent!);

      expect(parsed).toEqual([
        {
          'Full Name': 'Alice Johnson',
          'Email': 'alice@example.com',
        },
      ]);
    });

    it('applies custom renderers in JSON output', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers.slice(0, 1),
          columns: [
            { key: 'name', header: 'Name' },
            {
              key: 'balance',
              header: 'Balance',
              render: (v: number) => `$${v.toFixed(2)}`,
            },
          ],
        })
      );

      act(() => {
        result.current.exportJson();
      });

      const parsed = JSON.parse(lastBlobContent!);
      expect(parsed[0].Balance).toBe('$1500.50');
    });

    it('uses correct filename with .json extension', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers,
          columns: basicColumns,
          filename: 'my-data',
        })
      );

      act(() => {
        result.current.exportJson();
      });

      expect(lastDownloadFilename).toBe('my-data.json');
    });

    it('outputs formatted JSON (indented)', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers.slice(0, 1),
          columns: [{ key: 'name', header: 'Name' }],
        })
      );

      act(() => {
        result.current.exportJson();
      });

      // Check indentation
      expect(lastBlobContent).toContain('\n');
      expect(lastBlobContent).toContain('  ');
    });
  });

  describe('Clipboard Export', () => {
    it('copies tab-separated data to clipboard', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers.slice(0, 2),
          columns: basicColumns,
        })
      );

      await act(async () => {
        await result.current.exportClipboard();
      });

      expect(writeText).toHaveBeenCalledTimes(1);
      const content = writeText.mock.calls[0][0] as string;
      const lines = content.split('\n');

      expect(lines[0]).toBe('Full Name\tEmail');
      expect(lines[1]).toBe('Alice Johnson\talice@example.com');
      expect(lines[2]).toBe('Bob Smith\tbob@example.com');
    });

    it('escapes tabs in values', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const data = [{ name: 'Has\tTab', email: 'test@test.com' }];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      await act(async () => {
        await result.current.exportClipboard();
      });

      const content = writeText.mock.calls[0][0] as string;
      const lines = content.split('\n');

      // Tab inside value should be replaced with space
      expect(lines[1]).toBe('Has Tab\ttest@test.com');
    });

    it('escapes newlines in values', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const data = [{ name: 'Line1\nLine2', email: 'test@test.com' }];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: basicColumns,
        })
      );

      await act(async () => {
        await result.current.exportClipboard();
      });

      const content = writeText.mock.calls[0][0] as string;
      // Newline inside a value should be replaced with space
      expect(content).toContain('Line1 Line2');
    });

    it('applies custom renderers in clipboard output', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableExport({
          data: testUsers.slice(0, 1),
          columns: [
            { key: 'name', header: 'Name' },
            {
              key: 'balance',
              header: 'Balance',
              render: (v: number) => `$${v.toFixed(2)}`,
            },
          ],
        })
      );

      await act(async () => {
        await result.current.exportClipboard();
      });

      const content = writeText.mock.calls[0][0] as string;
      const lines = content.split('\n');

      expect(lines[1]).toBe('Alice Johnson\t$1500.50');
    });
  });

  describe('Object Values', () => {
    it('omits hidden and non-exportable columns from all export formats', async () => {
      const data = [
        {
          name: 'Alice',
          email: 'alice@test.com',
          salary: '$150,000',
          internalScore: 'high',
        },
      ];

      const columns = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'salary', header: 'Salary', hidden: true },
        { key: 'internalScore', header: 'Internal Score', exportable: false },
      ];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns,
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      let content = lastBlobContent!.replace('\uFEFF', '');
      expect(content.split('\r\n')[0]).toBe('Name,Email');
      expect(content).not.toContain('Salary');
      expect(content).not.toContain('Internal Score');
      expect(content).not.toContain('$150,000');
      expect(content).not.toContain('high');

      act(() => {
        result.current.exportJson();
      });

      const json = JSON.parse(lastBlobContent!);
      expect(json).toEqual([{ Name: 'Alice', Email: 'alice@test.com' }]);

      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
      });

      await act(async () => {
        await result.current.exportClipboard();
      });

      content = writeText.mock.calls[0][0] as string;
      expect(content).toBe('Name\tEmail\nAlice\talice@test.com');
    });

    it('serializes object values as JSON when no render function provided', () => {
      const data = [
        {
          name: 'Alice',
          email: 'alice@test.com',
          metadata: { role: 'admin', level: 3 },
        },
      ];

      const { result } = renderHook(() =>
        useTableExport({
          data,
          columns: [
            { key: 'name', header: 'Name' },
            { key: 'metadata', header: 'Metadata' },
          ],
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      // JSON string contains quotes and commas, so the cell should be CSV-escaped
      expect(lines[1]).toContain('Alice');
      // The JSON value {"role":"admin","level":3} contains commas and quotes,
      // so it should be wrapped in double-quotes with internal quotes doubled
      expect(lines[1]).toContain('"{""role"":""admin"",""level"":3}"');
    });
  });

  describe('Render Error Handling', () => {
    it('falls back to String(value) when render throws', () => {
      const { result } = renderHook(() =>
        useTableExport({
          data: [{ name: 'Alice', email: 'alice@test.com' }],
          columns: [
            {
              key: 'name',
              header: 'Name',
              render: () => {
                throw new Error('render crash');
              },
            },
            { key: 'email', header: 'Email' },
          ],
        })
      );

      act(() => {
        result.current.exportCsv();
      });

      const content = lastBlobContent!.replace('\uFEFF', '');
      const lines = content.split('\r\n');

      // Should fall back to raw value
      expect(lines[1]).toBe('Alice,alice@test.com');
    });
  });
});
