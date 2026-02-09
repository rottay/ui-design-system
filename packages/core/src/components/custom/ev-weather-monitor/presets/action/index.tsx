'use client';

/**
 * EvWeatherMonitor - Action Preset
 * Contingency matrix: condition → actions table.
 * Status badges per contingency (standby=info, triggered=warning, resolved=success).
 * Action checklist per triggered contingency. Trigger/Resolve buttons.
 * Weather alert banner at top when conditions are triggered.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
  createListItemStyle,
} from '../../../helpers';
import type { WeatherMonitorProps, Contingency } from '../../core';

const MOCK_CONTINGENCIES: Contingency[] = [
  {
    id: 'cont1',
    condition: 'Heavy Rain',
    threshold: '>60% probability',
    actions: [
      'Deploy rain covers over vendor areas',
      'Activate additional drainage pumps',
      'Alert attendees via mobile app',
      'Position staff at covered shelters',
    ],
    status: 'triggered',
  },
  {
    id: 'cont2',
    condition: 'High Winds',
    threshold: '>20 mph sustained',
    actions: [
      'Secure loose equipment and signage',
      'Close outdoor vendor stalls',
      'Suspend stage rigging operations',
      'Monitor structural integrity',
    ],
    status: 'standby',
  },
  {
    id: 'cont3',
    condition: 'Storm Warning',
    threshold: 'Lightning within 10 miles',
    actions: [
      'Evacuate outdoor areas immediately',
      'Shelter-in-place announcement',
      'Suspend all electrical operations',
      'Medical team on high alert',
      'Notify local emergency services',
    ],
    status: 'standby',
  },
  {
    id: 'cont4',
    condition: 'Temperature Drop',
    threshold: '<50°F',
    actions: [
      'Activate portable heaters in VIP areas',
      'Provide blankets at guest services',
      'Monitor attendee comfort',
    ],
    status: 'resolved',
  },
];

const STATUS_CONFIG: Record<
  string,
  { color: 'info' | 'warning' | 'success'; label: string; dotColor: string }
> = {
  standby: { color: 'info', label: 'Standby', dotColor: '' },
  triggered: { color: 'warning', label: 'Triggered', dotColor: '' },
  resolved: { color: 'success', label: 'Resolved', dotColor: '' },
};

export const ActionEvWeatherMonitor = createPreset<WeatherMonitorProps>({
  name: 'EvWeatherMonitor.Action',
  render: ({ primitives, props, tokens }: PresetContext<WeatherMonitorProps>) => {
    const { Box, Text } = primitives;
    const { contingencies, onTriggerContingency, onResolve, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = contingencies?.length ? contingencies : MOCK_CONTINGENCIES;

    const [expandedContingency, setExpandedContingency] = useState<string | null>(null);
    const [completedActions, setCompletedActions] = useState<Record<string, Set<number>>>({});

    const triggeredCount = data.filter((c) => c.status === 'triggered').length;
    const standbyCount = data.filter((c) => c.status === 'standby').length;
    const resolvedCount = data.filter((c) => c.status === 'resolved').length;

    const toggleAction = (contingencyId: string, actionIdx: number) => {
      setCompletedActions((prev) => {
        const newState = { ...prev };
        if (!newState[contingencyId]) {
          newState[contingencyId] = new Set();
        }
        if (newState[contingencyId].has(actionIdx)) {
          newState[contingencyId].delete(actionIdx);
        } else {
          newState[contingencyId].add(actionIdx);
        }
        return newState;
      });
    };

    STATUS_CONFIG.standby.dotColor = tokens.colors.infoScale[500];
    STATUS_CONFIG.triggered.dotColor = tokens.colors.warningScale[500];
    STATUS_CONFIG.resolved.dotColor = tokens.colors.successScale[500];

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'⚠️'} Weather Contingencies
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} contingency plans {'·'} {triggeredCount} active
            </Text>
          </div>
        </div>

        {/* Alert Banner */}
        {triggeredCount > 0 && (
          <div
            style={{
              ...cardBase,
              padding: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
              backgroundColor: tokens.colors.warningScale[50],
              borderLeft: `4px solid ${tokens.colors.warningScale[500]}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{'🚨'}</span>
              <div>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.warningScale[800],
                    display: 'block',
                  }}
                >
                  {triggeredCount} Weather Contingenc{triggeredCount === 1 ? 'y' : 'ies'} Active
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[700] }}>
                  Follow action checklists below and monitor conditions closely
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {[
            { label: 'Standby', value: standbyCount, color: tokens.colors.infoScale[500] },
            { label: 'Triggered', value: triggeredCount, color: tokens.colors.warningScale[500] },
            { label: 'Resolved', value: resolvedCount, color: tokens.colors.successScale[500] },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...cardBase,
                padding: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  display: 'block',
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Contingency List */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
          {data.map((contingency) => {
            const isExpanded = expandedContingency === contingency.id;
            const statusConfig = STATUS_CONFIG[contingency.status];
            const completed = completedActions[contingency.id]?.size || 0;
            const total = contingency.actions.length;

            return (
              <div
                key={contingency.id}
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                  borderLeft:
                    contingency.status === 'triggered'
                      ? `4px solid ${tokens.colors.warningScale[500]}`
                      : `4px solid ${tokens.colors.neutral[300]}`,
                }}
              >
                {/* Contingency Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                      <div style={createStatusDotStyle(tokens, statusConfig.dotColor)} />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {contingency.condition}
                      </Text>
                    </div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      Threshold: {contingency.threshold}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={createBadgeStyle(tokens, statusConfig.color)}>{statusConfig.label}</span>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {total} actions
                      </Text>
                      {contingency.status === 'triggered' && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>
                          {completed}/{total} completed
                        </Text>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                    {contingency.status === 'standby' && (
                      <div
                        onClick={() => onTriggerContingency?.(contingency.id)}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.warningScale[500],
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          cursor: 'pointer',
                          ...hoverStyle,
                        }}
                      >
                        Trigger
                      </div>
                    )}
                    {contingency.status === 'triggered' && (
                      <div
                        onClick={() => onResolve?.(contingency.id)}
                        style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.successScale[500],
                          color: tokens.colors.common.white,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          cursor: 'pointer',
                          ...hoverStyle,
                        }}
                      >
                        Resolve
                      </div>
                    )}
                    <div
                      onClick={() =>
                        setExpandedContingency(isExpanded ? null : contingency.id)
                      }
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        cursor: 'pointer',
                        ...hoverStyle,
                      }}
                    >
                      {isExpanded ? 'Hide' : 'Show'} Actions
                    </div>
                  </div>
                </div>

                {/* Action Checklist (Expanded) */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: tokens.spacing[3],
                      paddingTop: tokens.spacing[3],
                      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[600],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      Action Checklist
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                      {contingency.actions.map((action, idx) => {
                        const isCompleted = completedActions[contingency.id]?.has(idx) || false;
                        return (
                          <div
                            key={idx}
                            onClick={() =>
                              contingency.status === 'triggered' &&
                              toggleAction(contingency.id, idx)
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[2],
                              padding: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.sm,
                              backgroundColor: isCompleted
                                ? tokens.colors.successScale[50]
                                : tokens.colors.neutral[50],
                              cursor: contingency.status === 'triggered' ? 'pointer' : 'default',
                              transition: `background-color ${tokens.motion.hover}`,
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: tokens.borderRadius.sm,
                                border: `2px solid ${
                                  isCompleted
                                    ? tokens.colors.successScale[500]
                                    : tokens.colors.neutral[300]
                                }`,
                                backgroundColor: isCompleted
                                  ? tokens.colors.successScale[500]
                                  : tokens.colors.common.white,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {isCompleted && (
                                <span
                                  style={{
                                    color: tokens.colors.common.white,
                                    fontSize: tokens.typography.fontSize.xs,
                                    fontWeight: tokens.typography.fontWeight.bold,
                                  }}
                                >
                                  {'✓'}
                                </span>
                              )}
                            </div>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                color: isCompleted
                                  ? tokens.colors.neutral[600]
                                  : tokens.colors.neutral[900],
                                textDecoration: isCompleted ? 'line-through' : 'none',
                              }}
                            >
                              {action}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
