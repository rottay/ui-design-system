'use client';

/**
 * @fileoverview WorkspaceColumnsMenu pattern -- floating column visibility
 * and ordering panel with a draft + apply UX flow.
 *
 * @description
 * Engine-free panel that ships with its own trigger button, portal, and
 * positioning logic. Pairs with workspace/list pages where users want to
 * stage column visibility and ordering changes locally and apply them in
 * one batched callback (rather than the live-update model used by the
 * existing ColumnSettingsDropdown pattern).
 *
 * Key differences from ColumnSettingsDropdown:
 *   - Owns the trigger button + portal (drop-in for command bars)
 *   - Draft state with "Apply columns" CTA, not live updates
 *   - Up/down arrows for reordering (no drag handles)
 *   - Listens to a custom DOM event for external open requests
 *
 * The pattern stays domain-agnostic: it works with any column shape that
 * has `key: string` and `title: string`. Generic over `T` so consumers can
 * pass their full table column definitions without losing type safety.
 *
 * @module @rottay/design-system/patterns/workspace-columns-menu
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

import { Box, Checkbox, Flex, Text } from '../../primitives';

/** Minimal column shape required by the menu. Compatible with any richer
 *  ColumnDef<T> via structural subtyping. */
export interface WorkspaceColumnsMenuColumn {
  key: string;
  title: string;
}

export interface WorkspaceColumnsMenuProps<T extends WorkspaceColumnsMenuColumn> {
  columns: T[];
  visibleColumns: string[];
  columnOrder?: string[];
  onColumnsChange: (visibleKeys: string[], orderedKeys: string[]) => void;
  onReset: () => void;
  /**
   * Custom DOM event name the menu listens to in order to open/close from
   * outside (typically a keyboard shortcut handler in the workspace
   * orchestrator). Defaults to
   * `entity-table-workspace:toggle-columns-menu` for backwards-compat with
   * the original app-platform extraction.
   */
  externalToggleEventName?: string;
}

function CountPill({ label }: { label: string }) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 22,
        padding: '0 8px',
        borderRadius: 999,
        background: 'color-mix(in srgb, var(--ds-color-bg-primary) 72%, transparent)',
        color: 'var(--ds-color-text-secondary)',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {label}
    </Box>
  );
}

function ColumnsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="4.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.33" />
      <rect x="9.5" y="2" width="4.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.33" />
    </svg>
  );
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const DEFAULT_TOGGLE_EVENT = 'entity-table-workspace:toggle-columns-menu';

export function WorkspaceColumnsMenu<T extends WorkspaceColumnsMenuColumn>({
  columns,
  visibleColumns,
  columnOrder,
  onColumnsChange,
  onReset,
  externalToggleEventName = DEFAULT_TOGGLE_EVENT,
}: WorkspaceColumnsMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 380 });
  const [draftVisible, setDraftVisible] = useState<string[]>(visibleColumns);
  const [draftOrder, setDraftOrder] = useState<string[]>(
    columnOrder && columnOrder.length > 0 ? columnOrder : columns.map((column) => column.key),
  );
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const orderedColumns = useMemo(() => {
    const known = new Map(columns.map((column) => [column.key, column] as const));
    const ordered = draftOrder
      .map((key) => known.get(key))
      .filter((column): column is T => Boolean(column));

    const missing = columns.filter((column) => !draftOrder.includes(column.key));
    return [...ordered, ...missing];
  }, [columns, draftOrder]);

  const handleOpen = useCallback(() => {
    setDraftVisible([...visibleColumns]);
    setDraftOrder(columnOrder && columnOrder.length > 0 ? [...columnOrder] : columns.map((column) => column.key));
    setIsOpen(true);
  }, [columnOrder, columns, visibleColumns]);

  const handleToggleColumn = useCallback((key: string) => {
    setDraftVisible((previous) => {
      if (previous.includes(key)) {
        if (previous.length === 1) return previous;
        return previous.filter((current) => current !== key);
      }

      return [...previous, key];
    });
  }, []);

  const handleMove = useCallback((key: string, direction: -1 | 1) => {
    setDraftOrder((previous) => {
      const index = previous.indexOf(key);
      return moveItem(previous, index, index + direction);
    });
  }, []);

  const handleApply = useCallback(() => {
    onColumnsChange(draftVisible, draftOrder);
    setIsOpen(false);
  }, [draftOrder, draftVisible, onColumnsChange]);

  const handleReset = useCallback(() => {
    onReset();
    setIsOpen(false);
  }, [onReset]);

  const visibleCount = draftVisible.length;
  const hiddenCount = Math.max(columns.length - visibleCount, 0);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const width = 380;
    const gutter = 16;
    const left = Math.min(
      Math.max(gutter, rect.right - width),
      window.innerWidth - width - gutter,
    );

    setPanelPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();

    const handleViewportChange = () => updatePanelPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    const handleToggle = () => {
      if (isOpen) {
        setIsOpen(false);
      } else {
        handleOpen();
      }
    };

    window.addEventListener(externalToggleEventName, handleToggle as EventListener);
    return () => {
      window.removeEventListener(externalToggleEventName, handleToggle as EventListener);
    };
  }, [externalToggleEventName, handleOpen, isOpen]);

  return (
    <Box style={{ position: 'relative', zIndex: isOpen ? 60 : 1 }}>
      <Box
        as="button"
        ref={triggerRef}
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        title={`Columns: ${visibleCount} visible${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''}`}
        aria-label={`Columns: ${visibleCount} visible${hiddenCount > 0 ? `, ${hiddenCount} hidden` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 42,
          minWidth: 42,
          height: 42,
          minHeight: 42,
          padding: 0,
          borderRadius: 12,
          border: isOpen
            ? '1px solid color-mix(in srgb, var(--ds-color-primary) 34%, transparent)'
            : '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
          background: isOpen
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 12%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card)))'
            : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 92%, white 8%), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))',
          color: isOpen ? 'var(--ds-color-primary)' : 'var(--ds-color-text-primary)',
          cursor: 'pointer',
          transition: 'border-color 0.16s ease, background 0.16s ease, color 0.16s ease',
        }}
      >
        <Flex align="center" justify="center" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isOpen
                ? 'color-mix(in srgb, var(--ds-color-primary) 16%, transparent)'
                : 'color-mix(in srgb, var(--ds-color-bg-primary) 56%, transparent)',
              color: 'inherit',
              flexShrink: 0,
            }}
          >
            <ColumnsIcon />
          </Box>
        </Flex>
      </Box>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          <Box onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1990 }} />

          <Box
            style={{
              position: 'fixed',
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
              zIndex: 2000,
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 98%, white 2%), color-mix(in srgb, var(--ds-color-bg-primary) 28%, var(--ds-surface-card)))',
              border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 78%, transparent)',
              borderRadius: 18,
              boxShadow: '0 24px 60px color-mix(in srgb, black 24%, transparent)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                padding: '16px 18px 14px',
                borderBottom:
                  '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), transparent)',
              }}
            >
              <Flex align="start" justify="between" gap={12}>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" weight="medium" style={{ display: 'block', fontSize: 14 }}>
                    Table columns
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 12,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    Toggle visibility here, then drag the live header to fine-tune final order.
                  </Text>
                </Box>
                <Flex align="center" gap={6}>
                  <CountPill label={`${visibleCount}/${columns.length}`} />
                  <Box
                    as="button"
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      minHeight: 28,
                      padding: '0 10px',
                      borderRadius: 999,
                      border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                      background: 'transparent',
                      color: 'var(--ds-color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <RotateCcw style={{ width: 12, height: 12 }} />
                    Reset
                  </Box>
                </Flex>
              </Flex>
            </Box>

            <Box style={{ padding: 12, maxHeight: 420, overflowY: 'auto' }}>
              <Flex direction="column" gap={8}>
                {orderedColumns.map((column, index) => {
                  const isVisible = draftVisible.includes(column.key);

                  return (
                    <Box
                      key={column.key}
                      style={{
                        border: isVisible
                          ? '1px solid color-mix(in srgb, var(--ds-color-primary) 18%, transparent)'
                          : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)',
                        borderRadius: 14,
                        background: isVisible
                          ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 6%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%))'
                          : 'color-mix(in srgb, var(--ds-surface-card) 92%, var(--ds-color-bg-primary) 8%)',
                        overflow: 'hidden',
                      }}
                    >
                      <Flex align="center" justify="between" gap={10} style={{ padding: '12px 14px' }}>
                        <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
                          <Checkbox
                            checked={isVisible}
                            size="sm"
                            onChange={() => handleToggleColumn(column.key)}
                          />
                          <Box style={{ minWidth: 0 }}>
                            <Text
                              size="sm"
                              style={{
                                display: 'block',
                                color: 'var(--ds-color-text-primary)',
                                fontWeight: 600,
                              }}
                            >
                              {column.title}
                            </Text>
                            <Text
                              size="xs"
                              style={{
                                display: 'block',
                                marginTop: 4,
                                color: 'var(--ds-color-text-muted)',
                                fontSize: 12,
                              }}
                            >
                              {isVisible ? 'Visible in the table' : 'Hidden from the current view'}
                            </Text>
                          </Box>
                        </Flex>

                        <Flex align="center" gap={6}>
                          <IconButton
                            label={`Move ${column.title} up`}
                            disabled={index === 0}
                            onClick={() => handleMove(column.key, -1)}
                          >
                            <ArrowUp style={{ width: 14, height: 14 }} />
                          </IconButton>
                          <IconButton
                            label={`Move ${column.title} down`}
                            disabled={index === orderedColumns.length - 1}
                            onClick={() => handleMove(column.key, 1)}
                          >
                            <ArrowDown style={{ width: 14, height: 14 }} />
                          </IconButton>
                        </Flex>
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            </Box>

            <Flex
              align="center"
              justify="between"
              gap={12}
              style={{
                padding: 12,
                borderTop:
                  '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                background: 'color-mix(in srgb, var(--ds-color-bg-primary) 18%, transparent)',
              }}
            >
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
                Column widths stay adjustable directly from the table header.
              </Text>
              <Box
                as="button"
                onClick={handleApply}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 38,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: '1px solid color-mix(in srgb, var(--ds-color-primary) 28%, transparent)',
                  background: 'color-mix(in srgb, var(--ds-color-primary) 12%, transparent)',
                  color: 'var(--ds-color-primary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Apply columns
              </Box>
            </Flex>
          </Box>
        </>,
        document.body,
      )}
    </Box>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      aria-label={label}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 10,
        border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
        background: 'transparent',
        color: disabled ? 'var(--ds-color-text-disabled)' : 'var(--ds-color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {children}
    </Box>
  );
}
