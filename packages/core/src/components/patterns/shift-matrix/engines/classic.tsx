'use client';

/**
 * @fileoverview Classic engine for the ShiftMatrix pattern.
 * Renders a grid table with roles on the Y axis, time slots on the X axis,
 * and cells colored by coverage status (green for full, yellow for gap,
 * red for critical shortage).
 */

import React from 'react';
import { Box, Flex } from '../../../primitives/layout';
import { Text } from '../../../primitives/display';
import type { ShiftMatrixProps, ShiftAssignment } from '../ShiftMatrix.types';

/**
 * Determines the coverage status of an assignment cell.
 * - full: assigned >= required
 * - gap: assigned > 0 but < required
 * - critical: assigned === 0 and required > 0
 * - empty: no assignment data
 */
type CoverageStatus = 'full' | 'gap' | 'critical' | 'empty';

function getCoverageStatus(assignment?: ShiftAssignment): CoverageStatus {
  if (!assignment) return 'empty';
  if (assignment.required === 0) return 'full';
  if (assignment.assigned >= assignment.required) return 'full';
  if (assignment.assigned > 0) return 'gap';
  return 'critical';
}

/** Background colors for coverage status using CSS variables. */
const COVERAGE_BG: Record<CoverageStatus, string> = {
  full: 'color-mix(in srgb, var(--ds-color-success) 12%, transparent)',
  gap: 'color-mix(in srgb, var(--ds-color-warning) 12%, transparent)',
  critical: 'color-mix(in srgb, var(--ds-color-error) 12%, transparent)',
  empty: 'transparent',
};

/** Border colors for coverage status. */
const COVERAGE_BORDER: Record<CoverageStatus, string> = {
  full: 'color-mix(in srgb, var(--ds-color-success) 30%, transparent)',
  gap: 'color-mix(in srgb, var(--ds-color-warning) 30%, transparent)',
  critical: 'color-mix(in srgb, var(--ds-color-error) 30%, transparent)',
  empty: 'color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent)',
};

/** Text color for the assigned/required ratio. */
const COVERAGE_TEXT: Record<CoverageStatus, string> = {
  full: 'var(--ds-color-success)',
  gap: 'var(--ds-color-warning)',
  critical: 'var(--ds-color-error)',
  empty: 'var(--ds-color-text-muted)',
};

/**
 * Classic engine ShiftMatrix.
 * Renders a table grid with roles on Y, time slots on X, and coverage-colored cells.
 */
export default function ClassicShiftMatrix(props: ShiftMatrixProps) {
  const {
    roles,
    timeSlots,
    assignments,
    onQuickAssign,
    loading,
    className,
    style,
  } = props;

  /** Looks up the assignment for a given role + timeSlot combination. */
  function findAssignment(role: string, timeSlot: string): ShiftAssignment | undefined {
    return assignments.find((a) => a.role === role && a.timeSlot === timeSlot);
  }

  if (loading) {
    return (
      <Box
        className={className}
        style={{
          padding: '20px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          ...style,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={`skel-${i}`}
            style={{
              width: '100%',
              height: 40,
              borderRadius: 4,
              background: 'var(--ds-color-bg-secondary)',
              marginBottom: 8,
            }}
          />
        ))}
      </Box>
    );
  }

  const colWidth = `${Math.max(120, Math.floor(700 / Math.max(timeSlots.length, 1)))}px`;

  return (
    <Box
      className={`ds-pattern-shift-matrix ds-engine-classic ${className ?? ''}`}
      style={{
        background: 'var(--ds-color-bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
        overflow: 'auto',
        ...style,
      }}
    >
      {/* Header row with time slots */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: `160px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
          borderBottom: '2px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent))',
        }}
      >
        {/* Corner cell */}
        <Box
          style={{
            padding: '12px 16px',
            background: 'var(--ds-color-bg-secondary)',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              color: 'var(--ds-color-text-muted)',
            }}
          >
            Role
          </Text>
        </Box>

        {/* Time slot headers */}
        {timeSlots.map((slot) => (
          <Box
            key={slot.label}
            style={{
              padding: '12px 16px',
              background: 'var(--ds-color-bg-secondary)',
              textAlign: 'center' as const,
              borderLeft: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ds-color-text-primary)',
              }}
            >
              {slot.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Role rows */}
      {roles.map((role, roleIdx) => (
        <Box
          key={role}
          style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
            borderBottom:
              roleIdx < roles.length - 1
                ? '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))'
                : 'none',
          }}
        >
          {/* Role label */}
          <Flex
            align="center"
            style={{
              padding: '14px 16px',
              background:
                roleIdx % 2 === 0
                  ? 'transparent'
                  : 'color-mix(in srgb, var(--ds-color-bg-secondary) 40%, transparent)',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ds-color-text-primary)',
              }}
            >
              {role}
            </Text>
          </Flex>

          {/* Time slot cells */}
          {timeSlots.map((slot) => {
            const assignment = findAssignment(role, slot.label);
            const status = getCoverageStatus(assignment);

            return (
              <Box
                key={`${role}-${slot.label}`}
                onClick={
                  onQuickAssign && status !== 'full'
                    ? () => onQuickAssign(role, slot.label)
                    : undefined
                }
                style={{
                  padding: '10px 12px',
                  background: COVERAGE_BG[status],
                  borderLeft: `1px solid ${COVERAGE_BORDER[status]}`,
                  cursor: onQuickAssign && status !== 'full' ? 'pointer' : 'default',
                  transition: 'background 150ms ease',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                {assignment ? (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: COVERAGE_TEXT[status],
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                      }}
                    >
                      {assignment.assigned}/{assignment.required}
                    </Text>
                    {assignment.staff && assignment.staff.length > 0 && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: 'var(--ds-color-text-muted)',
                          textAlign: 'center' as const,
                          lineHeight: 1.3,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {assignment.staff.join(', ')}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    --
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>
      ))}

      {/* Legend */}
      <Flex
        gap={16}
        align="center"
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))',
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        {[
          { label: 'Full Coverage', color: 'var(--ds-color-success)' },
          { label: 'Gap', color: 'var(--ds-color-warning)' },
          { label: 'Critical', color: 'var(--ds-color-error)' },
        ].map((item) => (
          <Flex key={item.label} align="center" gap={6}>
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: item.color,
              }}
            />
            <Text style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>
              {item.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
