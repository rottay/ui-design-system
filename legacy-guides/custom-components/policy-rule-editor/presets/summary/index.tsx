'use client';

/**
 * PolicyRuleEditor - Summary Preset
 * Table view with condition counts and action badges
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PolicyRuleEditorProps } from '../../core';
import { getActionColors, getActionLabel } from '../../core';

export const SummaryPolicyRuleEditor = createPreset<PolicyRuleEditorProps>({
  name: 'PolicyRuleEditor.Summary',
  render: ({ primitives, props, tokens, engine }: PresetContext<PolicyRuleEditorProps>) => {
    const { Box, Stack, Text } = primitives;
    const actionColors = getActionColors(tokens);

    const {
      rules,
      onCreateRule,
      onEditRule,
      onDeleteRule,
      onToggleRule,
      selectedRuleId,
      title = 'Policy Rules',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    const headerCellStyle = {
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[500],
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      textAlign: 'left' as const,
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
    };

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>
                {subtitle}
              </p>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {rules.length} rule{rules.length !== 1 ? 's' : ''}
            </Text>
            {onCreateRule && (
              <button
                onClick={onCreateRule}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                + Add Rule
              </button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            Loading...
          </Box>
        ) : sortedRules.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No rules found</Text>
          </Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...headerCellStyle, width: '48px' }}>#</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>Conditions</th>
                  <th style={headerCellStyle}>Action</th>
                  <th style={headerCellStyle}>Updated</th>
                  <th style={{ ...headerCellStyle, width: '80px' }} />
                </tr>
              </thead>
              <tbody>
                {sortedRules.map((rule) => {
                  const aColors = actionColors[rule.action];
                  const isHovered = hoveredRowId === rule.id;
                  const isSelected = selectedRuleId === rule.id;

                  const cellStyle = {
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isSelected
                      ? tokens.colors.primaryScale[50]
                      : isHovered
                        ? tokens.colors.neutral[50]
                        : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  };

                  return (
                    <tr
                      key={rule.id}
                      onMouseEnter={() => setHoveredRowId(rule.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td style={{ ...cellStyle, color: tokens.colors.neutral[400], fontWeight: tokens.typography.fontWeight.medium }}>
                        {rule.priority}
                      </td>
                      <td style={cellStyle}>
                        <div
                          onClick={() => onToggleRule?.(rule.id)}
                          style={{
                            width: '32px',
                            height: '18px',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                            position: 'relative',
                            cursor: onToggleRule ? 'pointer' : 'default',
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: rule.enabled ? '16px' : '2px',
                            width: '14px',
                            height: '14px',
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.common.white,
                            transition: `left ${tokens.motion.hover}`,
                            boxShadow: tokens.shadows.sm,
                          }} />
                        </div>
                      </td>
                      <td style={{ ...cellStyle, color: tokens.colors.neutral[800], fontWeight: tokens.typography.fontWeight.medium }}>
                        <Box>
                          <Text style={{ fontWeight: tokens.typography.fontWeight.medium }}>{rule.name}</Text>
                          {rule.description && (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[0] }}>
                              {rule.description}
                            </Text>
                          )}
                        </Box>
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          backgroundColor: tokens.colors.neutral[100],
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                        }}>
                          {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: aColors.color,
                          backgroundColor: aColors.bgColor,
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${aColors.border}`,
                        }}>
                          {getActionLabel(rule.action)}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>
                        {rule.updatedAt.toLocaleDateString()}
                      </td>
                      <td style={cellStyle}>
                        <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          {onEditRule && (
                            <button
                              onClick={() => onEditRule(rule.id)}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                backgroundColor: tokens.colors.common.white,
                                color: tokens.colors.neutral[600],
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {onDeleteRule && (
                            <button
                              onClick={() => onDeleteRule(rule.id)}
                              style={{
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                                backgroundColor: 'transparent',
                                color: tokens.colors.errorScale[500],
                                fontSize: tokens.typography.fontSize.xs,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              \u00D7
                            </button>
                          )}
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    );
  },
});
