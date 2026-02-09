'use client';

/**
 * PolicyRuleEditor - JSON Preset
 * Raw JSON view of policy rules with syntax-highlighted display
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { PolicyRuleEditorProps, PolicyRule } from '../../core';
import { getActionColors, getActionLabel } from '../../core';

export const JsonPolicyRuleEditor = createPreset<PolicyRuleEditorProps>({
  name: 'PolicyRuleEditor.Json',
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

    const [activeRuleId, setActiveRuleId] = useState<string | null>(selectedRuleId ?? (rules.length > 0 ? rules[0].id : null));
    const activeRule = rules.find((r) => r.id === activeRuleId);

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    const formatRuleJson = (rule: PolicyRule): string => {
      const { id, name, description, conditions, action, priority, enabled } = rule;
      return JSON.stringify({ id, name, description, conditions, action, priority, enabled }, null, 2);
    };

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          display: 'flex',
          height: '100%',
          minHeight: '400px',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Rule list sidebar */}
        <Box style={{
          width: '240px',
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Sidebar header */}
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                {subtitle}
              </Text>
            )}
          </Box>

          {/* Rule list */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
            {loading ? (
              <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                Loading...
              </Box>
            ) : (
              <Stack direction="vertical" spacing="xs">
                {sortedRules.map((rule) => {
                  const isActive = activeRuleId === rule.id;
                  const aColors = actionColors[rule.action];

                  return (
                    <div
                      key={rule.id}
                      onClick={() => setActiveRuleId(rule.id)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        cursor: 'pointer',
                        backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[200] : 'transparent'}`,
                        transition: `all ${tokens.motion.hover}`,
                        opacity: rule.enabled ? 1 : 0.5,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                          color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}>
                          {rule.name}
                        </Text>
                        <span style={{
                          width: tokens.spacing[2],
                          height: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: aColors.dot,
                          flexShrink: 0,
                          marginLeft: tokens.spacing[2],
                        }} />
                      </Box>
                    </div>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Add rule button */}
          {onCreateRule && (
            <Box style={{ padding: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              <button
                onClick={onCreateRule}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                  backgroundColor: 'transparent',
                  color: tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                + New Rule
              </button>
            </Box>
          )}
        </Box>

        {/* JSON viewer */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeRule ? (
            <>
              {/* JSON header */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                    {activeRule.name}
                  </Text>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: actionColors[activeRule.action].color,
                    backgroundColor: actionColors[activeRule.action].bgColor,
                    padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${actionColors[activeRule.action].border}`,
                  }}>
                    {getActionLabel(activeRule.action)}
                  </span>
                </Box>
                <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  {onEditRule && (
                    <button
                      onClick={() => onEditRule(activeRule.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[700],
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
                      onClick={() => onDeleteRule(activeRule.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[600],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </Box>
              </Box>

              {/* JSON content */}
              <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
                <pre style={{
                  margin: 0,
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.neutral[900],
                  color: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {formatRuleJson(activeRule)}
                </pre>
              </Box>
            </>
          ) : (
            <Box style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}>
              Select a rule to view its JSON
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
