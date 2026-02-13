'use client';

/**
 * BhCandidateMerge - Merge Preset
 * Full duplicate merge UI with field-level value selection,
 * confidence badge, and action buttons. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  GitMerge, AlertTriangle, CheckCircle, XCircle,
  User, Mail, Phone, Globe, Calendar,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhCandidateMergeProps, MergeCandidate, MergeField } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATES: MergeCandidate[] = [
  { id: 'mc-1', name: 'Sarah Johnson', email: 'sarah.johnson@gmail.com', phone: '+1 (555) 123-4567', source: 'LinkedIn', appliedAt: '2026-01-10' },
  { id: 'mc-2', name: 'Sarah M. Johnson', email: 's.johnson@yahoo.com', phone: '+1 (555) 123-4567', source: 'Career Page', appliedAt: '2026-01-15' },
];

const MOCK_FIELDS: MergeField[] = [
  { field: 'Name', values: ['Sarah Johnson', 'Sarah M. Johnson'], selectedIndex: 0 },
  { field: 'Email', values: ['sarah.johnson@gmail.com', 's.johnson@yahoo.com'], selectedIndex: 0 },
  { field: 'Phone', values: ['+1 (555) 123-4567', '+1 (555) 123-4567'], selectedIndex: 0 },
  { field: 'Source', values: ['LinkedIn', 'Career Page'], selectedIndex: 0 },
  { field: 'Applied', values: ['2026-01-10', '2026-01-15'], selectedIndex: 1 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getFieldIcon(field: string) {
  switch (field.toLowerCase()) {
    case 'name': return User;
    case 'email': return Mail;
    case 'phone': return Phone;
    case 'source': return Globe;
    case 'applied': return Calendar;
    default: return User;
  }
}

/* ================================================================== */
/*  Merge Preset                                                       */
/* ================================================================== */

export const MergeBhCandidateMerge = createPreset<BhCandidateMergeProps>({
  name: 'BhCandidateMerge.Merge',
  render: (ctx: PresetContext<BhCandidateMergeProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      candidates = MOCK_CANDIDATES,
      mergeFields = MOCK_FIELDS,
      title = 'Merge Duplicates',
      onFieldSelect,
      onMerge,
      onCancel,
      confidenceScore = 87,
      loading,
      className,
      style,
    } = props;

    const [localFields, setLocalFields] = useState(mergeFields);
    useEffect(() => { setLocalFields(mergeFields); }, [mergeFields]);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleFieldSelect = useCallback((field: string, idx: number) => {
      setLocalFields(prev => prev.map(f => f.field === field ? { ...f, selectedIndex: idx } : f));
      onFieldSelect?.(field, idx);
    }, [onFieldSelect]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const confidenceBadge = useMemo((): 'success' | 'warning' | 'error' => {
      if (confidenceScore >= 80) return 'success';
      if (confidenceScore >= 50) return 'warning';
      return 'error';
    }, [confidenceScore]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.warningScale[50] })}>
                <GitMerge size={20} color={t.colors.warningScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                  {candidates.length} duplicate records detected
                </Text>
              </Box>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, confidenceBadge),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {confidenceScore}% match
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Candidate cards */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${candidates.length}, 1fr)`,
          gap: t.spacing[3],
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          {candidates.map((candidate, i) => (
            <Box key={candidate.id} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
              ...animStyle(i),
              padding: t.spacing[3],
              borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.common.white,
              border: `1px solid ${t.colors.neutral[100]}`,
              textAlign: 'center',
            }}>
              <Box style={{
                width: 36,
                height: 36,
                borderRadius: t.borderRadius.full,
                backgroundColor: i === 0 ? t.colors.primaryScale[100] : t.colors.warningScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                marginBottom: t.spacing[2],
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  color: i === 0 ? t.colors.primaryScale[700] : t.colors.warningScale[700],
                }}>
                  {candidate.name.charAt(0)}
                </Text>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                {candidate.name}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                via {candidate.source}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Field merge rows */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px` }} role="list" aria-label="Fields to merge">
          {localFields.map((field, fi) => {
            const FieldIcon = getFieldIcon(field.field);
            const valuesMatch = field.values.every(v => v === field.values[0]);

            return (
              <Box
                key={field.field}
                role="listitem"
                style={{
                  ...animStyle(fi + candidates.length),
                  padding: `${t.spacing[3]}px 0`,
                  borderBottom: fi < localFields.length - 1 ? `1px solid ${t.colors.neutral[50]}` : 'none',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                  <FieldIcon size={14} color={t.colors.neutral[500]} />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[600],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {field.field}
                  </Text>
                  {valuesMatch && (
                    <CheckCircle size={12} color={t.colors.successScale[500]} />
                  )}
                  {!valuesMatch && (
                    <AlertTriangle size={12} color={t.colors.warningScale[500]} />
                  )}
                </Box>
                <Box style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${field.values.length}, 1fr)`,
                  gap: t.spacing[2],
                }}>
                  {field.values.map((value, vi) => {
                    const isSelected = field.selectedIndex === vi;
                    return (
                      <Box
                        key={vi}
                        tabIndex={0}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${field.field}: ${value}`}
                        onClick={() => handleFieldSelect(field.field, vi)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleFieldSelect(field.field, vi);
                          }
                        }}
                        style={{
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          borderRadius: t.borderRadius.md,
                          border: isSelected
                            ? `2px solid ${t.colors.primaryScale[400]}`
                            : `1px solid ${t.colors.neutral[200]}`,
                          backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          color: isSelected ? t.colors.primaryScale[700] : t.colors.neutral[700],
                          fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal,
                        }}>
                          {value}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Actions */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          justifyContent: 'flex-end',
          gap: t.spacing[2],
        }}>
          <Box
            tabIndex={0}
            role="button"
            aria-label="Cancel merge"
            onClick={() => onCancel?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel?.(); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <XCircle size={14} color={t.colors.neutral[500]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>Cancel</Text>
          </Box>
          <Box
            tabIndex={0}
            role="button"
            aria-label="Merge records"
            onClick={() => onMerge?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMerge?.(); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.primaryScale[600],
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <GitMerge size={14} color={t.colors.common.white} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
              Merge Records
            </Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
