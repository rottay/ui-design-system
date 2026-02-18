'use client';

/**
 * BhPositionForm - Compact Preset
 * Condensed position form for quick creation in modals/sidebars.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Briefcase, Save, X, Loader2, Flag, Building2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhPositionFormProps, PositionFormData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_FORM: PositionFormData = {
  title: '',
  clientId: '',
  department: '',
  priority: 'normal',
  description: '',
  requirements: '',
  fillType: 'permanent',
  seniorityLevel: 'mid',
  workMode: 'onsite',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createInputStyle(t: DesignTokens, focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
    borderRadius: t.borderRadius.md,
    border: `1px solid ${focused ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
    backgroundColor: t.colors.common.white,
    fontSize: t.typography.fontSize.sm,
    color: t.colors.neutral[900],
    outline: 'none',
    transition: `border-color ${t.motion.hover}`,
    boxShadow: focused ? `0 0 0 2px ${t.colors.primaryScale[100]}` : 'none',
  };
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhPositionForm = createPreset<BhPositionFormProps>({
  name: 'BhPositionForm.Compact',
  render: (ctx: PresetContext<BhPositionFormProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      initialData,
      clients: rawClients = [],
      onSubmit,
      onCancel,
      isEditing = false,
      loading = false,
      className,
      style,
    } = props;

    const clients = Array.isArray(rawClients) ? rawClients : [];

    const [form, setForm] = useState<PositionFormData>({
      ...EMPTY_FORM,
      ...initialData,
    } as PositionFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const updateField = useCallback(<K extends keyof PositionFormData>(field: K, value: PositionFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(() => {
      if (!form.title || !form.clientId) return;
      onSubmit?.(form);
    }, [form, onSubmit]);

    const isValid = useMemo(() => {
      return form.title.trim() !== '' && form.clientId !== '';
    }, [form]);

    return (
      <Box
        className={className}
        style={{ ...card, ...animStyle, padding: t.spacing[4], ...style }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Briefcase size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
            }}>
              {isEditing ? 'Edit Position' : 'Quick Add Position'}
            </Text>
          </Box>
          {onCancel && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Cancel"
              onClick={onCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
              style={{ cursor: 'pointer', display: 'flex' }}
            >
              <X size={14} color={t.colors.neutral[400]} />
            </Box>
          )}
        </Box>

        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
          <input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
            placeholder="Position title *"
            aria-label="Position title"
            style={createInputStyle(t, focusedField === 'title')}
          />

          <select
            value={form.clientId}
            onChange={(e) => updateField('clientId', e.target.value)}
            aria-label="Select client"
            style={{ ...createInputStyle(t, false), cursor: 'pointer' }}
          >
            <option value="">Select client *</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input
            value={form.department}
            onChange={(e) => updateField('department', e.target.value)}
            onFocus={() => setFocusedField('department')}
            onBlur={() => setFocusedField(null)}
            placeholder="Department"
            aria-label="Department"
            style={createInputStyle(t, focusedField === 'department')}
          />

          <select
            value={form.priority}
            onChange={(e) => updateField('priority', e.target.value as PositionFormData['priority'])}
            aria-label="Priority"
            style={{ ...createInputStyle(t, false), cursor: 'pointer' }}
          >
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </Box>

        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: t.spacing[2], marginTop: t.spacing[4],
        }}>
          {onCancel && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Cancel"
              onClick={onCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
              style={{
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: badgeRadius,
                border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600],
                cursor: 'pointer', transition: `all ${t.motion.hover}`,
              }}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Cancel</Text>
            </Box>
          )}
          <Box
            tabIndex={0}
            role="button"
            aria-label={isEditing ? 'Save position' : 'Create position'}
            aria-disabled={!isValid || loading}
            onClick={() => { if (isValid && !loading) handleSubmit(); }}
            onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && isValid && !loading) { e.preventDefault(); handleSubmit(); } }}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: badgeRadius,
              border: 'none',
              backgroundColor: isValid && !loading ? t.colors.primaryScale[500] : t.colors.neutral[300],
              color: t.colors.common.white, fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              cursor: isValid && !loading ? 'pointer' : 'not-allowed',
              transition: `all ${t.motion.hover}`,
            }}
          >
            {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={12} />}
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>
              {isEditing ? 'Save' : 'Create'}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  },
});
