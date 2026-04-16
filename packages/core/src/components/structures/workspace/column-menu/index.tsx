'use client';

/**
 * @fileoverview ColumnMenu — structures-tier floating column visibility
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
 * The family stays domain-agnostic: it works with any column shape that
 * has `key: string` and `title: string`. Generic over `T` so consumers can
 * pass their full table column definitions without losing type safety.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';

import { Box, Checkbox, Flex, Text } from '../../../primitives';

/** Minimal column shape required by the menu. Compatible with any richer
 *  ColumnDef<T> via structural subtyping. */
export interface ColumnMenuColumn {
  key: string;
  title: string;
}

export interface ColumnMenuActionItem {
  key: string;
  title: string;
  locked?: boolean;
}

export interface ColumnMenuProps<T extends ColumnMenuColumn> {
  columns: T[];
  visibleColumns: string[];
  columnOrder?: string[];
  onColumnsChange: (visibleKeys: string[], orderedKeys: string[]) => void;
  actions?: ColumnMenuActionItem[];
  visibleActions?: string[];
  onVisibleActionsChange?: (visibleActionKeys: string[]) => void;
  onReset: () => void;
  compact?: boolean;
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

export function ColumnMenu<T extends ColumnMenuColumn>({
  columns,
  visibleColumns,
  columnOrder,
  onColumnsChange,
  actions,
  visibleActions,
  onVisibleActionsChange,
  onReset,
  compact = false,
  externalToggleEventName = DEFAULT_TOGGLE_EVENT,
}: ColumnMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 432 });
  const [draftVisible, setDraftVisible] = useState<string[]>(visibleColumns);
  const [draftOrder, setDraftOrder] = useState<string[]>(
    columnOrder && columnOrder.length > 0 ? columnOrder : columns.map((column) => column.key),
  );
  const [draftVisibleActions, setDraftVisibleActions] = useState<string[]>(
    visibleActions ?? actions?.map((action) => action.key) ?? [],
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
    setDraftVisibleActions(visibleActions ? [...visibleActions] : actions?.map((action) => action.key) ?? []);
    setIsOpen(true);
  }, [actions, columnOrder, columns, visibleActions, visibleColumns]);

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

  const handleToggleAction = useCallback((key: string, locked?: boolean) => {
    if (locked) return;

    setDraftVisibleActions((previous) => {
      if (previous.includes(key)) {
        return previous.filter((current) => current !== key);
      }

      return [...previous, key];
    });
  }, []);

  const handleApply = useCallback(() => {
    onColumnsChange(draftVisible, draftOrder);
    onVisibleActionsChange?.(draftVisibleActions);
    setIsOpen(false);
  }, [draftOrder, draftVisible, draftVisibleActions, onColumnsChange, onVisibleActionsChange]);

  const handleReset = useCallback(() => {
    onReset();
    setIsOpen(false);
  }, [onReset]);

  const visibleCount = draftVisible.length;
  const hiddenCount = Math.max(columns.length - visibleCount, 0);
  const visibleActionsCount = draftVisibleActions.length;
  const totalActionCount = actions?.length ?? 0;

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const width = 432;
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
          width: compact ? 32 : 42,
          minWidth: compact ? 32 : 42,
          height: compact ? 32 : 42,
          minHeight: compact ? 32 : 42,
          padding: 0,
          borderRadius: compact ? 8 : 12,
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
              width: compact ? 22 : 28,
              height: compact ? 22 : 28,
              borderRadius: compact ? 7 : 10,
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
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 95%, white 5%), color-mix(in srgb, var(--ds-color-bg-primary) 34%, var(--ds-surface-card)))',
              border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 72%, transparent)',
              borderRadius: 22,
              boxShadow:
                '0 28px 72px color-mix(in srgb, black 30%, transparent), 0 1px 0 color-mix(in srgb, white 8%, transparent) inset',
              backdropFilter: 'blur(18px) saturate(1.05)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.05)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                padding: '18px 20px 16px',
                borderBottom:
                  '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 12%, transparent), color-mix(in srgb, var(--ds-color-bg-primary) 12%, transparent))',
              }}
            >
              <Flex align="start" justify="between" gap={12}>
                <Box style={{ minWidth: 0 }}>
                  <Text
                    size="sm"
                    weight="medium"
                    style={{ display: 'block', fontSize: 14, letterSpacing: '-0.01em' }}
                  >
                    Table columns
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 12,
                      lineHeight: 1.45,
                      color: 'color-mix(in srgb, var(--ds-color-text-muted) 92%, var(--ds-color-text-secondary) 8%)',
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
                      minHeight: 30,
                      padding: '0 12px',
                      borderRadius: 999,
                      border: '1px solid color-mix(in srgb, var(--ds-color-border-secondary) 84%, transparent)',
                      background: 'color-mix(in srgb, var(--ds-color-bg-primary) 18%, transparent)',
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

            <Box
              style={{
                padding: 14,
                maxHeight: 430,
                overflowY: 'auto',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 8%, transparent), transparent)',
              }}
            >
              <Flex direction="column" gap={8}>
                {orderedColumns.map((column, index) => {
                  const isVisible = draftVisible.includes(column.key);

                  return (
                    <Box
                      key={column.key}
                      style={{
                        border: isVisible
                          ? '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)'
                          : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                        borderRadius: 16,
                        background: isVisible
                          ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))'
                          : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, white 6%), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))',
                        boxShadow: isVisible
                          ? '0 10px 22px color-mix(in srgb, black 10%, transparent), 0 1px 0 color-mix(in srgb, white 5%, transparent) inset'
                          : '0 1px 0 color-mix(in srgb, white 4%, transparent) inset',
                        overflow: 'hidden',
                      }}
                    >
                      <Flex align="center" justify="between" gap={10} style={{ padding: '13px 15px' }}>
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
                                color: isVisible
                                  ? 'var(--ds-color-text-primary)'
                                  : 'color-mix(in srgb, var(--ds-color-text-primary) 86%, var(--ds-color-text-muted) 14%)',
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
                                color: isVisible
                                  ? 'color-mix(in srgb, var(--ds-color-text-secondary) 82%, var(--ds-color-text-muted) 18%)'
                                  : 'var(--ds-color-text-muted)',
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

                {actions && actions.length > 0 && (
                  <Box
                    style={{
                      marginTop: 8,
                      paddingTop: 14,
                      borderTop: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                    }}
                  >
                    <Flex align="center" justify="between" gap={12} style={{ marginBottom: 10 }}>
                      <Box style={{ minWidth: 0 }}>
                        <Text
                          size="xs"
                          weight="medium"
                          style={{
                            display: 'block',
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--ds-color-text-muted)',
                          }}
                        >
                          Row actions
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
                          Choose which quick actions stay visible in the table.
                        </Text>
                      </Box>
                      <CountPill label={`${visibleActionsCount}/${totalActionCount}`} />
                    </Flex>

                    <Flex direction="column" gap={8}>
                      {actions.map((action) => {
                        const isVisible = draftVisibleActions.includes(action.key);

                        return (
                          <Box
                            key={action.key}
                            style={{
                              border: isVisible
                                ? '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)'
                                : '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)',
                              borderRadius: 16,
                              background: isVisible
                                ? 'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))'
                                : 'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, white 6%), color-mix(in srgb, var(--ds-surface-card) 88%, var(--ds-color-bg-primary) 12%))',
                              boxShadow: isVisible
                                ? '0 10px 22px color-mix(in srgb, black 10%, transparent), 0 1px 0 color-mix(in srgb, white 5%, transparent) inset'
                                : '0 1px 0 color-mix(in srgb, white 4%, transparent) inset',
                              overflow: 'hidden',
                            }}
                          >
                            <Flex align="center" justify="between" gap={10} style={{ padding: '13px 15px' }}>
                              <Flex align="center" gap={12} style={{ minWidth: 0, flex: 1 }}>
                                <Checkbox
                                  checked={isVisible}
                                  size="sm"
                                  disabled={action.locked}
                                  onChange={() => handleToggleAction(action.key, action.locked)}
                                />
                                <Box style={{ minWidth: 0 }}>
                                  <Text
                                    size="sm"
                                    style={{
                                      display: 'block',
                                      color: isVisible
                                        ? 'var(--ds-color-text-primary)'
                                        : 'color-mix(in srgb, var(--ds-color-text-primary) 86%, var(--ds-color-text-muted) 14%)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {action.title}
                                  </Text>
                                  <Text
                                    size="xs"
                                    style={{
                                      display: 'block',
                                      marginTop: 4,
                                      color: isVisible
                                        ? 'color-mix(in srgb, var(--ds-color-text-secondary) 82%, var(--ds-color-text-muted) 18%)'
                                        : 'var(--ds-color-text-muted)',
                                      fontSize: 12,
                                    }}
                                  >
                                    {action.locked
                                      ? 'Always visible in the table'
                                      : isVisible
                                        ? 'Visible in the actions column'
                                        : 'Hidden from the actions column'}
                                  </Text>
                                </Box>
                              </Flex>
                            </Flex>
                          </Box>
                        );
                      })}
                    </Flex>
                  </Box>
                )}
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
                background:
                  'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 18%, transparent), color-mix(in srgb, var(--ds-color-bg-primary) 28%, transparent))',
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
                  minHeight: 40,
                  padding: '0 16px',
                  borderRadius: 13,
                  border: '1px solid color-mix(in srgb, var(--ds-color-primary) 32%, transparent)',
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 18%, transparent), color-mix(in srgb, var(--ds-color-primary) 10%, transparent))',
                  color: 'color-mix(in srgb, var(--ds-color-primary) 88%, white 12%)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  boxShadow: '0 10px 22px color-mix(in srgb, var(--ds-color-primary) 12%, transparent)',
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

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { ColumnMenu as WorkspaceColumnsMenu };
export type {
  ColumnMenuProps as WorkspaceColumnsMenuProps,
  ColumnMenuColumn as WorkspaceColumnsMenuColumn,
};
