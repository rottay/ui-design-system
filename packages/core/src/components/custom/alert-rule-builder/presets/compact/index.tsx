'use client';

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { AlertRuleBuilderProps, AlertRule } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createAccentBarStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
  createStatusDotStyle,
} from '../../../helpers';

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactPreset = createPreset<AlertRuleBuilderProps>((context: PresetContext<AlertRuleBuilderProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Switch, Button, Spinner } = primitives;
  const { rules, onDelete, onToggle, className, style } = props;

  const isGlass = engine === 'modern' && !!tokens.glass;
  const [hoveredRuleId, setHoveredRuleId] = useState<string | null>(null);
  const [isLoading] = useState(false);

  /* -- memoised styles -------------------------------------------- */

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
    overflow: 'hidden', padding: 0, ...style,
  }), [tokens, isGlass, style]);

  const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const panelHeader = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
  const countBadge = useMemo(() => createBadgeStyle(tokens, 'primary'), [tokens]);
  const hoverBase = useMemo(() => createHoverStyle(tokens), [tokens]);
  const hoverTransform = useMemo(() => getHoverTransform(tokens), [tokens]);
  const hoverShadow = useMemo(() => getCardHoverShadow(tokens, 'sm'), [tokens]);

  const sectionLabelStyle: React.CSSProperties = useMemo(() => ({
    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[500], textTransform: 'uppercase' as const,
    letterSpacing: '0.04em', marginBottom: tokens.spacing[1],
  }), [tokens]);

  /* -- loading state ---------------------------------------------- */

  if (isLoading) {
    return (
      <Box className={className} style={containerStyle}>
        <Box style={accentBar} />
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing[8] }}>
          <Spinner size="sm" />
        </Box>
      </Box>
    );
  }

  /* -- render rule card ------------------------------------------- */

  const renderRule = (rule: AlertRule) => {
    const isHovered = hoveredRuleId === rule.id;
    const listItem = createListItemStyle(tokens, { interactive: true });
    const statusDot = createStatusDotStyle(tokens, rule.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[400]);

    const ruleCardStyle: React.CSSProperties = {
      ...listItem, ...hoverBase, display: 'flex', flexDirection: 'column',
      gap: tokens.spacing[3], padding: tokens.spacing[4],
      margin: `0 ${tokens.spacing[3]} ${tokens.spacing[2]}`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isHovered ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
      transform: isHovered ? hoverTransform.transform : 'none',
      boxShadow: isHovered ? hoverShadow : tokens.shadows.sm,
    };

    return (
      <Box key={rule.id} style={ruleCardStyle}
        onMouseEnter={() => setHoveredRuleId(rule.id)}
        onMouseLeave={() => setHoveredRuleId(null)}
      >
        {/* Rule header row */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: tokens.spacing[3] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, minWidth: 0 }}>
            <Box style={statusDot} />
            <Text style={{
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {rule.name}
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
            <Switch checked={rule.enabled} onChange={() => onToggle?.(rule.id, !rule.enabled)} />
            <Button variant="ghost" size="sm" onClick={() => onDelete?.(rule.id)}
              style={{ color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
              Delete
            </Button>
          </Box>
        </Box>

        {/* Conditions section */}
        {rule.conditions.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], position: 'relative' }}>
            <Text style={sectionLabelStyle}>Conditions</Text>
            {/* Vertical connector line */}
            {rule.conditions.length > 1 && (
              <Box style={{
                position: 'absolute', left: tokens.spacing[3], top: tokens.spacing[7], bottom: tokens.spacing[2],
                width: tokens.surface.borderWidth || '1px',
                borderLeft: `${tokens.surface.borderWidth || '1px'} dashed ${tokens.colors.neutral[300]}`,
              }} />
            )}
            {rule.conditions.map((condition, condIndex) => (
              <React.Fragment key={condIndex}>
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                  paddingLeft: rule.conditions.length > 1 ? tokens.spacing[5] : 0,
                }}>
                  <Text style={{ ...createBadgeStyle(tokens, 'info'), whiteSpace: 'nowrap' }}>
                    {condition.field} {condition.operator} {condition.value}
                  </Text>
                </Box>
                {/* Conjunction connector */}
                {condition.conjunction && condIndex < rule.conditions.length - 1 && (
                  <Box style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    paddingLeft: rule.conditions.length > 1 ? tokens.spacing[5] : 0,
                  }}>
                    <Text style={{
                      ...createBadgeStyle(tokens, 'secondary'), fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold, textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em', padding: `0 ${tokens.spacing[2]}`,
                    }}>
                      {condition.conjunction.toUpperCase()}
                    </Text>
                  </Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Actions section */}
        {rule.actions.length > 0 && (
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
            <Text style={sectionLabelStyle}>Actions</Text>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
              {rule.actions.map((action, actIndex) => (
                <Text key={actIndex} style={{ ...createBadgeStyle(tokens, 'success'), whiteSpace: 'nowrap' }}>
                  {action.type}
                </Text>
              ))}
            </Box>
          </Box>
        )}

        {/* Summary counts */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
          paddingTop: tokens.spacing[2],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{'\u00B7'}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
          </Text>
        </Box>
      </Box>
    );
  };

  /* -- main render ------------------------------------------------ */

  return (
    <Box className={className} style={containerStyle}>
      <Box style={accentBar} />

      {/* Panel header */}
      <Box style={{
        ...panelHeader, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
      }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
          Alert Rules
        </Text>
        <Text style={countBadge}>
          {rules.length} {rules.length === 1 ? 'rule' : 'rules'}
        </Text>
      </Box>

      {/* Rules list */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], padding: `${tokens.spacing[2]} 0 ${tokens.spacing[3]}` }}>
        {rules.map((rule) => renderRule(rule))}
      </Box>
    </Box>
  );
});

CompactPreset.displayName = 'AlertRuleBuilderCompactPreset';
