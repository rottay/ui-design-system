'use client';

/**
 * createRecipeVariant - Recipe Customization Utility
 *
 * Creates a variant of a recipe component with modified defaults.
 *
 * @example
 * const MyCandidateTable = createRecipeVariant(BhCandidateTable, {
 *   extraColumns: [column('salary', { render: (v) => <Text>${v}k</Text> })],
 *   hideColumns: ['score'],
 *   defaultPreset: 'compact',
 * });
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

export function createRecipeVariant<P extends Record<string, any>>(
  BaseComponent: ComponentType<P>,
  config: RecipeVariantConfig<P>
): ComponentType<P> {
  const { defaultProps = {}, extraColumns, hideColumns, defaultPreset, displayName } = config;

  const VariantComponent = (props: P) => {
    let mergedProps = { ...defaultProps, ...props } as P;

    // Handle column modifications
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

    // Handle preset override
    if (defaultPreset && 'preset' in mergedProps && !props.preset) {
      mergedProps = { ...mergedProps, preset: defaultPreset };
    }

    return React.createElement(BaseComponent, mergedProps);
  };

  VariantComponent.displayName = displayName ?? `Variant(${(BaseComponent as any).displayName ?? 'Component'})`;

  return VariantComponent as ComponentType<P>;
}
