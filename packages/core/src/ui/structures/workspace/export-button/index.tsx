'use client';

/**
 * @fileoverview ExportButton -- structures-tier dropdown button for exporting
 * table data as CSV, JSON, or to the clipboard.
 *
 * @description
 * Renders a trigger button (download icon) with a dropdown menu listing the
 * available export formats. Each menu item triggers the appropriate generator
 * from `./runtime/file-export` and either starts a file download or copies to the
 * clipboard.
 *
 * Key design decisions:
 *   - Zero external dependencies (no xlsx, jspdf, or file-saver).
 *   - Uses DS primitives (Box, Flex, Text, Button) and DS CSS variables.
 *   - Value extraction follows: accessorFn -> accessorKey -> key.
 *   - Header extraction follows: string header -> key fallback.
 *   - Clipboard copy shows a brief inline "Copied!" toast overlay.
 *   - Dropdown closes on selection or outside click.
 *   - Fully keyboard-accessible (arrow keys, Enter, Escape).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  BracesIcon as Braces,
  CheckIcon as Check,
  ClipboardCopyIcon as ClipboardCopy,
  DownloadIcon as Download,
  FileDownIcon as FileDown,
} from '../../../../graphics/icons';

import { Box, Button, Flex, Text } from '../../../primitives';
import { Portal } from '../../../primitives/runtime/overlay/portal';
import { PortalScope, usePortalScope } from '../../../primitives/runtime/overlay/portal-scope';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { ExportColumn } from './runtime/file-export';
import {
  copyToClipboard,
  generateClipboardText,
  generateCsv,
  generateJson,
  triggerDownload,
} from './runtime/file-export';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportButtonProps<T = unknown> {
  /** Data to export */
  data: T[];
  /** Columns to include (uses key + header for CSV headers) */
  columns: ExportColumn[];
  /** Enabled export formats. @default ['csv', 'json', 'clipboard'] */
  formats?: Array<'csv' | 'json' | 'clipboard'>;
  /** Filename without extension. @default 'export' */
  filename?: string;
  /** Called when export starts (for loading state) */
  onExportStart?: (format: string) => void;
  /** Called when export completes */
  onExportComplete?: (format: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Button size */
  size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Format metadata
// ---------------------------------------------------------------------------

interface FormatMeta {
  icon: ReactNode;
}

/**
 * Icons are static; the labels resolve through the i18n catalog inside the
 * component (English floor per format) so the module-level map stays
 * render-context free.
 */
const FORMAT_META: Record<string, FormatMeta> = {
  csv: { icon: <FileDown size={15} /> },
  json: { icon: <Braces size={15} /> },
  clipboard: { icon: <ClipboardCopy size={15} /> },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportButton<T = unknown>({
  data,
  columns,
  formats = ['csv', 'json', 'clipboard'],
  filename = 'export',
  onExportStart,
  onExportComplete,
  disabled = false,
  size = 'sm',
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = (key: string, fallback: string): string => {
    const resolved = i18n?.t(key);
    if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
      return fallback;
    }
    return resolved;
  };
  const formatLabels: Record<string, string> = {
    csv: tOr('exportButton.formatCsv', 'Export as CSV'),
    json: tOr('exportButton.formatJson', 'Export as JSON'),
    clipboard: tOr('exportButton.formatClipboard', 'Copy to clipboard'),
  };
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  // The menu leaves the trigger's DOM ancestry when it portals, so the
  // tenant/locale scope has to be re-stamped around it. `usePortalScope`
  // needs the anchor as state (a ref would not re-render when it lands), so
  // the trigger publishes to both.
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const setTriggerRef = useCallback((node: HTMLDivElement | null) => {
    triggerRef.current = node;
    setAnchorEl(node);
  }, []);
  const portalScope = usePortalScope(anchorEl);

  // -----------------------------------------------------------------------
  // Position the dropdown beneath the trigger
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.right,
    });
  }, [open]);

  // -----------------------------------------------------------------------
  // Close on outside click
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // -----------------------------------------------------------------------
  // Close on Escape
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.querySelector('button')?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // -----------------------------------------------------------------------
  // Export handler
  // -----------------------------------------------------------------------
  const handleExport = useCallback(
    async (format: 'csv' | 'json' | 'clipboard') => {
      onExportStart?.(format);

      try {
        switch (format) {
          case 'csv': {
            const csv = generateCsv(data, columns);
            triggerDownload(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
            break;
          }
          case 'json': {
            const json = generateJson(data, columns);
            triggerDownload(json, `${filename}.json`, 'application/json;charset=utf-8;');
            break;
          }
          case 'clipboard': {
            const text = generateClipboardText(data, columns);
            const ok = await copyToClipboard(text);
            if (ok) {
              setCopiedFeedback(true);
              setTimeout(() => setCopiedFeedback(false), 1800);
            }
            break;
          }
        }
      } finally {
        onExportComplete?.(format);
        setOpen(false);
      }
    },
    [data, columns, filename, onExportStart, onExportComplete],
  );

  // -----------------------------------------------------------------------
  // Keyboard navigation inside the dropdown
  // -----------------------------------------------------------------------
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-export-item]',
      );
      if (!items?.length) return;
      const active = document.activeElement as HTMLButtonElement;
      const idx = Array.from(items).indexOf(active);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = idx < items.length - 1 ? idx + 1 : 0;
        items.item(next)?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = idx > 0 ? idx - 1 : items.length - 1;
        items.item(prev)?.focus();
      }
    },
    [],
  );

  // Focus the first menu item when the dropdown opens
  useEffect(() => {
    if (!open) return;
    // Defer to next frame so the portal has rendered.
    const raf = requestAnimationFrame(() => {
      const first = dropdownRef.current?.querySelector<HTMLButtonElement>(
        '[data-export-item]',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const buttonHeight = size === 'sm' ? 30 : 36;
  const buttonPadding = size === 'sm' ? '0 8px' : '0 12px';

  return (
    <>
      {/* Trigger */}
      <Box
        data-part="root"
        className="ds-structure ds-export-button"
        ref={setTriggerRef}
        style={{ position: 'relative', display: 'inline-flex' }}
      >
        <Button
          data-part="trigger"
          variant="ghost"
          size={size}
          disabled={disabled || data.length === 0}
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={tOr('exportButton.triggerLabel', 'Export data')}
          style={{
            height: buttonHeight,
            padding: buttonPadding,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Download size={15} />
        </Button>

        {/* Copied toast overlay */}
        {copiedFeedback && (
          <Box
            data-part="toast"
            data-copied={true}
            role="status"
            style={{
              position: 'absolute',
              top: -32,
              left: '50%',
              padding: '4px 10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <Flex gap={1} style={{ alignItems: 'center' }}>
              <Check size={12} />
              <Text data-part="toast-label">
                {tOr('exportButton.copied', 'Copied!')}
              </Text>
            </Flex>
          </Box>
        )}
      </Box>

      {/* Dropdown -- shared overlay substrate: the target resolves as explicit
          container > active top-layer host > shared `#rottay-portal-root`, so
          the menu stays visible when the toolbar is itself inside a
          `showModal()` dialog. `PortalScope` carries the tenant/theme/
          direction lineage across the portal boundary. */}
      {open && dropdownPos && (
        <Portal>
          <PortalScope snapshot={portalScope}>
          <Box
            data-part="panel"
            data-open={open}
            className="ds-structure ds-export-button-panel"
            ref={dropdownRef}
            role="menu"
            aria-label={tOr('exportButton.panelLabel', 'Export formats')}
            onKeyDown={handleDropdownKeyDown}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9998,
              minWidth: 200,
              padding: 4,
            }}
          >
            {formats.map((fmt) => {
              const meta = FORMAT_META[fmt];
              if (!meta) return null;
              return (
                <Box
                  key={fmt}
                  as="button"
                  data-export-item
                  data-part="menu-item"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleExport(fmt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 12px',
                    cursor: 'pointer',
                  }}
                >
                  <Flex
                    data-part="menu-icon"
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </Flex>
                  <Text
                    data-part="menu-label"
                  >
                    {formatLabels[fmt] ?? fmt}
                  </Text>
                </Box>
              );
            })}
          </Box>
          </PortalScope>
        </Portal>
      )}
    </>
  );
}

// Re-export utilities so consumers can use them standalone.
export type { ExportColumn, ExportFormat } from './runtime/file-export';
export {
  generateCsv,
  generateJson,
  generateClipboardText,
  triggerDownload,
  copyToClipboard,
  resolveValue,
  resolveHeader,
} from './runtime/file-export';
