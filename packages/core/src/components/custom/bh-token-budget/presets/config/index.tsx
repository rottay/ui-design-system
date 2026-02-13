'use client';

/**
 * BhTokenBudget - Config Preset
 * Full budget configuration view with allocations, progress bars,
 * alert thresholds, and save action. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Wallet, AlertTriangle, TrendingUp, Save,
  Settings, DollarSign, Users, Bell,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhTokenBudgetProps, BudgetAllocation } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ALLOCATIONS: BudgetAllocation[] = [
  { teamId: 't-1', teamName: 'Engineering', allocated: 5000, used: 3200, alertThreshold: 80 },
  { teamId: 't-2', teamName: 'Product', allocated: 3000, used: 2700, alertThreshold: 75 },
  { teamId: 't-3', teamName: 'Design', allocated: 2000, used: 800, alertThreshold: 90 },
  { teamId: 't-4', teamName: 'Marketing', allocated: 1500, used: 1400, alertThreshold: 85 },
  { teamId: 't-5', teamName: 'Sales', allocated: 2500, used: 1100, alertThreshold: 80 },
];

/* ================================================================== */
/*  Config Preset                                                      */
/* ================================================================== */

export const ConfigBhTokenBudget = createPreset<BhTokenBudgetProps>({
  name: 'BhTokenBudget.Config',
  render: (ctx: PresetContext<BhTokenBudgetProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      allocations = MOCK_ALLOCATIONS,
      totalBudget = 14000,
      totalUsed = 9200,
      currency = '$',
      onAllocationChange,
      onAlertChange,
      onSave,
      loading,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const totalPct = useMemo(() => totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0, [totalBudget, totalUsed]);
    const remaining = useMemo(() => totalBudget - totalUsed, [totalBudget, totalUsed]);

    const overallProgress = useMemo(() => createProgressBarStyle(t, {
      percent: totalPct,
      color: totalPct > 90 ? t.colors.errorScale[500] : totalPct > 70 ? t.colors.warningScale[500] : undefined,
    }), [t, totalPct]);

    const handleSave = useCallback(() => {
      onSave?.();
    }, [onSave]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Wallet size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Token Budget
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Configure team allocations and alert thresholds
                </Text>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Save budget configuration"
              onClick={handleSave}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSave(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                transition: `background-color ${t.motion.hover}`,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
              }}
            >
              <Save size={16} />
              <Text style={{ color: t.colors.common.white, fontSize: t.typography.fontSize.sm }}>Save</Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Summary Cards */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {[
              { label: 'Total Budget', value: `${currency}${totalBudget.toLocaleString()}`, icon: DollarSign, color: t.colors.primaryScale },
              { label: 'Total Used', value: `${currency}${totalUsed.toLocaleString()}`, icon: TrendingUp, color: t.colors.warningScale },
              { label: 'Remaining', value: `${currency}${remaining.toLocaleString()}`, icon: Wallet, color: remaining < 0 ? t.colors.errorScale : t.colors.successScale },
              { label: 'Teams', value: allocations.length.toString(), icon: Users, color: t.colors.infoScale },
            ].map((sc, i) => {
              const Icon = sc.icon;
              return (
                <Box
                  key={sc.label}
                  style={{ ...card, ...hoverStyles.base, ...animStyle(i), display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}
                  role="status"
                  aria-label={`${sc.label}: ${sc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}

                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: sc.color[50] })}>
                      <Icon size={18} color={sc.color[600]} />
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize['2xl'],
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {sc.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginTop: t.spacing[1],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {sc.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Overall Progress */}
          <Box style={{ ...card, ...animStyle(4), marginBottom: t.spacing[7] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <Text style={sectionLabel}>Overall Usage</Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {totalPct.toFixed(1)}%
              </Text>
            </Box>
            <Box style={overallProgress.track}>
              <Box style={overallProgress.fill} />
            </Box>
          </Box>

          {/* Team Allocations */}
          <Box style={{ ...card, ...animStyle(5), padding: 0 }}>
            <Box style={{
              padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[800],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>
                Team Allocations
              </Text>
            </Box>

            <Box role="list" aria-label="Team budget allocations">
              {allocations.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Users size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No team allocations configured
                  </Text>
                </Box>
              )}
              {allocations.map((alloc) => {
                const usePct = alloc.allocated > 0 ? (alloc.used / alloc.allocated) * 100 : 0;
                const isOverThreshold = usePct >= alloc.alertThreshold;
                const progressStyle = createProgressBarStyle(t, {
                  percent: usePct,
                  color: isOverThreshold ? t.colors.errorScale[500] : usePct > 60 ? t.colors.warningScale[500] : t.colors.successScale[500],
                });

                return (
                  <Box
                    key={alloc.teamId}
                    role="listitem"
                    aria-label={`${alloc.teamName}: ${currency}${alloc.used.toLocaleString()} of ${currency}${alloc.allocated.toLocaleString()}`}
                    style={{
                      padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
                          <Users size={14} color={t.colors.primaryScale[600]} />
                        </Box>
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            fontWeight: t.typography.fontWeight.semibold,
                            color: t.colors.neutral[900],
                          }}>
                            {alloc.teamName}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {currency}{alloc.used.toLocaleString()} / {currency}{alloc.allocated.toLocaleString()}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        {isOverThreshold && (
                          <Box style={{
                            ...createBadgeStyle(t, 'error'),
                            borderRadius: badgeRadius,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}>
                            <AlertTriangle size={10} />
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>Alert</Text>
                          </Box>
                        )}
                        <Box style={{
                          ...createBadgeStyle(t, 'secondary'),
                          borderRadius: badgeRadius,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}>
                          <Bell size={10} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{alloc.alertThreshold}%</Text>
                        </Box>
                      </Box>
                    </Box>
                    <Box style={progressStyle.track}>
                      <Box style={progressStyle.fill} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
