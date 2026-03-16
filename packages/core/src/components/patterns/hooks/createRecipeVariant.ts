'use client';

/**
 * @fileoverview createRecipeVariant -- factory function for creating recipe
 * component variants with modified default props, extra/hidden columns,
 * and preset overrides without forking the base component.
 *
 * Use this when you need a domain-specific version of a pattern (e.g. a
 * "CompactUserTable" that hides certain columns and defaults to a smaller
 * page size) without duplicating the base component code.
 *
 * @example
 * ```tsx
 * const CompactUserTable = createRecipeVariant(PatternDataTable, {
 *   defaultProps: { pageSize: 10, bordered: true },
 *   hideColumns: ['avatar', 'bio'],
 *   displayName: 'CompactUserTable',
 * });
 * ```
 */

import React, { ComponentType, forwardRef } from 'react';
import type { ColumnDef } from '../types';

export interface RecipeVariantConfig<P> {
  /** Override default props */
  defaultProps?: Partial<P>;
  /** Extra columns to add (if component accepts columns) */
  extraColumns?: ColumnDef<any>[];
  /** Columns to hide by key */
  hideColumns?: string[];
  /** Default preset name */
  defaultPreset?: string;
  /** Display name for the variant */
  displayName?: string;
}

/**
 * Creates a new component that wraps `BaseComponent` with preset defaults,
 * column modifications, and/or a default recipe preset.
 *
 * Props passed at the call site always win over `defaultProps`, following
 * the standard React "controlled overrides default" convention.
 *
 * @param BaseComponent - The pattern component to wrap.
 * @param config - Variant configuration (defaults, column changes, preset).
 * @returns A new component with the same prop interface as `BaseComponent`.
 *
 * @example
 * ```tsx
 * const HRDataTable = createRecipeVariant(PatternDataTable, {
 *   defaultProps: { striped: true },
 *   extraColumns: [column('department')],
 *   hideColumns: ['internalId'],
 * });
 * ```
 */
export function createRecipeVariant<P extends Record<string, any>>(
  BaseComponent: ComponentType<P>,
  config: RecipeVariantConfig<P>
): ComponentType<P> {
  const { defaultProps = {}, extraColumns, hideColumns, defaultPreset, displayName } = config;

  const VariantComponent = (props: P) => {
    // Spread defaultProps first so explicit props take precedence.
    let mergedProps = { ...defaultProps, ...props } as P;

    // -- Column modifications --
    // Only run when the component actually has a `columns` prop.
    if ((extraColumns || hideColumns) && 'columns' in mergedProps && Array.isArray(mergedProps.columns)) {
      let cols = [...mergedProps.columns] as ColumnDef<any>[];

      if (hideColumns) {
        cols = cols.map((col) =>
          hideColumns.includes(col.key) ? { ...col, visible: false } : col
        );
      }

      if (extraColumns) {
        cols = [...cols, ...extraColumns];
      }

      mergedProps = { ...mergedProps, columns: cols };
    }

    // Apply the default preset only when the consumer hasn't explicitly set one.
    if (defaultPreset && 'preset' in mergedProps && !props.preset) {
      mergedProps = { ...mergedProps, preset: defaultPreset };
    }

    return React.createElement(BaseComponent, mergedProps);
  };

  VariantComponent.displayName = displayName ?? `Variant(${(BaseComponent as any).displayName ?? 'Component'})`;

  return VariantComponent as ComponentType<P>;
}
