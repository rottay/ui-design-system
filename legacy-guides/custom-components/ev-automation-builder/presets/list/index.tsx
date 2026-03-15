'use client';

/**
 * EvAutomationBuilder - List Preset
 * Table view of automation rules with name, trigger summary, action count,
 * enabled toggle, last triggered time, and trigger count.
 * Filter by trigger type with pills. Status indicators for enabled/disabled.
 * Create new rule button in header.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createStatusDotStyle,
  createListItemStyle,
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
    lastTriggered: new Date('2026-02-07T10:30:00'),
    triggerCount: 8,
  },
  {
    id: 'ar4',
    name: 'Peak Hour Pricing',
    trigger: { type: 'time', condition: 'schedule', value: '19:00-23:00' },
    actions: [
      { type: 'adjust-price', target: 'all-tickets', params: { increase: '20%' } },
      { type: 'notify', target: 'sales-team' },
    ],
    enabled: true,
    lastTriggered: new Date('2026-02-09T19:00:00'),
    triggerCount: 45,
  },
  {
    id: 'ar5',
    name: 'Low Sales Alert',
    trigger: { type: 'sales', condition: 'below-target', value: '60%' },
    actions: [
      { type: 'notify', target: 'management' },
      { type: 'send-alert', target: 'marketing-team' },
    ],
    enabled: false,
    triggerCount: 0,
  },
];

const TRIGGER_TYPE_FILTERS = ['All', 'capacity', 'time', 'weather', 'sales', 'inventory'];

const TRIGGER_ICONS: Record<string, string> = {
  capacity: '📊',
  time: '⏰',
  weather: '🌦️',
  sales: '💰',
  inventory: '📦',
};

export const ListEvAutomationBuilder = createPreset<AutomationBuilderProps>({
  name: 'EvAutomationBuilder.List',
  render: ({ primitives, props, tokens }: PresetContext<AutomationBuilderProps>) => {
    const { Box, Text } = primitives;
    const { rules, onRuleToggle, onRuleClick, onCreateRule, onDeleteRule, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = rules?.length ? rules : MOCK_RULES;

    const [triggerFilter, setTriggerFilter] = useState('All');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      if (triggerFilter === 'All') return data;
      return data.filter((r) => r.trigger.type === triggerFilter);
    }, [data, triggerFilter]);

    const enabledCount = data.filter((r) => r.enabled).length;
    const totalTriggers = data.reduce((sum, r) => sum + r.triggerCount, 0);

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

    const formatTriggerSummary = (rule: AutomationRule) => {
      return `${rule.trigger.condition} ${rule.trigger.value}`;
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
              {'⚙️'} Automation Rules
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} total rules {'·'} {enabledCount} enabled {'·'} {totalTriggers} total triggers
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

        {/* KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {[
            { label: 'Total Rules', value: data.length, color: tokens.colors.primaryScale[500] },
            { label: 'Enabled', value: enabledCount, color: tokens.colors.successScale[500] },
            { label: 'Disabled', value: data.length - enabledCount, color: tokens.colors.neutral[400] },
            { label: 'Total Triggers', value: totalTriggers, color: tokens.colors.infoScale[500] },
          ].map((kpi) => (
            <div
              key={kpi.label}
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
                  color: kpi.color,
                  display: 'block',
                }}
              >
                {kpi.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {kpi.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
              }}
            >
              Filter by trigger:
            </Text>
            {TRIGGER_TYPE_FILTERS.map((filter) => (
              <div
                key={filter}
                onClick={() => setTriggerFilter(filter)}
                style={createFilterPillStyle(tokens, { active: triggerFilter === filter })}
              >
                {filter !== 'All' && TRIGGER_ICONS[filter] && `${TRIGGER_ICONS[filter]} `}
                {filter}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, overflow: 'hidden' }}>
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 2fr 1.5fr 80px 100px 100px 100px',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            {['', 'Rule Name', 'Trigger', 'Actions', 'Status', 'Last Triggered', 'Count'].map((header) => (
              <Text
                key={header}
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}
              >
                {header}
              </Text>
            ))}
          </div>

          {/* Table Rows */}
          {filteredData.map((rule) => {
            const isHovered = hoveredRow === rule.id;
            return (
              <div
                key={rule.id}
                onMouseEnter={() => setHoveredRow(rule.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRuleClick?.(rule.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 1.5fr 80px 100px 100px 100px',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                {/* Status Dot */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={createStatusDotStyle(
                      tokens,
                      rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300]
                    )}
                  />
                </div>

                {/* Rule Name */}
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                    }}
                  >
                    {rule.name}
                  </Text>
                </div>

                {/* Trigger */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm }}>
                      {TRIGGER_ICONS[rule.trigger.type] || '⚙️'}
                    </span>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                      {rule.trigger.type}
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      display: 'block',
                    }}
                  >
                    {formatTriggerSummary(rule)}
                  </Text>
                </div>

                {/* Actions Count */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      ...createBadgeStyle(tokens, 'info'),
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    }}
                  >
                    {rule.actions.length}
                  </span>
                </div>

                {/* Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onRuleToggle?.(rule.id, !rule.enabled);
                    }}
                    style={{
                      width: 40,
                      height: 22,
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
                        width: 18,
                        height: 18,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        position: 'absolute' as const,
                        top: 2,
                        left: rule.enabled ? 20 : 2,
                        transition: `left ${tokens.motion.hover}`,
                      }}
                    />
                  </div>
                </div>

                {/* Last Triggered */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    {formatLastTriggered(rule.lastTriggered)}
                  </Text>
                </div>

                {/* Trigger Count */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {rule.triggerCount}
                  </Text>
                </div>
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div
              style={{
                padding: tokens.spacing[8],
                textAlign: 'center' as const,
                color: tokens.colors.neutral[400],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>
                {'🔍'}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No rules match the selected filter</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
