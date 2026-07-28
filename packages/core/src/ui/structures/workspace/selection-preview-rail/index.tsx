'use client';

/**
 * @fileoverview SelectionPreviewRail — structures-tier sticky 380px preview rail
 * for workspace/list pages with snapshot column rendering, match-reason
 * overlay, and a custom-render slot.
 *
 * @description
 * Engine-free structures family that renders a sticky right-side rail showing a
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
 * The family stays domain-agnostic and is generic over `T extends
 * object`, so any record shape composes via structural subtyping.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  ArrowUpRightIcon as ArrowUpRight,
  CopyIcon as Copy,
  PanelRightCloseIcon as PanelRightClose,
  ScanSearchIcon as ScanSearch,
} from '../../../../graphics/icons';

import { Badge, Box, Button, Flex, Text } from '../../../primitives';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

/** Minimal column definition consumed by the rail. */
export interface SelectionPreviewRailColumn<T> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
}

/** Minimal row-action shape consumed by the rail's action row. */
export interface SelectionPreviewRailRowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  hidden?: boolean;
}

/** Optional preview configuration supplied by the consumer. */
export interface SelectionPreviewRailPreviewConfig<T> {
  title?: string;
  description?: string;
  render?: (item: T) => ReactNode;
}

export interface SelectionPreviewRailProps<T extends object> {
  item: T;
  itemKey: string;
  itemIndex: number;
  columns: SelectionPreviewRailColumn<T>[];
  visibleColumns?: string[];
  rowActions?: (item: T) => SelectionPreviewRailRowAction[];
  onOpenItem?: (item: T) => void;
  onClose: () => void;
  getMatchReason?: (item: T) => string | undefined;
  mode: 'click' | 'selection';
  preview?: SelectionPreviewRailPreviewConfig<T>;
}

function readDisplayRecordValue(record: unknown, key: PropertyKey): unknown {
  if (typeof record !== 'object' || record === null) return undefined;
  const value = Reflect.get(record, key);
  return typeof value === 'function' ? undefined : value;
}

function resolvePathValue(record: Record<string, unknown>, path: string): unknown {
  if (!path.includes('.')) return readDisplayRecordValue(record, path);

  return path.split('.').reduce<unknown>((accumulator, segment) => {
    if (accumulator && typeof accumulator === 'object') {
      return readDisplayRecordValue(accumulator, segment);
    }
    return undefined;
  }, record);
}

function resolveColumnValue<T extends object>(
  column: SelectionPreviewRailColumn<T>,
  item: T,
): unknown {
  const record = item as Record<string, unknown>;
  if (column.dataIndex) {
    return resolvePathValue(record, column.dataIndex);
  }

  return readDisplayRecordValue(record, column.key);
}

function extractString(record: Record<string, unknown>, candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const value = readDisplayRecordValue(record, candidate);
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function renderFallbackValue(
  value: unknown,
  labels: { noData: string; yes: string; no: string },
): ReactNode {
  if (value === undefined || value === null || value === '') {
    return (
      <Text
        size="sm"
        color="subtle"
        data-part="fallback-empty"
      >
        {labels.noData}
      </Text>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Text size="sm" data-part="fallback-boolean">
        {value ? labels.yes : labels.no}
      </Text>
    );
  }

  return (
    <Text
      size="sm"
      data-part="fallback-string"
    >
      {String(value)}
    </Text>
  );
}

export function SelectionPreviewRail<T extends object>({
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
}: SelectionPreviewRailProps<T>) {
  const record = item as Record<string, unknown>;
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
  const fallbackLabels = {
    noData: tOr('selectionPreviewRail.noData', 'No data'),
    yes: tOr('selectionPreviewRail.yes', 'Yes'),
    no: tOr('selectionPreviewRail.no', 'No'),
  };

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
        className="ds-structure ds-selection-preview-rail"
        data-part="root"
        data-preview="custom"
        style={{
          flex: '0 1 clamp(320px, 29vw, 380px)',
          width: 'min(100%, 380px)',
          minWidth: 'min(100%, 320px)',
          padding: '14px 16px 14px 14px',
        }}
      >
        <Box
          style={{
            position: 'sticky',
            top: 16,
          }}
        >
          <Box
            data-part="custom-sticky-card"
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 12,
                insetInlineEnd: 12,
                zIndex: 1,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                icon={<PanelRightClose style={{ width: 16, height: 16 }} />}
                aria-label={tOr('selectionPreviewRail.closePreview', 'Close preview')}
                onClick={onClose}
                className="ds-selection-preview-rail__close"
                style={{
                  width: 34,
                  minWidth: 34,
                  padding: 0,
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
      className="ds-structure ds-selection-preview-rail"
      data-part="root"
      data-preview="default"
      style={{
        flex: '0 1 clamp(320px, 29vw, 380px)',
        width: 'min(100%, 380px)',
        minWidth: 'min(100%, 320px)',
        padding: '18px 18px 18px 16px',
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
          data-part="identity-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            data-part="identity-card-accent"
            style={{
              height: 3,
            }}
          />

          <Box style={{ padding: '18px 18px 16px' }}>
            <Flex align="center" justify="between" gap={12}>
              <Badge variant={mode === 'selection' ? 'primary' : 'secondary'} size="sm">
                {mode === 'selection'
                  ? tOr('selectionPreviewRail.selectedRow', 'Selected row')
                  : tOr('selectionPreviewRail.focusedPreview', 'Focused preview')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                icon={<PanelRightClose style={{ width: 16, height: 16 }} />}
                aria-label={tOr('selectionPreviewRail.closePreview', 'Close preview')}
                onClick={onClose}
                style={{ width: 34, minWidth: 34, padding: 0 }}
              />
            </Flex>

            <Box style={{ marginTop: 16 }}>
              <Text
                size="xl"
                weight="semibold"
                data-part="identity-title"
                style={{
                  display: 'block',
                }}
              >
                {identity.title}
              </Text>
              {identity.subtitle && (
                <Text
                  size="sm"
                  color="secondary"
                  data-part="identity-subtitle"
                  style={{
                    display: 'block',
                    marginTop: 6,
                  }}
                >
                  {identity.subtitle}
                </Text>
              )}
            </Box>

            {matchReason && (
              <Box
                data-part="match-reason-panel"
                style={{
                  marginTop: 16,
                  padding: '14px 14px 14px 16px',
                }}
              >
                <Flex align="start" gap={10}>
                  <span
                    data-part="match-reason-icon"
                    style={{
                      display: 'inline-flex',
                      width: 15,
                      height: 15,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    <ScanSearch aria-hidden="true" style={{ width: 15, height: 15 }} />
                  </span>
                  <Box style={{ minWidth: 0 }}>
                    <Flex align="center" gap={8} wrap="wrap">
                      <Badge variant="primary" size="sm">
                        {tOr('selectionPreviewRail.whyThisRow', 'Why this row?')}
                      </Badge>
                      <Text
                        size="xs"
                        weight="medium"
                        color="subtle"
                        data-part="match-reason-eyebrow"
                        style={{
                          display: 'block',
                        }}
                      >
                        {tOr('selectionPreviewRail.matchReasonEyebrow', 'Current search, scope, or filters matched this record.')}
                      </Text>
                    </Flex>
                    <Text
                      size="sm"
                      color="secondary"
                      data-part="match-reason-body"
                      style={{
                        display: 'block',
                        marginTop: 6,
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
                  {tOr('selectionPreviewRail.openRecord', 'Open record')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy style={{ width: 15, height: 15 }} />}
                onClick={handleCopyKey}
                style={{ gap: 6 }}
              >
                {tOr('selectionPreviewRail.copyKey', 'Copy key')}
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
          data-part="snapshot-card"
          style={{
            overflow: 'hidden',
          }}
        >
          <Box
            data-part="snapshot-header"
            style={{
              padding: '14px 18px',
            }}
          >
            <Text
              size="sm"
              weight="medium"
              data-part="snapshot-title"
              style={{
                display: 'block',
              }}
            >
              {preview?.title ?? tOr('selectionPreviewRail.snapshotTitle', 'Snapshot')}
            </Text>
            <Text
              size="xs"
              color="subtle"
              data-part="snapshot-subtitle"
              style={{
                display: 'block',
                marginTop: 4,
              }}
            >
              {preview?.description ?? `${tOr('selectionPreviewRail.keyPrefix', 'Key')} ${itemKey} · ${tOr('selectionPreviewRail.rowPrefix', 'Row')} ${itemIndex + 1}`}
            </Text>
          </Box>

          <Box style={{ padding: '6px 0' }}>
            {snapshotColumns.map((column) => {
              const rawValue = resolveColumnValue(column, item);
              const content = column.render
                ? column.render(rawValue, item, itemIndex)
                : renderFallbackValue(rawValue, fallbackLabels);

              return (
                <Box
                  key={column.key}
                  data-part="snapshot-row"
                  style={{
                    padding: '12px 18px',
                  }}
                >
                  <Text
                    size="xs"
                    weight="medium"
                    color="subtle"
                    data-part="snapshot-row-label"
                    style={{
                      display: 'block',
                      marginBottom: 6,
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
                  color="subtle"
                  data-part="snapshot-empty"
                >
                  {tOr('selectionPreviewRail.snapshotEmpty', 'No preview fields are available for this record.')}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Compatibility aliases for pre-Checkpoint-D names. Deprecated —
// migrate to the canonical new names above. Scheduled for removal
// in Checkpoint F if no consumers remain.
export { SelectionPreviewRail as WorkspacePreviewRail };
export type {
  SelectionPreviewRailProps as WorkspacePreviewRailProps,
  SelectionPreviewRailColumn as WorkspacePreviewRailColumn,
  SelectionPreviewRailRowAction as WorkspacePreviewRailRowAction,
  SelectionPreviewRailPreviewConfig as WorkspacePreviewRailPreviewConfig,
};
