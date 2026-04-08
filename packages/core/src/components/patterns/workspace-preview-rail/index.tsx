'use client';

/**
 * @fileoverview WorkspacePreviewRail pattern -- sticky 380px preview rail
 * for workspace/list pages with snapshot column rendering, match-reason
 * overlay, and a custom-render slot.
 *
 * @description
 * Engine-free pattern that renders a sticky right-side rail showing a
 * focused or selected row from a workspace table. Renders one of two
 * branches:
 *
 *   1. **Custom-render branch**: when `preview.render(item)` returns a
 *      truthy ReactNode, the rail wraps it in a sticky card with a close
 *      button and a tinted background. This is the path most workspace
 *      configs take, supplying their own domain-specific identity card.
 *
 *   2. **Default rail**: when no custom render is supplied, the rail
 *      assembles a generic identity card from domain-agnostic field
 *      candidates (`fullName`, `name`, `title`, etc.), an optional
 *      match-reason overlay, an "Open record" + "Copy key" action row,
 *      and a snapshot of the first 6 visible table columns. The default
 *      rail intentionally avoids any platform-specific field heuristics
 *      (no `tenantLabel`, no `roleLabel`, etc.) -- consumers that want
 *      domain identity must supply a custom render.
 *
 * Distinct from the DS DetailPanel pattern (full-page detail container
 * with tabs/sidebar/breadcrumbs/footer): this is a sticky list-side rail.
 *
 * The pattern stays domain-agnostic and is generic over `T extends
 * object`, so any record shape composes via structural subtyping.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  ArrowUpRight,
  Copy,
  PanelRightClose,
  ScanSearch,
} from 'lucide-react';

import { Badge, Box, Button, Flex, Text } from '../../primitives';

/** Minimal column definition consumed by the rail. */
export interface WorkspacePreviewRailColumn<T> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
}

/** Minimal row-action shape consumed by the rail's action row. */
export interface WorkspacePreviewRailRowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  hidden?: boolean;
}

/** Optional preview configuration supplied by the consumer. */
export interface WorkspacePreviewRailPreviewConfig<T> {
  title?: string;
  description?: string;
  render?: (item: T) => ReactNode;
}

export interface WorkspacePreviewRailProps<T extends object> {
  item: T;
  itemKey: string;
  itemIndex: number;
  columns: WorkspacePreviewRailColumn<T>[];
  visibleColumns?: string[];
  rowActions?: (item: T) => WorkspacePreviewRailRowAction[];
  onOpenItem?: (item: T) => void;
  onClose: () => void;
  getMatchReason?: (item: T) => string | undefined;
  mode: 'click' | 'selection';
  preview?: WorkspacePreviewRailPreviewConfig<T>;
}

function resolvePathValue(record: Record<string, unknown>, path: string): unknown {
  if (!path.includes('.')) return record[path];

  return path.split('.').reduce<unknown>((accumulator, segment) => {
    if (accumulator && typeof accumulator === 'object') {
      return (accumulator as Record<string, unknown>)[segment];
    }
    return undefined;
  }, record);
}

function resolveColumnValue<T extends object>(
  column: WorkspacePreviewRailColumn<T>,
  item: T,
): unknown {
  const record = item as Record<string, unknown>;
  if (column.dataIndex) {
    return resolvePathValue(record, column.dataIndex);
  }

  return record[column.key];
}

function extractString(record: Record<string, unknown>, candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const value = record[candidate];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function renderFallbackValue(value: unknown): ReactNode {
  if (value === undefined || value === null || value === '') {
    return (
      <Text
        size="sm"
        style={{
          color: 'var(--ds-color-text-muted)',
          fontStyle: 'italic',
        }}
      >
        No data
      </Text>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Text size="sm" style={{ color: 'var(--ds-color-text-primary)' }}>
        {value ? 'Yes' : 'No'}
      </Text>
    );
  }

  return (
    <Text
      size="sm"
      style={{
        color: 'var(--ds-color-text-primary)',
        lineHeight: 1.45,
      }}
    >
      {String(value)}
    </Text>
  );
}

export function WorkspacePreviewRail<T extends object>({
  item,
  itemKey,
  itemIndex,
  columns,
  visibleColumns,
  rowActions,
  onOpenItem,
  onClose,
  getMatchReason,
  mode,
  preview,
}: WorkspacePreviewRailProps<T>) {
  const record = item as Record<string, unknown>;

  const identity = useMemo(() => {
    // The identity card only auto-extracts domain-agnostic fields: a title
    // (with generic name candidates), an optional subtitle, and an
    // optional status. Domain-specific identity (role, tenant, candidate,
    // event, etc.) belongs in a consumer-supplied `preview.render()`
    // function, which short-circuits this default rail entirely.
    const title =
      extractString(record, ['fullName', 'name', 'title', 'label', 'email', 'id']) ||
      itemKey;
    const subtitle = extractString(record, ['email', 'slug', 'description']);
    const status = extractString(record, ['statusLabel', 'status']);
    const statusVariant =
      typeof record.statusVariant === 'string' ? record.statusVariant : 'secondary';

    return {
      title,
      subtitle,
      status,
      statusVariant,
    };
  }, [itemKey, record]);

  const matchReason = getMatchReason?.(item);

  const previewColumns = useMemo(() => {
    const visibleSet = visibleColumns?.length ? new Set(visibleColumns) : null;

    return columns.filter((column) => {
      if (column.key === 'actions') return false;
      if (!visibleSet) return true;
      return visibleSet.has(column.key);
    });
  }, [columns, visibleColumns]);

  const snapshotColumns = useMemo(() => {
    return previewColumns.slice(0, 6);
  }, [previewColumns]);

  const visibleActions = useMemo(() => {
    const actions = rowActions?.(item).filter((action) => !action.hidden) ?? [];
    if (onOpenItem) {
      return actions.filter((action) => action.key !== 'view');
    }
    return actions;
  }, [item, onOpenItem, rowActions]);
  const customPreview = preview?.render?.(item);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(itemKey);
    } catch {
      // Clipboard is best-effort only.
    }
  };

  if (customPreview) {
    return (
      <Box
        style={{
          flex: '0 1 clamp(320px, 29vw, 380px)',
          width: 'min(100%, 380px)',
          minWidth: 'min(100%, 320px)',
          padding: '14px 16px 14px 14px',
          borderLeft: '1px solid var(--ds-color-border-subtle)',
          background: 'transparent',
        }}
      >
        <Box
          style={{
            position: 'sticky',
            top: 16,
          }}
        >
          <Box
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--ds-radius-xl, 18px)',
              border: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 78%, transparent)',
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-panel) 90%, white 10%), var(--ds-surface-card))',
              boxShadow:
                '0 18px 44px color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                icon={<PanelRightClose style={{ width: 16, height: 16 }} />}
                aria-label="Close preview"
                onClick={onClose}
                style={{
                  width: 34,
                  minWidth: 34,
                  padding: 0,
                  background: 'color-mix(in srgb, var(--ds-surface-card) 80%, transparent)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </Box>

            <Box style={{ padding: '16px' }}>
              {customPreview}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      style={{
        flex: '0 1 clamp(320px, 29vw, 380px)',
        width: 'min(100%, 380px)',
        minWidth: 'min(100%, 320px)',
        padding: '18px 18px 18px 16px',
        borderLeft: '1px solid var(--ds-color-border-subtle)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 94%, white 6%), var(--ds-surface-card))',
      }}
    >
      <Box
        style={{
          position: 'sticky',
          top: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <Box
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--ds-radius-xl, 18px)',
            border: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 78%, transparent)',
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-panel) 88%, white 12%), var(--ds-surface-card))',
            boxShadow:
              '0 18px 48px color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
          }}
        >
          <Box
            style={{
              height: 3,
              background:
                'linear-gradient(90deg, var(--ds-color-primary), color-mix(in srgb, var(--ds-color-primary) 28%, transparent))',
            }}
          />

          <Box style={{ padding: '18px 18px 16px' }}>
            <Flex align="center" justify="between" gap={12}>
              <Badge variant={mode === 'selection' ? 'primary' : 'secondary'} size="sm">
                {mode === 'selection' ? 'Selected row' : 'Focused preview'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                icon={<PanelRightClose style={{ width: 16, height: 16 }} />}
                aria-label="Close preview"
                onClick={onClose}
                style={{ width: 34, minWidth: 34, padding: 0 }}
              />
            </Flex>

            <Box style={{ marginTop: 16 }}>
              <Text
                size="xl"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.12,
                }}
              >
                {identity.title}
              </Text>
              {identity.subtitle && (
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 6,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.4,
                  }}
                >
                  {identity.subtitle}
                </Text>
              )}
            </Box>

            {matchReason && (
              <Box
                style={{
                  marginTop: 16,
                  padding: '14px 14px 14px 16px',
                  borderRadius: 'var(--ds-radius-lg, 14px)',
                  border: '1px solid color-mix(in srgb, var(--ds-color-primary) 22%, transparent)',
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), color-mix(in srgb, var(--ds-color-primary) 4%, transparent))',
                }}
              >
                <Flex align="start" gap={10}>
                  <ScanSearch
                    style={{
                      width: 15,
                      height: 15,
                      marginTop: 2,
                      color: 'var(--ds-color-primary)',
                      flexShrink: 0,
                    }}
                  />
                  <Box style={{ minWidth: 0 }}>
                    <Flex align="center" gap={8} wrap="wrap">
                      <Badge variant="primary" size="sm">
                        Why this row?
                      </Badge>
                      <Text
                        size="xs"
                        weight="medium"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        Current search, scope, or filters matched this record.
                      </Text>
                    </Flex>
                    <Text
                      size="sm"
                      style={{
                        display: 'block',
                        marginTop: 6,
                        color: 'var(--ds-color-text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {matchReason}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 14 }}>
              {identity.status && (
                <Badge
                  variant={identity.statusVariant as 'primary' | 'success' | 'warning' | 'secondary' | 'error'}
                  size="sm"
                >
                  {identity.status}
                </Badge>
              )}
            </Flex>

            <Flex align="center" gap={8} wrap="wrap" style={{ marginTop: 18 }}>
              {onOpenItem && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowUpRight style={{ width: 15, height: 15 }} />}
                  onClick={() => onOpenItem(item)}
                  style={{ gap: 6 }}
                >
                  Open record
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy style={{ width: 15, height: 15 }} />}
                onClick={handleCopyKey}
                style={{ gap: 6 }}
              >
                Copy key
              </Button>
              {visibleActions.slice(0, 2).map((action) => (
                <Button
                  key={action.key}
                  variant={action.variant === 'danger' ? 'danger' : 'secondary'}
                  size="sm"
                  icon={action.icon}
                  onClick={action.onClick}
                  style={{ gap: 6 }}
                >
                  {action.label}
                </Button>
              ))}
            </Flex>
          </Box>
        </Box>

        <Box
          style={{
            borderRadius: 'var(--ds-radius-xl, 18px)',
            border: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 78%, transparent)',
            background: 'var(--ds-surface-card)',
            boxShadow: '0 10px 30px color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--ds-color-border-subtle)',
            }}
          >
            <Text
              size="sm"
              weight="medium"
              style={{
                display: 'block',
                color: 'var(--ds-color-text-primary)',
              }}
            >
              {preview?.title ?? 'Snapshot'}
            </Text>
            <Text
              size="xs"
              style={{
                display: 'block',
                marginTop: 4,
                color: 'var(--ds-color-text-muted)',
              }}
            >
              {preview?.description ?? `Key ${itemKey} · Row ${itemIndex + 1}`}
            </Text>
          </Box>

          <Box style={{ padding: '6px 0' }}>
            {snapshotColumns.map((column) => {
              const rawValue = resolveColumnValue(column, item);
              const content = column.render
                ? column.render(rawValue, item, itemIndex)
                : renderFallbackValue(rawValue);

              return (
                <Box
                  key={column.key}
                  style={{
                    padding: '12px 18px',
                    borderTop: '1px solid color-mix(in srgb, var(--ds-color-border-subtle) 60%, transparent)',
                  }}
                >
                  <Text
                    size="xs"
                    weight="medium"
                    style={{
                      display: 'block',
                      marginBottom: 6,
                      color: 'var(--ds-color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {column.title}
                  </Text>
                  <Box>{content}</Box>
                </Box>
              );
            })}

            {snapshotColumns.length === 0 && (
              <Box style={{ padding: '18px' }}>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--ds-color-text-muted)',
                    lineHeight: 1.45,
                  }}
                >
                  No preview fields are available for this record.
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
