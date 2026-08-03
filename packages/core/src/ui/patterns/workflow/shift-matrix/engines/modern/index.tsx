'use client';

/**
 * @fileoverview Modern (token-driven) engine for the ShiftMatrix pattern.
 * Renders a REAL `<table>` (roles × time slots) inside its own scroll region
 * with sticky header row, sticky role column and a sticky corner. Coverage
 * never reads through colour alone: every cell composes the shared status
 * recipe — governed icon + visually-hidden status label + semantic
 * bg/border/ink tone — on top of the visible assigned/required ratio.
 *
 * INTERACTION LAW: quick-assign cells compose the canonical Button primitive
 * (ghost variant; the family skin owns the caller `data-part` paint per P-79)
 * — keyboard focusable, 44px floor on coarse pointers, with an aria-label
 * naming role, slot, coverage and the action. The classic engine's clickable
 * `<div>` could not be reached by keyboard at all.
 *
 * COPY: all strings resolve through the optional `components` i18n channel
 * with a documented English floor.
 *
 * @example
 * <ModernShiftMatrix
 *   roles={['Bartender', 'Security']}
 *   timeSlots={[{ label: '18:00-21:00', start: '18:00', end: '21:00' }]}
 *   assignments={[{ role: 'Bartender', timeSlot: '18:00-21:00', assigned: 2, required: 3 }]}
 *   onQuickAssign={(role, slot) => openAssign(role, slot)}
 * />
 */

import type { ReactNode } from 'react';
import type { ShiftMatrixProps, ShiftAssignment } from '../../contracts';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import { ModernEmptyState } from '../../../../facade';
import { VisuallyHidden } from '../../../../../primitives/foundation/VisuallyHidden';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';
import { StatusNeutralIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-neutral';

/**
 * Coverage status of an assignment cell.
 * - full: assigned >= required (or nothing required)
 * - gap: some assigned, short of required
 * - critical: nobody assigned, coverage required
 * - empty: no assignment data for the intersection
 */
type CoverageStatus = 'full' | 'gap' | 'critical' | 'empty';

function getCoverageStatus(assignment?: ShiftAssignment): CoverageStatus {
  if (!assignment) return 'empty';
  if (assignment.required === 0) return 'full';
  if (assignment.assigned >= assignment.required) return 'full';
  if (assignment.assigned > 0) return 'gap';
  return 'critical';
}

/** Coverage → governed icon (shape) — tone rides the skin, text rides sr copy. */
const COVERAGE_ICON: Record<CoverageStatus, ReactNode> = {
  full: <StatusSuccessIcon decorative size={14} />,
  gap: <StatusWarningIcon decorative size={14} />,
  critical: <StatusErrorIcon decorative size={14} />,
  empty: <StatusNeutralIcon decorative size={14} />,
};

const COVERAGE_FLOOR: Record<CoverageStatus, string> = {
  full: 'Full coverage',
  gap: 'Gap',
  critical: 'Critical',
  empty: 'No assignment',
};

/** Legend entries (empty intersections read inline, not in the legend). */
const LEGEND_STATUSES: Array<Exclude<CoverageStatus, 'empty'>> = ['full', 'gap', 'critical'];

/**
 * Modern engine for the ShiftMatrix pattern (see the module docblock).
 *
 * @param props - {@link ShiftMatrixProps}
 * @returns A role × time-slot coverage table with quick-assign cells.
 */
export default function ModernShiftMatrix(props: ShiftMatrixProps) {
  const translation = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    translation?.tOr(key, floor, params) ?? floor;

  const { roles, timeSlots, assignments, onQuickAssign, loading, className, style } = props;

  /** Looks up the assignment for a role × slot intersection. */
  const findAssignment = (role: string, timeSlot: string): ShiftAssignment | undefined =>
    assignments.find((a) => a.role === role && a.timeSlot === timeSlot);

  const rootClassName = ['ds-pattern-shift-matrix', 'ds-engine-modern', className]
    .filter(Boolean)
    .join(' ');

  /* Skeleton keeps the matrix footprint (header bar + uniform role rows). */
  if (loading) {
    return (
      <div className={rootClassName} data-part="root" data-loading="true" style={style}>
        <div data-part="skeleton">
          <div data-part="skeleton-header" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`skel-${i}`} data-part="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (roles.length === 0 || timeSlots.length === 0) {
    return (
      <div className={rootClassName} data-part="root" data-loading="false" style={style}>
        <div data-part="empty">
          <ModernEmptyState title={t('shiftMatrix.empty', 'No shifts to display')} />
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} data-part="root" data-loading="false" style={style}>
      <div data-part="table-region">
        <table data-part="table">
          <thead data-part="table-head">
            <tr>
              <th scope="col" data-part="corner-cell">
                {t('shiftMatrix.role', 'Role')}
              </th>
              {timeSlots.map((slot) => (
                <th key={slot.label} scope="col" data-part="slot-header">
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody data-part="table-body">
            {roles.map((role) => (
              <tr key={role} data-part="role-row">
                <th scope="row" data-part="role-header">
                  {role}
                </th>
                {timeSlots.map((slot) => {
                  const assignment = findAssignment(role, slot.label);
                  const status = getCoverageStatus(assignment);
                  const coverageLabel = t(`shiftMatrix.coverage.${status}`, COVERAGE_FLOOR[status]);
                  /* Classic made every non-full cell assignable (gap, critical
                     AND empty intersections) — that capability is preserved. */
                  const assignable = Boolean(onQuickAssign) && status !== 'full';

                  const cellContent = assignment ? (
                    <>
                      <span data-part="cell-ratio">
                        {COVERAGE_ICON[status]}
                        {assignment.assigned}/{assignment.required}
                      </span>
                      <VisuallyHidden>{coverageLabel}</VisuallyHidden>
                      {assignment.staff && assignment.staff.length > 0 && (
                        <span data-part="cell-staff" title={assignment.staff.join(', ')}>
                          {assignment.staff.join(', ')}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span data-part="cell-empty" aria-hidden="true">
                        —
                      </span>
                      <VisuallyHidden>{coverageLabel}</VisuallyHidden>
                    </>
                  );

                  return (
                    <td
                      key={`${role}-${slot.label}`}
                      data-part="cell"
                      data-coverage={status}
                      data-assignable={assignable || undefined}
                    >
                      {assignable ? (
                        /* Canonical Button primitive (ghost = zero chrome);
                           htmlType defaults to "button". The skin pins the
                           family paint over the caller part (P-79). */
                        <ModernButton
                          variant="ghost"
                          data-part="cell-button"
                          aria-label={t(
                            'shiftMatrix.cell.assignAria',
                            `${role}, ${slot.label}: ${assignment?.assigned ?? 0} of ${assignment?.required ?? 0} assigned — ${coverageLabel}. Activate to quick-assign.`,
                            {
                              role,
                              slot: slot.label,
                              assigned: assignment?.assigned ?? 0,
                              required: assignment?.required ?? 0,
                              coverage: coverageLabel,
                            }
                          )}
                          onClick={() => onQuickAssign?.(role, slot.label)}
                        >
                          {cellContent}
                        </ModernButton>
                      ) : (
                        <div data-part="cell-static">{cellContent}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend: icon + label (+ tone swatch in the skin), never colour alone. */}
      <div data-part="legend" role="list">
        {LEGEND_STATUSES.map((status) => (
          <span key={status} data-part="legend-item" data-coverage={status} role="listitem">
            {COVERAGE_ICON[status]}
            {t(`shiftMatrix.legend.${status}`, COVERAGE_FLOOR[status])}
          </span>
        ))}
      </div>
    </div>
  );
}
