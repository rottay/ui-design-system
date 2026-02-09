'use client';

/**
 * PolicyRuleEditor - Visual Preset
 * Drag-style condition builder with visual rule cards
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PolicyRuleEditorProps, PolicyRule, PolicyCondition } from '../../core';
import {
  getActionColors,
  getOperatorLabel,
  getActionLabel,
  formatConditionValue,
} from '../../core';

export const VisualPolicyRuleEditor = createPreset<PolicyRuleEditorProps>({
  name: 'PolicyRuleEditor.Visual',
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

    const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);
    const [expandedRuleId, setExpandedRuleId] = useState<string | null>(selectedRuleId ?? null);

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    const renderCondition = (condition: PolicyCondition, idx: number, total: number) => (
      <Box
        key={idx}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          fontSize: tokens.typography.fontSize.sm,
        }}
      >
        {/* Field */}
        <span style={{
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.primaryScale[700],
          backgroundColor: tokens.colors.primaryScale[50],
          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.sm,
        }}>
          {condition.field}
        </span>

        {/* Operator */}
        <span style={{ color: tokens.colors.neutral[500] }}>
          {getOperatorLabel(condition.operator)}
        </span>

        {/* Value */}
        <span style={{
          fontWeight: tokens.typography.fontWeight.medium,
          color: tokens.colors.neutral[800],
          backgroundColor: tokens.colors.common.white,
          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.sm,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          {formatConditionValue(condition.value)}
        </span>

        {/* AND connector */}
        {idx < total - 1 && (
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.warningScale[600],
            marginLeft: tokens.spacing[1],
          }}>
            AND
          </span>
        )}
      </Box>
    );

    return (
      <Box
        className={className}
        style={{
          padding: tokens.spacing[5],
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
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

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            Loading...
          </Box>
        ) : sortedRules.length === 0 ? (
          <Box style={{
            textAlign: 'center',
            padding: tokens.spacing[8],
            color: tokens.colors.neutral[400],
            border: `2px dashed ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.lg,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No rules defined. Create your first rule to get started.</Text>
          </Box>
        ) : (
          <Stack direction="vertical" spacing="md">
            {sortedRules.map((rule) => {
              const aColors = actionColors[rule.action];
              const isHovered = hoveredRuleId === rule.id;
              const isExpanded = expandedRuleId === rule.id;
              const isSelected = selectedRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  onMouseEnter={() => setHoveredRuleId(rule.id)}
                  onMouseLeave={() => setHoveredRuleId(null)}
                  style={{
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : isHovered ? tokens.colors.neutral[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    overflow: 'hidden',
                    transition: `all ${tokens.motion.hover}`,
                    opacity: rule.enabled ? 1 : 0.6,
                    boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.sm : 'none',
                  }}
                >
                  {/* Rule header */}
                  <div
                    onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      cursor: 'pointer',
                    }}
                  >
                    {/* Priority */}
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[400],
                      minWidth: '24px',
                      textAlign: 'center',
                    }}>
                      #{rule.priority}
                    </span>

                    {/* Toggle */}
                    <div
                      onClick={(e) => { e.stopPropagation(); onToggleRule?.(rule.id); }}
                      style={{
                        width: '36px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                        position: 'relative',
                        cursor: 'pointer',
                        transition: `background-color ${tokens.motion.hover}`,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: rule.enabled ? '18px' : '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        transition: `left ${tokens.motion.hover}`,
                        boxShadow: tokens.shadows.sm,
                      }} />
                    </div>

                    {/* Name */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {rule.name}
                      </Text>
                    </Box>

                    {/* Condition count */}
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      backgroundColor: tokens.colors.neutral[100],
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                    }}>
                      {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                    </span>

                    {/* Action badge */}
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

                    {/* Expand icon */}
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: `transform ${tokens.motion.hover}`,
                      display: 'inline-block',
                    }}>
                      \u25B8
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <Box style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      backgroundColor: tokens.colors.neutral[50],
                    }}>
                      {/* Description */}
                      {rule.description && (
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          marginBottom: tokens.spacing[3],
                        }}>
                          {rule.description}
                        </Text>
                      )}

                      {/* Conditions */}
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Conditions
                      </Text>
                      <Stack direction="vertical" spacing="xs">
                        {rule.conditions.map((cond, idx) =>
                          renderCondition(cond, idx, rule.conditions.length)
                        )}
                      </Stack>

                      {/* Actions */}
                      <Box style={{
                        display: 'flex',
                        gap: tokens.spacing[2],
                        marginTop: tokens.spacing[4],
                        paddingTop: tokens.spacing[3],
                        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}>
                        {onEditRule && (
                          <button
                            onClick={() => onEditRule(rule.id)}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                              backgroundColor: tokens.colors.common.white,
                              color: tokens.colors.neutral[700],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
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
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                              backgroundColor: tokens.colors.errorScale[50],
                              color: tokens.colors.errorScale[600],
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Delete
                          </button>
                        )}
                        <Box style={{ flex: 1 }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], alignSelf: 'center' }}>
                          Updated {rule.updatedAt.toLocaleDateString()}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </div>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  },
});
