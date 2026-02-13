'use client';

/**
 * BhPositionForm - Full Preset
 * Complete position creation/edit form with all fields,
 * requirements list, salary range, and client selection.
 * Personality-driven, glass-aware.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Briefcase, FileText, Plus, X, Save, Loader2,
  DollarSign, AlertCircle, ChevronDown, Trash2,
  Flag, Building2, FolderOpen,
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
import type { BhPositionFormProps, PositionFormData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const EMPTY_FORM: PositionFormData = {
  title: '',
  clientId: '',
  department: '',
  priority: 'medium',
  description: '',
  requirements: [],
  salary: { min: 0, max: 0, currency: 'USD' },
};

const DEFAULT_CLIENTS = [
  { id: 'cl-1', name: 'Acme Corporation' },
  { id: 'cl-2', name: 'Horizon Labs' },
  { id: 'cl-3', name: 'Nova Ventures' },
];

const PRIORITY_OPTIONS: Array<{ value: PositionFormData['priority']; label: string; color: (t: DesignTokens) => string; bg: (t: DesignTokens) => string }> = [
  { value: 'high', label: 'High', color: t => t.colors.errorScale[600], bg: t => t.colors.errorScale[50] },
  { value: 'medium', label: 'Medium', color: t => t.colors.warningScale[600], bg: t => t.colors.warningScale[50] },
  { value: 'low', label: 'Low', color: t => t.colors.neutral[500], bg: t => t.colors.neutral[100] },
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

export const FullBhPositionForm = createPreset<BhPositionFormProps>({
  name: 'BhPositionForm.Full',
  render: (ctx: PresetContext<BhPositionFormProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      initialData,
      clients = DEFAULT_CLIENTS,
      onSubmit,
      onCancel,
      isEditing = false,
      loading = false,
      className,
      style,
    } = props;

    const [form, setForm] = useState<PositionFormData>({
      ...EMPTY_FORM,
      ...initialData,
    });
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [newRequirement, setNewRequirement] = useState('');

    const card = useMemo(() => createCardStyle(t, { elevation: 'md', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const updateField = useCallback(<K extends keyof PositionFormData>(field: K, value: PositionFormData[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const addRequirement = useCallback(() => {
      if (newRequirement.trim()) {
        setForm(prev => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }));
        setNewRequirement('');
      }
    }, [newRequirement]);

    const removeRequirement = useCallback((index: number) => {
      setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
    }, []);

    const handleSubmit = useCallback(() => {
      if (!form.title || !form.clientId) return;
      onSubmit?.(form);
    }, [form, onSubmit]);

    const isValid = useMemo(() => {
      return form.title.trim() !== '' && form.clientId !== '';
    }, [form]);

    const sectionLabel = useCallback((label: string) => ({
      fontSize: t.typography.fontSize.xs,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.neutral[500],
      textTransform: ptypo.labelTransform as any,
      letterSpacing: ptypo.labelLetterSpacing,
      marginBottom: t.spacing[3],
    }), [t, ptypo]);

    return (
      <Box
        className={className}
        style={{ ...card, ...animStyle, padding: 0, overflow: 'hidden', ...accentLayout.outer,
          ...style }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Briefcase size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {isEditing ? 'Edit Position' : 'New Position'}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                {isEditing ? 'Update position details' : 'Define the role and requirements'}
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
              }}
            >
              <X size={16} color={t.colors.neutral[500]} />
            </Box>
          )}
        </Box>

        {/* Form body */}
        <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[6]}px` }}>
          {/* Basic Info */}
          <Text style={sectionLabel('Basic Information')}>Basic Information</Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                Position Title *
              </Text>
              <Box style={{ position: 'relative' }}>
                <Briefcase size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                <input
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Senior Frontend Engineer"
                  aria-label="Position title"
                  style={{ ...createInputStyle(t, focusedField === 'title'), paddingLeft: t.spacing[8] }}
                />
              </Box>
            </Box>

            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[4] }}>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                  Client *
                </Text>
                <Box style={{ position: 'relative' }}>
                  <Building2 size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <select
                    value={form.clientId}
                    onChange={(e) => updateField('clientId', e.target.value)}
                    aria-label="Select client"
                    style={{ ...createInputStyle(t, false), paddingLeft: t.spacing[8], cursor: 'pointer' }}
                  >
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Box>
              </Box>
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                  Department
                </Text>
                <Box style={{ position: 'relative' }}>
                  <FolderOpen size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                  <input
                    value={form.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g. Engineering"
                    aria-label="Department"
                    style={{ ...createInputStyle(t, focusedField === 'department'), paddingLeft: t.spacing[8] }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Priority */}
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[2] }}>
                Priority
              </Text>
              <Box style={{ display: 'flex', gap: t.spacing[3] }}>
                {PRIORITY_OPTIONS.map(opt => {
                  const isSelected = form.priority === opt.value;
                  return (
                    <Box
                      key={opt.value}
                      tabIndex={0}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${opt.label} priority`}
                      onClick={() => updateField('priority', opt.value)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateField('priority', opt.value); } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[2],
                        padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                        borderRadius: badgeRadius,
                        border: `1px solid ${isSelected ? opt.color(t) : t.colors.neutral[200]}`,
                        backgroundColor: isSelected ? opt.bg(t) : t.colors.common.white,
                        cursor: 'pointer',
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Flag size={12} color={isSelected ? opt.color(t) : t.colors.neutral[400]} />
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: isSelected ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                        color: isSelected ? opt.color(t) : t.colors.neutral[600],
                      }}>
                        {opt.label}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Description */}
            <Box>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                Description
              </Text>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                placeholder="Describe the role, responsibilities, and expectations..."
                aria-label="Position description"
                rows={4}
                style={{ ...createInputStyle(t, focusedField === 'description'), resize: 'vertical' as const, fontFamily: 'inherit' }}
              />
            </Box>
          </Box>

          {/* Requirements */}
          <Text style={sectionLabel('Requirements')}>Requirements</Text>
          <Box style={{ marginBottom: t.spacing[6] }}>
            <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onFocus={() => setFocusedField('requirement')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                placeholder="Add a requirement..."
                aria-label="New requirement"
                style={{ ...createInputStyle(t, focusedField === 'requirement'), flex: 1 }}
              />
              <Box
                tabIndex={0}
                role="button"
                aria-label="Add requirement"
                onClick={addRequirement}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addRequirement(); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.primaryScale[500],
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Plus size={16} color={t.colors.common.white} />
              </Box>
            </Box>
            {form.requirements.map((req, idx) => (
              <Box key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[100]}`,
                marginBottom: t.spacing[2],
                backgroundColor: t.colors.neutral[50],
              }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], flex: 1 }}>
                  {req}
                </Text>
                <Box
                  tabIndex={0}
                  role="button"
                  aria-label={`Remove requirement: ${req}`}
                  onClick={() => removeRequirement(idx)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeRequirement(idx); } }}
                  style={{ cursor: 'pointer', flexShrink: 0, display: 'flex' }}
                >
                  <Trash2 size={12} color={t.colors.errorScale[400]} />
                </Box>
              </Box>
            ))}
            {form.requirements.length === 0 && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], fontStyle: 'italic' }}>
                No requirements added yet
              </Text>
            )}
          </Box>

          {/* Salary */}
          <Text style={sectionLabel('Salary Range')}>Salary Range</Text>
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                Minimum
              </Text>
              <Box style={{ position: 'relative' }}>
                <DollarSign size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                <input
                  type="number"
                  value={form.salary?.min ?? 0}
                  onChange={(e) => updateField('salary', { ...form.salary!, min: Number(e.target.value) })}
                  aria-label="Minimum salary"
                  style={{ ...createInputStyle(t, false), paddingLeft: t.spacing[8] }}
                />
              </Box>
            </Box>
            <Box style={{ flex: 1 }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                Maximum
              </Text>
              <Box style={{ position: 'relative' }}>
                <DollarSign size={14} style={{ position: 'absolute', left: t.spacing[3], top: '50%', transform: 'translateY(-50%)', color: t.colors.neutral[400] }} />
                <input
                  type="number"
                  value={form.salary?.max ?? 0}
                  onChange={(e) => updateField('salary', { ...form.salary!, max: Number(e.target.value) })}
                  aria-label="Maximum salary"
                  style={{ ...createInputStyle(t, false), paddingLeft: t.spacing[8] }}
                />
              </Box>
            </Box>
            <Box style={{ width: 100 }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                Currency
              </Text>
              <select
                value={form.salary?.currency ?? 'USD'}
                onChange={(e) => updateField('salary', { ...form.salary!, currency: e.target.value })}
                aria-label="Salary currency"
                style={{ ...createInputStyle(t, false), cursor: 'pointer' }}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </Box>
          </Box>

          {/* Footer actions */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: t.spacing[3], paddingTop: t.spacing[4],
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
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: badgeRadius,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[700], fontSize: t.typography.fontSize.sm,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Cancel</Text>
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
                display: 'flex', alignItems: 'center', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[5]}px`, borderRadius: badgeRadius,
                border: 'none',
                backgroundColor: isValid && !loading ? t.colors.primaryScale[500] : t.colors.neutral[300],
                color: t.colors.common.white, fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                transition: `all ${t.motion.hover}`,
              }}
            >
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>
                {isEditing ? 'Save Changes' : 'Create Position'}
              </Text>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
