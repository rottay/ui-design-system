/**
 * Segmented Component Types
 *
 * Unified type definitions for segmented control.
 * Works with titan (AntD), hermes (DaisyUI), apollo (HTML+Tailwind), and athena engines.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Segmented option value type
 */
export type SegmentedValue = string | number;

/**
 * Segmented option configuration
 */
export interface SegmentedOption<T extends SegmentedValue = SegmentedValue> {
  /** Option label */
  label: ReactNode;
  /** Option value */
  value: T;
  /** Option icon */
  icon?: ReactNode;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Segmented size variants
 */
export type SegmentedSize = 'small' | 'middle' | 'large';

/**
 * Base Segmented props supported by all engines
 */
export interface SegmentedBaseProps<T extends SegmentedValue = SegmentedValue> {
  /** Options array */
  options: (T | SegmentedOption<T>)[];
  /** Current value (controlled) */
  value?: T;
  /** Default value (uncontrolled) */
  defaultValue?: T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Extended Segmented props with engine-specific features
 */
export interface SegmentedProps<T extends SegmentedValue = SegmentedValue> extends SegmentedBaseProps<T> {
  /** Whether the whole control is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: SegmentedSize;
  /** Whether to fill the container width */
  block?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize option to SegmentedOption format
 */
export function normalizeOption<T extends SegmentedValue>(
  option: T | SegmentedOption<T>
): SegmentedOption<T> {
  if (typeof option === 'object' && option !== null && 'value' in option) {
    return option;
  }
  return {
    label: String(option),
    value: option as T,
  };
}

/**
 * Normalize all options
 */
export function normalizeOptions<T extends SegmentedValue>(
  options: (T | SegmentedOption<T>)[]
): SegmentedOption<T>[] {
  return options.map(normalizeOption);
}

/**
 * Get size class mappings for different engines
 */
export function getSizeClasses(size: SegmentedSize = 'middle', engine: 'hermes' | 'apollo' = 'apollo'): string {
  const sizeMap: Record<SegmentedSize, string> = {
    small: engine === 'hermes' ? 'btn-sm' : 'px-2 py-1 text-xs',
    middle: engine === 'hermes' ? '' : 'px-3 py-1.5 text-sm',
    large: engine === 'hermes' ? 'btn-lg' : 'px-4 py-2 text-base',
  };
  return sizeMap[size];
}
