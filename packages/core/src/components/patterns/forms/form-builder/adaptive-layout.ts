import type { FormBuilderProps } from './FormBuilder.types';

export interface AdaptiveFormLayoutInput {
  layout: NonNullable<FormBuilderProps['layout']>;
  columns: number;
  autoAdaptive: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

export interface AdaptiveFormLayout {
  layout: NonNullable<FormBuilderProps['layout']>;
  columns: number;
}

export interface AdaptiveFormFieldColumnSpanInput {
  columnSpan: number | undefined;
  columns: number;
  autoAdaptive: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * Resolves the form layout once for every rendering engine.
 *
 * Phone forms never retain dense grid or horizontal postures. Tablet grids
 * keep at most two tracks; desktop and opt-out consumers retain their input.
 */
export function resolveAdaptiveFormLayout({
  layout,
  columns,
  autoAdaptive,
  isMobile,
  isTablet,
}: AdaptiveFormLayoutInput): AdaptiveFormLayout {
  if (!autoAdaptive || (!isMobile && !isTablet)) {
    return { layout, columns };
  }

  const normalizedColumns = Math.max(1, Math.floor(columns));

  if (isMobile) {
    return {
      layout: layout === 'grid' || layout === 'horizontal' ? 'vertical' : layout,
      columns: 1,
    };
  }

  return {
    layout,
    columns: isTablet ? Math.min(normalizedColumns, 2) : normalizedColumns,
  };
}

/** Prevents a desktop field span from creating implicit tracks on smaller grids. */
export function clampFormFieldColumnSpan(columnSpan: number | undefined, columns: number): number | undefined {
  if (columnSpan === undefined) return undefined;

  return Math.min(Math.max(1, Math.floor(columnSpan)), Math.max(1, columns));
}

/** Preserve caller spans unless responsive adaptation is active on phone/tablet. */
export function resolveAdaptiveFormFieldColumnSpan({
  columnSpan,
  columns,
  autoAdaptive,
  isMobile,
  isTablet,
}: AdaptiveFormFieldColumnSpanInput): number | undefined {
  if (!autoAdaptive || (!isMobile && !isTablet)) return columnSpan;

  return clampFormFieldColumnSpan(columnSpan, columns);
}
