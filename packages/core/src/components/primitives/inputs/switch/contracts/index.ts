/**
 * @fileoverview Switch Types - Rottay Design System
 * @description Type definitions for the Switch component.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module defines all TypeScript interfaces, types, and constants
 * for the Switch component. These types are shared across all engines.
 *
 * **Exported Types:**
 * - `SwitchProps` - Main component props interface
 * - `SwitchSize` - Size variant type ('sm' | 'md' | 'lg', legacy 'small' | 'middle' | 'large' | 'default' accepted for one release)
 *
 * **Configuration Constants:**
 * - `SWITCH_DEFAULTS` - Default prop values
 *
 * **Key Props:**
 * - `checked` / `defaultChecked` - Controlled/uncontrolled state
 * - `checkedChildren` / `unCheckedChildren` - Content for each state
 * - `loading` - Shows loading spinner and disables interaction
 * - `onChange` - Callback with new checked value
 * - `onClick` - Callback with checked value and event
 *
 * @example Type Usage
 * ```tsx
 * import type { SwitchProps, SwitchSize } from '@rottay/design-system';
 *
 * interface SettingSwitchProps extends SwitchProps {
 *   settingKey: string;
 *   onSave?: (value: boolean) => Promise<void>;
 * }
 * ```
 *
 * @see {@link Switch} for the main component
 * @module SwitchTypes
 * @category Inputs
 * @package @rottay/design-system
 */

import type { ReactNode, CSSProperties } from 'react';
import type { LegacySizeAlias, Size } from '../../../../../foundation/contracts/kernel/common';

/**
 * Size of the switch.
 * @remarks Canonical values are the {@link Size} subset `'sm' | 'md' | 'lg'`. The legacy Ant
 * Design-style spellings (`'small' | 'middle' | 'large' | 'default'`) are accepted for one
 * release via {@link LegacySizeAlias} and are deprecated; prefer the canonical spelling in new
 * code.
 */
export type SwitchSize = Extract<Size, 'sm' | 'md' | 'lg'> | LegacySizeAlias;

export interface SwitchProps {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Whether the switch is in loading state */
  loading?: boolean;
  /** Size of the switch */
  size?: SwitchSize;
  /** Content when checked */
  checkedChildren?: ReactNode;
  /** Content when unchecked */
  unCheckedChildren?: ReactNode;
  /** Callback when the switch is toggled */
  onChange?: (checked: boolean) => void;
  /** Callback when clicked */
  onClick?: (checked: boolean, event: React.MouseEvent) => void;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Tab index */
  tabIndex?: number;
  /** ID attribute */
  id?: string;
  /** Name attribute for forms */
  name?: string;
  /**
   * Accessible label forwarded to the native input. A switch without
   * `checkedChildren`/`unCheckedChildren` has no visible text of its own, so
   * this is the primary accessible-name path. Same contract field the
   * sibling input primitives (Input, Select, Slider) already expose.
   */
  'aria-label'?: string;
}

export const SWITCH_DEFAULTS: Partial<SwitchProps> = {
  size: 'default',
  disabled: false,
  loading: false,
  defaultChecked: false,
};
