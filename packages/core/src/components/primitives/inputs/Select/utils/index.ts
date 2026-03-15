/**
 * @fileoverview Shared Select utilities - Rottay Design System
 * @description Common utility functions and types used by both Modern and Rustic Select engines.
 *
 * Extracted to eliminate duplication between engine implementations.
 *
 * @module Select/utils
 * @category Inputs
 * @package @rottay/design-system
 */

import type React from 'react';
import type { SelectOption, SelectOptionGroup } from '../types';

// ---------------------------------------------------------------------------
// Virtual scroll defaults
// ---------------------------------------------------------------------------

export const DEFAULT_ITEM_HEIGHT = 32;
export const DEFAULT_CONTAINER_HEIGHT = 300;
export const VIRTUAL_BUFFER = 5;

// ---------------------------------------------------------------------------
// Renderable item type for flattened option groups
// ---------------------------------------------------------------------------

export interface RenderableItem {
  type: 'group-header' | 'option';
  option?: SelectOption;
  groupLabel?: React.ReactNode;
  groupDisabled?: boolean;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Extract plain text from an option label (which may be a ReactNode).
 */
export function getLabelText(label: React.ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return '';
}

/**
 * Build a flat renderable list from options and optional groups.
 * Group headers are interleaved with their child options.
 */
export function buildRenderableList(
  options: SelectOption[],
  groups?: SelectOptionGroup[],
): RenderableItem[] {
  if (groups && groups.length > 0) {
    const items: RenderableItem[] = [];
    for (const group of groups) {
      items.push({ type: 'group-header', groupLabel: group.label, groupDisabled: group.disabled });
      for (const opt of group.options) {
        items.push({ type: 'option', option: { ...opt, disabled: opt.disabled || group.disabled } });
      }
    }
    return items;
  }
  return options.map((opt) => ({ type: 'option' as const, option: opt }));
}

/**
 * Flatten all options from option groups into a single array,
 * propagating group-level disabled state to individual options.
 */
export function flatOptionsFromGroups(groups?: SelectOptionGroup[]): SelectOption[] {
  if (!groups) return [];
  const result: SelectOption[] = [];
  for (const g of groups) {
    for (const opt of g.options) {
      result.push({ ...opt, disabled: opt.disabled || g.disabled });
    }
  }
  return result;
}
