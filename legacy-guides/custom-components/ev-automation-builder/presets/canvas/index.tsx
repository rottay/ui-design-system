'use client';

/**
 * EvAutomationBuilder - Canvas Preset
 * Visual node editor showing trigger → condition → actions as connected cards.
 * Each rule rendered as a flow diagram with drag-and-drop visual style.
 * Selected rule shows details panel with configuration summary.
 * Add trigger/action buttons for rule creation.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
  getHoverTransform,
} from '../../../helpers';
import type { AutomationBuilderProps, AutomationRule } from '../../core';

const MOCK_RULES: AutomationRule[] = [
  {
    id: 'ar1',
    name: 'High Capacity Alert',
    trigger: { type: 'capacity', condition: 'exceeds', value: '85%' },
    actions: [
      { type: 'notify', target: 'operations-team' },
      { type: 'close-entry', target: 'main-gate' },
      { type: 'send-alert', target: 'mobile-app' },
    ],
    enabled: true,
    lastTriggered: new Date('2026-02-08T20:45:00'),
    triggerCount: 12,
  },
  {
    id: 'ar2',
    name: 'Storm Contingency',
    trigger: { type: 'weather', condition: 'storm-warning', value: 'active' },
    actions: [
      { type: 'notify', target: 'all-staff' },
      { type: 'assign-staff', target: 'shelter-team', params: { count: '5' } },
    ],
    enabled: true,
    lastTriggered: new Date('2026-02-05T14:20:00'),
    triggerCount: 3,
  },
  {
    id: 'ar3',
    name: 'Low Inventory Reorder',
    trigger: { type: 'inventory', condition: 'below', value: '20 units' },
    actions: [
      { type: 'notify', target: 'procurement' },
      { type: 'send-alert', target: 'inventory-manager' },
    ],
    enabled: false,
    triggerCount: 0,
  },
];

const TRIGGER_ICONS: Record<string, string> = {
  capacity: '📊',
  time: '⏰',
  weather: '🌦️',
  sales: '💰',
  inventory: '📦',
};

const ACTION_ICONS: Record<string, string> = {
  notify: '📧',
  'close-entry': '🚪',
  'adjust-price': '💵',
  'assign-staff': '👥',
  'send-alert': '🔔',
};

export const CanvasEvAutomationBuilder = createPreset<AutomationBuilderProps>({
  name: 'EvAutomationBuilder.Canvas',
  render: ({ primitives, props, tokens }: PresetContext<AutomationBuilderProps>) => {
    const { Box, Text } = primitives;
    const { rules, onRuleToggle, onRuleClick, onCreateRule, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = rules?.length ? rules : MOCK_RULES;

    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(data[0]?.id || null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const selectedRule = useMemo(
      () => data.find((r) => r.id === selectedRuleId),
      [data, selectedRuleId]
    );

    const handleRuleClick = (ruleId: string) => {
      setSelectedRuleId(ruleId);
      onRuleClick?.(ruleId);
    };

    const formatTriggerSummary = (rule: AutomationRule) => {
      const icon = TRIGGER_ICONS[rule.trigger.type] || '⚙️';
      return `${icon} ${rule.trigger.type}: ${rule.trigger.condition} ${rule.trigger.value}`;
    };

    const formatLastTriggered = (date?: Date) => {
      if (!date) return 'Never';
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    };

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
              {'⚙️'} Automation Builder
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} rules {'·'} {data.filter((r) => r.enabled).length} enabled
            </Text>
          </div>
          <div
            onClick={() => onCreateRule?.()}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              ...hoverStyle,
            }}
          >
            + Create Rule
          </div>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'flex-start' }}>
          {/* Rules List (Left Sidebar) */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  marginBottom: tokens.spacing[2],
                }}
              >
                Rules
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {data.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                return (
                  <div
                    key={rule.id}
                    onClick={() => handleRuleClick(rule.id)}
                    style={{
                      ...cardBase,
                      padding: tokens.spacing[3],
                      cursor: 'pointer',
                      borderLeft: isSelected
                        ? `3px solid ${tokens.colors.primaryScale[500]}`
                        : `3px solid transparent`,
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : tokens.colors.common.white,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          flex: 1,
                        }}
                      >
                        {rule.name}
                      </Text>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onRuleToggle?.(rule.id, !rule.enabled);
                        }}
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: rule.enabled
                            ? tokens.colors.successScale[500]
                            : tokens.colors.neutral[300],
                          position: 'relative' as const,
                          cursor: 'pointer',
                          transition: `background-color ${tokens.motion.hover}`,
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.common.white,
                            position: 'absolute' as const,
                            top: 2,
                            left: rule.enabled ? 18 : 2,
                            transition: `left ${tokens.motion.hover}`,
                          }}
                        />
                      </div>
                    </div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {formatTriggerSummary(rule)}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {rule.triggerCount} triggers
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {'·'}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {formatLastTriggered(rule.lastTriggered)}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas Area (Visual Flow) */}
          {selectedRule && (
            <div style={{ flex: 1 }}>
              <div style={{ ...cardBase, padding: tokens.spacing[6], minHeight: 500 }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[8] }}>
                  {/* Trigger Node */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      onMouseEnter={() => setHoveredNode('trigger')}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        padding: tokens.spacing[4],
                        borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.primaryScale[50],
                        border: `2px solid ${tokens.colors.primaryScale[300]}`,
                        minWidth: 280,
                        textAlign: 'center' as const,
                        transform: hoveredNode === 'trigger' ? 'scale(1.02)' : 'scale(1)',
                        transition: `all ${tokens.motion.hover}`,
                        boxShadow: hoveredNode === 'trigger' ? tokens.shadows.md : tokens.shadows.sm,
                      }}
                    >
                      <div
                        style={{
                          fontSize: tokens.typography.fontSize['2xl'],
                          marginBottom: tokens.spacing[2],
                        }}
                      >
                        {TRIGGER_ICONS[selectedRule.trigger.type] || '⚙️'}
                      </div>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[600],
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        Trigger
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        {selectedRule.trigger.type.toUpperCase()}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          display: 'block',
                        }}
                      >
                        {selectedRule.trigger.condition} {selectedRule.trigger.value}
                      </Text>
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div
                    style={{
                      width: 2,
                      height: 40,
                      backgroundColor: tokens.colors.neutral[300],
                      alignSelf: 'center',
                    }}
                  />

                  {/* Condition Node */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[100],
                        border: `2px solid ${tokens.colors.neutral[300]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        IF condition met, THEN execute:
                      </Text>
                    </div>
                  </div>

                  {/* Connector Line */}
                  <div
                    style={{
                      width: 2,
                      height: 40,
                      backgroundColor: tokens.colors.neutral[300],
                      alignSelf: 'center',
                    }}
                  />

                  {/* Action Nodes */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: tokens.spacing[3],
                    }}
                  >
                    {selectedRule.actions.map((action, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredNode(`action-${idx}`)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.lg,
                          backgroundColor: tokens.colors.successScale[50],
                          border: `2px solid ${tokens.colors.successScale[300]}`,
                          textAlign: 'center' as const,
                          transform: hoveredNode === `action-${idx}` ? 'scale(1.02)' : 'scale(1)',
                          transition: `all ${tokens.motion.hover}`,
                          boxShadow: hoveredNode === `action-${idx}` ? tokens.shadows.md : tokens.shadows.sm,
                        }}
                      >
                        <div
                          style={{
                            fontSize: tokens.typography.fontSize.xl,
                            marginBottom: tokens.spacing[2],
                          }}
                        >
                          {ACTION_ICONS[action.type] || '⚡'}
                        </div>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.successScale[600],
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.05em',
                            display: 'block',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          Action {idx + 1}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.bold,
                            color: tokens.colors.neutral[900],
                            display: 'block',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          {action.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Text>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            display: 'block',
                          }}
                        >
                          Target: {action.target}
                        </Text>
                        {action.params && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[500],
                              display: 'block',
                              marginTop: tokens.spacing[1],
                            }}
                          >
                            {Object.entries(action.params)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
