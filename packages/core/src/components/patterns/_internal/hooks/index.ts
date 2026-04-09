/**
 * @fileoverview Pattern hooks and utilities barrel. Exports composition hooks
 * (useDataTable, useKanban, useFormBuilder, useFilterPanel), type-safe column
 * builders, and the createRecipeVariant factory for customizing patterns.
 */

// Composition Hooks
export { useDataTable } from './useDataTable';
export type { UseDataTableOptions, UseDataTableReturn } from './useDataTable';

export { useKanban } from './useKanban';
export type { UseKanbanOptions, UseKanbanReturn } from './useKanban';

export { useFormBuilder } from './useFormBuilder';
export type { UseFormBuilderOptions, UseFormBuilderReturn } from './useFormBuilder';

export { useFilterPanel } from './useFilterPanel';
export type { UseFilterPanelOptions, UseFilterPanelReturn } from './useFilterPanel';

// Column Builders
export { column, columns, actionsColumn } from './columns';

// Recipe Variant Factory
export { createRecipeVariant } from './createRecipeVariant';
export type { RecipeVariantConfig } from './createRecipeVariant';
