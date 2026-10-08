import React from 'react';
import type { ReactNode } from 'react';
import type { CollectionHeaderQuickAction } from '../../../../../../structures/headers/collection';
import { isDataTableBodyRowElement } from '../../../../../../patterns/data/data-table/engines/modern';
import type { DensityPosture } from '@/infrastructure/runtime/foundation/density';
import { DENSITY_PRESETS } from '../../../../../../../foundation/tokens/ts/foundation/base/density';

const COLLECTION_WORKSPACE_DENSITY_LOCAL_FACTOR_HOOK =
  '--ds-collection-workspace-density-local-factor';

/**
 * Keeps the mode preset as the stable fallback while allowing a presentation
 * profile to govern the workspace's local posture through the CSS cascade.
 * Structural `--ds-density-scale` and appearance
 * `--ds-density-mode-factor` stay inherited from brand/tenant resolution.
 */
export function resolveCollectionWorkspaceDensityStyleVars(mode: Exclude<DensityPosture, 'spacious'>): React.CSSProperties {
  const preset = DENSITY_PRESETS[mode];
  return {
    '--ds-density-cell-padding': preset.cellPadding,
    '--ds-density-card-padding': preset.cardPadding,
    '--ds-density-local-factor': `var(${COLLECTION_WORKSPACE_DENSITY_LOCAL_FACTOR_HOOK}, ${preset.modeFactor})`,
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function resolveKey<T extends object>(
  item: T,
  rowKey: keyof T | ((row: T) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(item);
  return String(readCollectionRecordValue(item, rowKey));
}

type CollectionWorkspaceTableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  'data-part'?: string;
  'data-focused'?: string;
};

/**
 * Decorates the table row in place. A table body may only contain table rows;
 * wrapping a row with a Box/div produces invalid HTML and breaks hydration.
 *
 * The row is recognized through the data-table engine's exported body-row
 * guard, which covers BOTH the host `<tr>` and the engine's stateful `BodyRow`
 * component (FAM-08 B4 stamps `data-part="body-row"` inside BodyRow, so the
 * part can no longer be read off the element's props). A host `<tr>` still
 * requires the `body-row` part so sibling rows legitimately rendered as plain
 * `<tr>`s (the expanded-detail row) are left alone.
 *
 * The decoration is a hard contract: it runs only for the row whose key IS the
 * focused key, so a render where nothing matched means the row's shape changed
 * again — fail loudly instead of silently shipping an unfocused row.
 */
export function markCollectionWorkspaceFocusedRow(node: ReactNode): ReactNode {
  let matched = false;

  const decorate = (current: ReactNode): ReactNode =>
    React.Children.map(current, (child) => {
      if (!React.isValidElement(child)) return child;

      const childProps = child.props as CollectionWorkspaceTableRowProps & {
        children?: ReactNode;
      };

      if (child.type === React.Fragment) {
        return React.cloneElement(
          child,
          undefined,
          decorate(childProps.children),
        );
      }

      if (!isDataTableBodyRowElement(child)) return child;
      if (child.type === 'tr' && childProps['data-part'] !== 'body-row') {
        return child;
      }

      matched = true;
      return React.cloneElement(
        child as React.ReactElement<CollectionWorkspaceTableRowProps>,
        {
          className: [
            childProps.className,
            'ds-collection-workspace__focused-row',
          ].filter(Boolean).join(' '),
          'data-focused': 'true',
        },
      );
    });

  const decorated = decorate(node);
  if (!matched) {
    throw new Error(
      'CollectionWorkspace focused-row: the focused row rendered but the row '
        + 'decorator matched no table body row. The data-table row output '
        + 'shape changed; re-point the decorator at the new row element.',
    );
  }
  return decorated;
}

export function readCollectionRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

function normalizeCollectionActionLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isPrimaryCollectionAction(
  action: CollectionHeaderQuickAction,
  primaryAction: { key?: string; label: string; onClick: () => void } | undefined,
): boolean {
  if (!primaryAction) return false;

  if (primaryAction.key) return action.key === primaryAction.key;
  if (action.onClick === primaryAction.onClick) return true;

  return normalizeCollectionActionLabel(action.label)
    === normalizeCollectionActionLabel(primaryAction.label);
}

export type SurfaceTranslator = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) => string;
