/**
 * @fileoverview Type definitions for the ShiftMatrix pattern component.
 *
 * ShiftMatrix renders a role x time x event grid showing coverage gaps
 * and availability overlay. Cells are colored by coverage status (full,
 * gap, critical) with optional quick-assign interaction.
 *
 * @module Patterns/ShiftMatrix/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { PatternBaseProps } from '../../foundation/types';

/**
 * A time slot column in the shift matrix.
 */
export interface ShiftTimeSlot {
  /** Display label for the time slot (e.g., "9:00 - 12:00"). */
  label: string;
  /** ISO 8601 or time string for the slot start. */
  start: string;
  /** ISO 8601 or time string for the slot end. */
  end: string;
}

/**
 * An assignment cell in the shift matrix linking a role to a time slot.
 */
export interface ShiftAssignment {
  /** Role name (must match an entry in the `roles` array). */
  role: string;
  /** Time slot label (must match a `ShiftTimeSlot.label`). */
  timeSlot: string;
  /** Number of staff currently assigned. */
  assigned: number;
  /** Number of staff required for full coverage. */
  required: number;
  /** Names or identifiers of assigned staff members. */
  staff?: string[];
}

/**
 * Props for the ShiftMatrix pattern component.
 *
 * Renders a grid table with roles on the Y axis, time slots on the X axis,
 * and cells colored by coverage status (green for full, yellow for gap,
 * red for critical shortage).
 *
 * @example
 * ```tsx
 * <PatternShiftMatrix
 *   roles={['Bartender', 'Security', 'DJ']}
 *   timeSlots={[
 *     { label: '18:00-21:00', start: '18:00', end: '21:00' },
 *     { label: '21:00-00:00', start: '21:00', end: '00:00' },
 *   ]}
 *   assignments={[
 *     { role: 'Bartender', timeSlot: '18:00-21:00', assigned: 2, required: 3, staff: ['Ana', 'Bob'] },
 *     { role: 'Security', timeSlot: '18:00-21:00', assigned: 4, required: 4, staff: ['C', 'D', 'E', 'F'] },
 *   ]}
 *   onQuickAssign={(role, timeSlot) => openAssignModal(role, timeSlot)}
 * />
 * ```
 */
export interface ShiftMatrixProps extends PatternBaseProps {
  /** Role names displayed on the Y axis. */
  roles: string[];
  /** Time slot definitions displayed on the X axis. */
  timeSlots: ShiftTimeSlot[];
  /** Assignment data for each role-timeSlot intersection. */
  assignments: ShiftAssignment[];
  /** Callback fired when a user clicks a cell to quick-assign staff. */
  onQuickAssign?: (role: string, timeSlot: string) => void;
}
