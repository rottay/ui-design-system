'use client';

/**
 * BhClientForm - Compact Preset
 * Condensed client form for quick creation in modals/sidebars.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Building2, User, Mail, Save, X, Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhClientFormProps, ClientFormData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_FORM: ClientFormData = {
  displayName: '',
  type: 'company',
  tier: 'standard',
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

export const CompactBhClientForm = createPreset<BhClientFormProps>({
  name: 'BhClientForm.Compact',
  render: (ctx: PresetContext<BhClientFormProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      initialData,
      onSubmit,
      onCancel,
      isEditing = false,
      loading = false,
      className,
      style,
    } = props;

    const [form, setForm] = useState<ClientFormData>({
      ...EMPTY_FORM,
      ...initialData,
    } as ClientFormData);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const updateField = useCallback(<K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(() => {
      if (!form.displayName) return;
      onSubmit?.(form);
    }, [form, onSubmit]);

    const isValid = useMemo(() => {
      return form.displayName.trim() !== '';
    }, [form]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          ...animStyle,
          padding: t.spacing[4],
          width: '100%',
          ...style,
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Building2 size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
            }}>
              {isEditing ? 'Edit Client' : 'Quick Add Client'}
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

        <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
          <input
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            onFocus={() => setFocusedField('displayName')}
            onBlur={() => setFocusedField(null)}
            placeholder="Display name *"
            aria-label="Display name"
            style={createInputStyle(t, focusedField === 'displayName')}
          />

          <select
            value={form.tier}
            onChange={(e) => updateField('tier', e.target.value as ClientFormData['tier'])}
            aria-label="Client tier"
            style={{
              ...createInputStyle(t, false),
              cursor: 'pointer',
            }}
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
            <option value="strategic">Strategic</option>
          </select>

          <input
            value={form.personalEmail ?? ''}
            onChange={(e) => updateField('personalEmail', e.target.value)}
            onFocus={() => setFocusedField('personalEmail')}
            onBlur={() => setFocusedField(null)}
            placeholder="Email"
            aria-label="Email"
            style={createInputStyle(t, focusedField === 'personalEmail')}
          />

          <input
            value={form.personalPhone ?? ''}
            onChange={(e) => updateField('personalPhone', e.target.value)}
            onFocus={() => setFocusedField('personalPhone')}
            onBlur={() => setFocusedField(null)}
            placeholder="Phone"
            aria-label="Phone"
            style={createInputStyle(t, focusedField === 'personalPhone')}
          />
        </Box>

        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: t.spacing[2],
          marginTop: t.spacing[4],
        }}>
          {onCancel && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Cancel"
              onClick={onCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
              style={{
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: badgeRadius,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>Cancel</Text>
            </Box>
          )}
          <Box
            tabIndex={0}
            role="button"
            aria-label={isEditing ? 'Save changes' : 'Create client'}
            aria-disabled={!isValid || loading}
            onClick={() => { if (isValid && !loading) handleSubmit(); }}
            onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && isValid && !loading) { e.preventDefault(); handleSubmit(); } }}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
              borderRadius: badgeRadius,
              border: 'none',
              backgroundColor: isValid && !loading ? t.colors.primaryScale[500] : t.colors.neutral[300],
              color: t.colors.common.white,
              fontSize: t.typography.fontSize.xs,
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
