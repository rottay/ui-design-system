'use client';

/**
 * BhClientForm - Full Preset
 * Complete client creation/edit form with all fields,
 * tier selection, and contact details.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Building2, User, Mail, Phone, MapPin,
  FileText, Save, X, ChevronDown, Loader2,
  Star, Briefcase, Crown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhClientFormProps, ClientFormData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_FORM: ClientFormData = {
  name: '',
  tier: 'starter',
  contactName: '',
  contactEmail: '',
  phone: '',
  address: '',
  notes: '',
};

const TIER_OPTIONS: Array<{ value: ClientFormData['tier']; label: string; icon: typeof Star; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = [
  { value: 'starter', label: 'Starter', icon: Star, color: t => t.colors.primaryScale[600], bg: t => t.colors.primaryScale[50] },
  { value: 'business', label: 'Business', icon: Briefcase, color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  { value: 'enterprise', label: 'Enterprise', icon: Crown, color: t => t.colors.secondaryScale[600], bg: t => t.colors.secondaryScale[50] },
];

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
/*  Full Preset                                                        */
/* ================================================================== */

export const FullBhClientForm = createPreset<BhClientFormProps>({
  name: 'BhClientForm.Full',
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
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const updateField = useCallback(<K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(() => {
      if (!form.name || !form.contactName || !form.contactEmail) return;
      onSubmit?.(form);
    }, [form, onSubmit]);

    const isValid = useMemo(() => {
      return form.name.trim() !== '' && form.contactName.trim() !== '' && form.contactEmail.trim() !== '';
    }, [form]);

    const sectionLabel = useCallback((label: string) => ({
      fontSize: t.typography.fontSize.xs,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.neutral[500],
      textTransform: ptypo.labelTransform as any,
      letterSpacing: ptypo.labelLetterSpacing,
      marginBottom: t.spacing[3],
      display: 'block' as const,
    }), [t, ptypo]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          ...accentLayout.outer,
          ...animStyle,
          padding: 0,
          overflow: 'hidden',
          width: '100%',
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Building2 size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {isEditing ? 'Edit Client' : 'New Client'}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                {isEditing ? 'Update client information' : 'Fill in client details to create a new record'}
              </Text>
            </Box>
          </Box>
          {onCancel && (
            <Box
              tabIndex={0}
              role="button"
              aria-label="Cancel"
              onClick={onCancel}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white, cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <X size={16} color={t.colors.neutral[500]} />
            </Box>
          )}
        </Box>

        {/* Form body */}
        <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {/* Company Info Section */}
          <Text style={sectionLabel('Company Information')}>Company Information</Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            {/* Name */}
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                Company Name *
              </Text>
              <Box style={{ position: 'relative' }}>
                <Building2 size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                <input
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter company name"
                  aria-label="Company name"
                  style={{
                    ...createInputStyle(t, focusedField === 'name'),
                    paddingLeft: t.spacing[8],
                  }}
                />
              </Box>
            </Box>

            {/* Tier Selection */}
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[2], display: 'block' }}>
                Client Tier *
              </Text>
              <Box style={{ display: 'flex', gap: t.spacing[3] }}>
                {TIER_OPTIONS.map(tier => {
                  const isSelected = form.tier === tier.value;
                  const Icon = tier.icon;
                  return (
                    <Box
                      key={tier.value}
                      tabIndex={0}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${tier.label} tier`}
                      onClick={() => updateField('tier', tier.value)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateField('tier', tier.value); } }}
                      style={{
                        flex: 1,
                        padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                        borderRadius: t.borderRadius.lg,
                        border: `2px solid ${isSelected ? tier.color(t) : t.colors.neutral[200]}`,
                        backgroundColor: isSelected ? tier.bg(t) : t.colors.common.white,
                        cursor: 'pointer',
                        textAlign: 'center' as const,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Icon size={20} color={isSelected ? tier.color(t) : t.colors.neutral[400]} style={{ marginBottom: t.spacing[1] }} />
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                        color: isSelected ? tier.color(t) : t.colors.neutral[600],
                        display: 'block',
                      }}>
                        {tier.label}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Contact Section */}
          <Text style={sectionLabel('Contact Details')}>Contact Details</Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[4] }}>
              {/* Contact Name */}
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                  Contact Name *
                </Text>
                <Box style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <input
                    value={form.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    onFocus={() => setFocusedField('contactName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Full name"
                    aria-label="Contact name"
                    style={{
                      ...createInputStyle(t, focusedField === 'contactName'),
                      paddingLeft: t.spacing[8],
                    }}
                  />
                </Box>
              </Box>
              {/* Contact Email */}
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                  Contact Email *
                </Text>
                <Box style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <input
                    value={form.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    onFocus={() => setFocusedField('contactEmail')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="email@company.com"
                    aria-label="Contact email"
                    style={{
                      ...createInputStyle(t, focusedField === 'contactEmail'),
                      paddingLeft: t.spacing[8],
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[4] }}>
              {/* Phone */}
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                  Phone
                </Text>
                <Box style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <input
                    value={form.phone ?? ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+1 (555) 000-0000"
                    aria-label="Phone number"
                    style={{
                      ...createInputStyle(t, focusedField === 'phone'),
                      paddingLeft: t.spacing[8],
                    }}
                  />
                </Box>
              </Box>
              {/* Address */}
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                  Address
                </Text>
                <Box style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <input
                    value={form.address ?? ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="123 Main St, City"
                    aria-label="Address"
                    style={{
                      ...createInputStyle(t, focusedField === 'address'),
                      paddingLeft: t.spacing[8],
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Notes */}
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1], display: 'block' }}>
                Notes
              </Text>
              <Box style={{ position: 'relative' }}>
                <FileText size={14} style={{ position: 'absolute', left: t.spacing[3], top: t.spacing[3], color: t.colors.neutral[400] }} />
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  onFocus={() => setFocusedField('notes')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Additional notes about this client..."
                  aria-label="Notes"
                  rows={3}
                  style={{
                    ...createInputStyle(t, focusedField === 'notes'),
                    paddingLeft: t.spacing[8],
                    resize: 'vertical' as const,
                    fontFamily: 'inherit',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Footer actions */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: t.spacing[3],
            paddingTop: t.spacing[4],
            borderTop: `1px solid ${t.colors.neutral[100]}`,
          }}>
            {onCancel && (
              <Box
                tabIndex={0}
                role="button"
                aria-label="Cancel"
                onClick={onCancel}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: badgeRadius,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[700],
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <X size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Cancel</Text>
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
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                borderRadius: badgeRadius,
                border: 'none',
                backgroundColor: isValid && !loading ? t.colors.primaryScale[500] : t.colors.neutral[300],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                transition: `all ${t.motion.hover}`,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>
                {isEditing ? 'Save Changes' : 'Create Client'}
              </Text>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
