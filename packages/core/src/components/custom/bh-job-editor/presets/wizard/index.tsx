'use client';

/**
 * BhJobEditor - Wizard Preset
 * Multi-step wizard for creating and editing job postings
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createIconContainerStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhJobEditorProps } from '../../core';
import type { JobFormData, SkillTag, ScreeningQuestion, JobEditorStep, WorkArrangement } from '../../core';
import { BH_JOB_EDITOR_DEFAULTS } from '../../core';
import {
  Check, AlertCircle, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Save, Eye, Send, Sparkles, Bold, Italic, Underline, List, ListOrdered, Link,
  MapPin, DollarSign, Plus, X, Trash2, GripVertical, Briefcase, FileText,
  Building2, Settings, ClipboardCheck, Globe, Lock, ShieldAlert, GraduationCap,
  Tag, HelpCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal', 'Customer Success'];
const SENIORITY_OPTIONS = [
  { value: 'intern', label: 'Intern' }, { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' }, { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' }, { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
];
const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' }, { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' }, { value: 'internship', label: 'Internship' },
];
const URGENCY_OPTIONS: { value: string; label: string; scale: 'infoScale' | 'warningScale' | 'errorScale' }[] = [
  { value: 'low', label: 'Low', scale: 'infoScale' },
  { value: 'medium', label: 'Medium', scale: 'warningScale' },
  { value: 'high', label: 'High', scale: 'errorScale' },
  { value: 'critical', label: 'Critical', scale: 'errorScale' },
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR'];
const BENEFITS_OPTIONS = [
  'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Match',
  'Unlimited PTO', 'Remote Work', 'Gym Membership', 'Learning Budget',
  'Stock Options', 'Parental Leave', 'Commuter Benefits', 'Meal Allowance',
];
const EDUCATION_LEVELS = ['High School', 'Associate', "Bachelor's", "Master's", 'PhD', 'No Requirement'];
const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }, { value: 'expert', label: 'Expert' },
];
const PROF_SCALES: Record<string, string> = { expert: 'errorScale', advanced: 'warningScale', intermediate: 'infoScale' };

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, label: 'Public', description: 'Visible to all candidates on career page', icon: Globe },
  { value: 'internal' as const, label: 'Internal', description: 'Only visible to internal employees', icon: Lock },
  { value: 'confidential' as const, label: 'Confidential', description: 'Hidden from public, sourced candidates only', icon: ShieldAlert },
];

const ARRANGEMENT_OPTIONS: { value: WorkArrangement; label: string; icon: typeof Globe }[] = [
  { value: 'onsite', label: 'On-site', icon: Building2 },
  { value: 'remote', label: 'Remote', icon: Globe },
  { value: 'hybrid', label: 'Hybrid', icon: MapPin },
];

const REVIEW_SECTIONS = [
  { key: 'basics', label: 'Job Basics', icon: Briefcase },
  { key: 'description', label: 'Description', icon: FileText },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'compensation', label: 'Compensation', icon: DollarSign },
  { key: 'requirements', label: 'Requirements', icon: GraduationCap },
  { key: 'configuration', label: 'Configuration', icon: Settings },
];

const DEFAULT_STEPS: JobEditorStep[] = [
  { key: 'basics', label: 'Basics', isComplete: false, isActive: true, hasErrors: false },
  { key: 'description', label: 'Description', isComplete: false, isActive: false, hasErrors: false },
  { key: 'location', label: 'Location', isComplete: false, isActive: false, hasErrors: false },
  { key: 'compensation', label: 'Compensation', isComplete: false, isActive: false, hasErrors: false },
  { key: 'requirements', label: 'Requirements', isComplete: false, isActive: false, hasErrors: false },
  { key: 'configuration', label: 'Configuration', isComplete: false, isActive: false, hasErrors: false },
  { key: 'review', label: 'Review', isComplete: false, isActive: false, hasErrors: false },
];

function generateJobCode(title: string): string {
  if (!title) return '';
  const prefix = title.trim().split(/\s+/).map((w, i) => w[0]?.toUpperCase() || '').join('').slice(0, 4);
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const WizardBhJobEditor = createPreset<BhJobEditorProps>({
  name: 'BhJobEditor.Wizard',
  render: ({ primitives, props, tokens }: PresetContext<BhJobEditorProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const { formData: formDataProp, steps: stepsProp, currentStep: currentStepProp, validationErrors: validationErrorsProp, onChange, onStepChange, onSave, onPublish, onPreview, isDirty: isDirtyProp, templates: rawTemplates = [], clients: rawClients = [], className, style } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];
    const clients = Array.isArray(rawClients) ? rawClients : [];

    const defaultForm = BH_JOB_EDITOR_DEFAULTS.formData as JobFormData;
    const [internalFormData, setInternalFormData] = useState<Partial<JobFormData>>(formDataProp ?? defaultForm);
    const [internalStep, setInternalStep] = useState(currentStepProp ?? 'basics');
    const [internalErrors, setInternalErrors] = useState(validationErrorsProp ?? []);
    const [internalDirty, setInternalDirty] = useState(isDirtyProp ?? false);
    const [isPreview, setIsPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillProficiency, setNewSkillProficiency] = useState<SkillTag['proficiency']>('intermediate');
    const [expandedReviewSections, setExpandedReviewSections] = useState<Record<string, boolean>>({ basics: true, description: true, location: true, compensation: true, requirements: true, configuration: true });

    const formData = formDataProp ?? internalFormData;
    const currentStep = currentStepProp ?? internalStep;
    const validationErrors = validationErrorsProp ?? internalErrors;
    const isDirty = isDirtyProp ?? internalDirty;

    const steps = useMemo(() => {
      if (stepsProp) return stepsProp;
      const idx = DEFAULT_STEPS.findIndex((s) => s.key === currentStep);
      return DEFAULT_STEPS.map((s, i) => ({ ...s, isActive: s.key === currentStep, isComplete: i < idx, hasErrors: validationErrors.some((e) => e.step === s.key) }));
    }, [stepsProp, currentStep, validationErrors]);

    const stepIdx = steps.findIndex((s) => s.key === currentStep);

    /* -- Handlers -------------------------------------------------- */

    const updateField = useCallback((field: keyof JobFormData, value: unknown) => {
      const updated = { ...formData, [field]: value };
      if (field === 'title' && !formData.code) updated.code = generateJobCode(value as string);
      setInternalFormData(updated);
      setInternalDirty(true);
      onChange?.(updated);
    }, [formData, onChange]);

    const goToStep = useCallback((k: string) => { setInternalStep(k); onStepChange?.(k); }, [onStepChange]);
    const goNext = useCallback(() => { if (stepIdx < steps.length - 1) goToStep(steps[stepIdx + 1].key); }, [stepIdx, steps, goToStep]);
    const goPrev = useCallback(() => { if (stepIdx > 0) goToStep(steps[stepIdx - 1].key); }, [stepIdx, steps, goToStep]);
    const handleSave = useCallback(() => { onSave?.(formData); setInternalDirty(false); }, [formData, onSave]);
    const handlePublish = useCallback(() => { onPublish?.(formData); }, [formData, onPublish]);
    const handlePreview = useCallback(() => { setIsPreview(!isPreview); onPreview?.(formData); }, [formData, onPreview, isPreview]);

    const addSkill = useCallback(() => {
      if (!newSkillName.trim()) return;
      updateField('skills', [...(formData.skills ?? []), { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
      setNewSkillName('');
    }, [newSkillName, newSkillProficiency, formData.skills, updateField]);

    const removeSkill = useCallback((i: number) => { const u = [...(formData.skills ?? [])]; u.splice(i, 1); updateField('skills', u); }, [formData.skills, updateField]);

    const addSQ = useCallback(() => {
      updateField('screeningQuestions', [...(formData.screeningQuestions ?? []), { id: `sq-${Date.now()}`, question: '', type: 'text', required: false } as ScreeningQuestion]);
    }, [formData.screeningQuestions, updateField]);

    const updateSQ = useCallback((id: string, field: keyof ScreeningQuestion, value: unknown) => {
      updateField('screeningQuestions', (formData.screeningQuestions ?? []).map((q, i) => q.id === id ? { ...q, [field]: value } : q));
    }, [formData.screeningQuestions, updateField]);

    const removeSQ = useCallback((id: string) => {
      updateField('screeningQuestions', (formData.screeningQuestions ?? []).filter((q) => q.id !== id));
    }, [formData.screeningQuestions, updateField]);

    const toggleBenefit = useCallback((b: string) => {
      const c = formData.benefits ?? [];
      updateField('benefits', c.includes(b) ? c.filter((x) => x !== b) : [...c, b]);
    }, [formData.benefits, updateField]);

    const fieldErrors = useCallback((f: string) => validationErrors.filter((e) => e.field === f), [validationErrors]);
    const stepErrors = useCallback((s: string) => validationErrors.filter((e) => e.step === s), [validationErrors]);

    const handleKeyAction = useCallback((e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(); }
    }, []);

    /* -- Styles ---------------------------------------------------- */

    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
    const cardStyle = useMemo(() => createCardStyle(t, { glass: isGlass, elevation: 'sm', padding: t.spacing[6] }), [t, isGlass]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const inputStyle: React.CSSProperties = useMemo(() => ({ width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.normal, color: t.colors.neutral[900], backgroundColor: t.colors.common.white, border: `${bdr} ${t.colors.neutral[300]}`, borderRadius: t.borderRadius.md, outline: 'none', transition: `all ${t.motion.hover}`, boxSizing: 'border-box' as const }), [t, bdr]);
    const selectStyle: React.CSSProperties = useMemo(() => ({ ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${t.spacing[3]}px center`, paddingRight: t.spacing[8] }), [inputStyle, t]);
    const labelStyle: React.CSSProperties = useMemo(() => ({ display: 'block', fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }), [t]);
    const fgStyle: React.CSSProperties = useMemo(() => ({ marginBottom: t.spacing[5] }), [t]);
    const primaryBtn: React.CSSProperties = useMemo(() => ({ display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white, backgroundColor: t.colors.primaryScale[600], border: 'none', borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }), [t]);
    const secondaryBtn: React.CSSProperties = useMemo(() => ({ ...primaryBtn, color: t.colors.neutral[700], backgroundColor: t.colors.common.white, border: `${bdr} ${t.colors.neutral[300]}` }), [primaryBtn, t, bdr]);
    const ghostBtn: React.CSSProperties = useMemo(() => ({ ...primaryBtn, color: t.colors.neutral[600], backgroundColor: 'transparent', border: 'none' }), [primaryBtn, t]);
    const textareaStyle: React.CSSProperties = useMemo(() => ({ ...inputStyle, minHeight: 160, resize: 'vertical' as const, lineHeight: t.typography.lineHeight.relaxed, fontFamily: 'inherit' }), [inputStyle, t]);
    const titleStyle: React.CSSProperties = useMemo(() => ({ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900], marginBottom: t.spacing[4] }), [t, ptypo]);

    /* -- Sub-components -------------------------------------------- */

    const OptionBtn = useCallback(({ selected, label, onClick, scale, flexOne }: { selected: boolean; label: string; onClick: () => void; scale?: any; flexOne?: boolean }) => {
      const s = scale ?? t.colors.primaryScale;
      return (
        <Box role="button" tabIndex={0} aria-label={`Select ${label}`} aria-pressed={selected} onClick={onClick} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, onClick)} style={{ ...(flexOne ? { flex: 1 } : {}), padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: selected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: selected ? s[700] : t.colors.neutral[600], backgroundColor: selected ? s[50] : t.colors.common.white, border: `${bdr} ${selected ? s[300] : t.colors.neutral[300]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}`, textAlign: 'center' as const }}>
          <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{label}</Text>
        </Box>
      );
    }, [t, bdr, handleKeyAction]);

    const Field = useCallback(({ fieldKey, label, children }: { fieldKey: string; label: string; children: React.ReactNode }) => {
      const errs = fieldErrors(fieldKey);
      return (
        <Box style={fgStyle}>
          <Text as="label" style={labelStyle}>{label}</Text>
          {children}
          {errs.map((e, i) => <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], marginTop: t.spacing[1], display: 'block' }}>{e.message}</Text>)}
        </Box>
      );
    }, [fieldErrors, fgStyle, labelStyle, t]);

    const StepTitle = useCallback(({ icon: Icon, label }: { icon: typeof Briefcase; label: string }) => (
      <Box style={titleStyle}><Icon size={18} style={{ marginRight: t.spacing[2], verticalAlign: 'middle', color: t.colors.primaryScale[500] }} /><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{label}</Text></Box>
    ), [titleStyle, t]);

    const ToolbarEditor = useCallback(({ value, onChange: oc, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
      const tbBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', backgroundColor: 'transparent', color: t.colors.neutral[600], borderRadius: t.borderRadius.sm, cursor: 'pointer' };
      return (
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[300]}`, borderBottom: 'none', borderRadius: `${t.borderRadius.md} ${t.borderRadius.md} 0 0` }}>
            {[Bold, Italic, Underline].map((I, idx) => <Box key={idx} as="button" role="button" tabIndex={0} aria-label={['Bold', 'Italic', 'Underline'][idx]} style={tbBtn}><I size={14} /></Box>)}
            <Box style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[300], margin: `0 ${t.spacing[1]}px` }} />
            {[List, ListOrdered, Link].map((I, idx) => <Box key={idx} as="button" role="button" tabIndex={0} aria-label={['Bullet list', 'Numbered list', 'Link'][idx]} style={tbBtn}><I size={14} /></Box>)}
            <Box style={{ flex: 1 }} />
            <Box as="button" role="button" tabIndex={0} aria-label="AI Assist" style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.secondaryScale[700], backgroundColor: t.colors.secondaryScale[50], border: `${bdr} ${t.colors.secondaryScale[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer' }}>
              <Sparkles size={12} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>AI Assist</Text>
            </Box>
          </Box>
          <textarea aria-label={placeholder} style={{ ...textareaStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0 }} placeholder={placeholder} value={value} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => oc(e.target.value)} />
        </Box>
      );
    }, [t, bdr, textareaStyle]);

    const SkillTag_ = useCallback(({ skill, idx }: { skill: SkillTag; idx: number }) => {
      const sc = (t.colors[(PROF_SCALES[skill.proficiency] ?? 'neutral') as keyof typeof t.colors] as Record<number, string>) ?? t.colors.neutral;
      return (
        <Box style={{  display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, backgroundColor: sc[50], color: sc[700], border: `${bdr} ${sc[200]}`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
          <Tag size={10} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{skill.name}</Text>
          <Text style={{ color: sc[500], marginLeft: t.spacing[1], fontSize: 'inherit' }}>({skill.proficiency})</Text>
          <Box role="button" tabIndex={0} aria-label={`Remove skill ${skill.name}`} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => removeSkill(idx))} onClick={() => removeSkill(idx)} style={{ display: 'inline-flex', border: 'none', backgroundColor: 'transparent', color: sc[400], cursor: 'pointer', padding: 0, marginLeft: t.spacing[1] }}><X size={12} /></Box>
        </Box>
      );
    }, [t, bdr, removeSkill, handleKeyAction]);

    const RadioCard = useCallback(({ selected, icon, label, description, onClick }: { selected: boolean; icon: React.ReactNode; label: string; description: string; onClick: () => void }) => (
      <Box role="radio" tabIndex={0} aria-checked={selected} aria-label={label} onClick={onClick} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, onClick)} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[4], backgroundColor: selected ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${selected ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
        <Box style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.md, backgroundColor: selected ? t.colors.primaryScale[100] : t.colors.neutral[100], color: selected ? t.colors.primaryScale[600] : t.colors.neutral[500] }}>{icon}</Box>
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1 }}>
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: selected ? t.colors.primaryScale[700] : t.colors.neutral[800] }}>{label}</Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>{description}</Text>
        </Box>
        <Box style={{ width: 18, height: 18, borderRadius: t.borderRadius.full, border: `${bdr} ${selected ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selected && <Box style={{ width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />}
        </Box>
      </Box>
    ), [t, bdr, handleKeyAction]);

    const SalarySlider = useMemo(() => {
      const min = formData.salaryMin ?? 0, max = formData.salaryMax ?? 0, W = 320, cap = 500000;
      const pMin = Math.min((min / cap) * 100, 100), pMax = Math.min((max / cap) * 100, 100);
      return (
        <svg width={W} height={40} style={{ display: 'block', margin: '0 auto' }} viewBox={`0 0 ${W} 40`} role="img" aria-label="Salary range slider">
          <rect x={0} y={16} width={W} height={8} rx={4} fill={t.colors.neutral[200]} />
          <rect x={(pMin / 100) * W} y={16} width={Math.max(0, ((pMax - pMin) / 100) * W)} height={8} rx={4} fill={t.colors.primaryScale[400]} />
          {[pMin, pMax].map((p, i) => <circle key={i} cx={(p / 100) * W} cy={20} r={8} fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth={2} />)}
          {[[pMin, min], [pMax, max]].map(([p, v], i) => <text key={i} x={(p / 100) * W} y={10} textAnchor="middle" fill={t.colors.neutral[600]} fontSize={10} fontWeight={t.typography.fontWeight.medium}>{(v as number) > 0 ? `${((v as number) / 1000).toFixed(0)}k` : '0'}</text>)}
        </svg>
      );
    }, [formData.salaryMin, formData.salaryMax, t]);

    /* -- Step renderers -------------------------------------------- */

    const stepRenderers: Record<string, () => React.ReactNode> = {
      basics: () => (
        <Box style={cardStyle}>
          <StepTitle icon={Briefcase} label="Job Basics" />
          <Field fieldKey="title" label="Job Title *"><input type="text" aria-label="Job title" style={inputStyle} placeholder="e.g. Senior Software Engineer" value={formData.title ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value)} /></Field>
          <Field fieldKey="code" label="Job Code">
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              <input type="text" aria-label="Job code" style={{ ...inputStyle, flex: 1 }} placeholder="Auto-generated" value={formData.code ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('code', e.target.value)} />
              <Box role="button" tabIndex={0} aria-label="Generate job code" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('code', generateJobCode(formData.title ?? '')))} onClick={() => updateField('code', generateJobCode(formData.title ?? ''))} style={secondaryBtn}><Text style={{ fontSize: 'inherit', color: 'inherit' }}>Generate</Text></Box>
            </Box>
          </Field>
          <Field fieldKey="department" label="Department *"><select aria-label="Department" style={selectStyle} value={formData.department ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('department', e.target.value)}><option value="">Select department...</option>{DEPARTMENTS.map((d, i) => <option key={d} value={d}>{d}</option>)}</select></Field>
          <Field fieldKey="seniority" label="Seniority Level *"><Box role="radiogroup" aria-label="Seniority level" style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{SENIORITY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.seniority === o.value} label={o.label} onClick={() => updateField('seniority', o.value)} />)}</Box></Field>
          <Field fieldKey="employmentType" label="Employment Type *"><Box role="radiogroup" aria-label="Employment type" style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{EMPLOYMENT_TYPES.map((o, i) => <OptionBtn key={o.value} selected={formData.employmentType === o.value} label={o.label} onClick={() => updateField('employmentType', o.value)} />)}</Box></Field>
          <Field fieldKey="urgency" label="Urgency"><Box role="radiogroup" aria-label="Urgency" style={{ display: 'flex', gap: t.spacing[2] }}>{URGENCY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.urgency === o.value} label={o.label} onClick={() => updateField('urgency', o.value)} scale={t.colors[o.scale]} flexOne />)}</Box></Field>
        </Box>
      ),

      description: () => (
        <Box style={cardStyle}>
          <StepTitle icon={FileText} label="Job Description" />
          <Field fieldKey="description" label="Description *"><ToolbarEditor value={formData.description ?? ''} onChange={(v) => updateField('description', v)} placeholder="Describe the role, team, and what success looks like..." /></Field>
          <Field fieldKey="responsibilities" label="Key Responsibilities"><textarea aria-label="Key responsibilities" style={textareaStyle} placeholder="List the main responsibilities for this role..." value={formData.responsibilities ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('responsibilities', e.target.value)} /></Field>
          <Field fieldKey="requirements" label="Requirements"><textarea aria-label="Requirements" style={textareaStyle} placeholder="What are the must-have qualifications?" value={formData.requirements ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('requirements', e.target.value)} /></Field>
        </Box>
      ),

      location: () => (
        <Box style={cardStyle}>
          <StepTitle icon={MapPin} label="Location & Work Arrangement" />
          <Field fieldKey="workArrangement" label="Work Arrangement *">
            <Box role="radiogroup" aria-label="Work arrangement" style={{ display: 'flex', gap: t.spacing[3] }}>
              {ARRANGEMENT_OPTIONS.map((o, i) => {
                const sel = formData.workArrangement === o.value;
                return (
                  <Box key={o.value} role="radio" tabIndex={0} aria-checked={sel} aria-label={o.label} onClick={() => updateField('workArrangement', o.value)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('workArrangement', o.value))} style={{ ...animStyle(i), flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[4]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: sel ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Box style={{ color: sel ? t.colors.primaryScale[500] : t.colors.neutral[400] }}><o.icon size={16} /></Box><Text style={{ fontSize: 'inherit', color: 'inherit' }}>{o.label}</Text>
                  </Box>
                );
              })}
            </Box>
          </Field>
          <Field fieldKey="primaryLocation" label="Primary Location *"><input type="text" aria-label="Primary location" style={inputStyle} placeholder="e.g. San Francisco, CA" value={formData.primaryLocation ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('primaryLocation', e.target.value)} /></Field>
          <Field fieldKey="secondaryLocation" label="Secondary Location"><input type="text" aria-label="Secondary location" style={inputStyle} placeholder="e.g. New York, NY (optional)" value={formData.secondaryLocation ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('secondaryLocation', e.target.value)} /></Field>
          <Box style={{ height: 200, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm, marginTop: t.spacing[4] }} role="img" aria-label="Map preview">
            <MapPin size={20} style={{ marginRight: t.spacing[2] }} /><Text style={{ fontSize: 'inherit', color: 'inherit' }}>Map preview - {formData.primaryLocation || 'Enter a location above'}</Text>
          </Box>
        </Box>
      ),

      compensation: () => (
        <Box style={cardStyle}>
          <StepTitle icon={DollarSign} label="Compensation & Benefits" />
          <Field fieldKey="currency" label="Currency"><select aria-label="Currency" style={{ ...selectStyle, maxWidth: 160 }} value={formData.currency ?? 'USD'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('currency', e.target.value)}>{CURRENCIES.map((c, i) => <option key={c} value={c}>{c}</option>)}</select></Field>
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Salary Range</Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              {(['salaryMin', 'salaryMax'] as const).map((k, i) => (
                <React.Fragment key={k}>
                  {i === 1 && <Text style={{ color: t.colors.neutral[400], paddingTop: t.spacing[4] }}>&mdash;</Text>}
                  <Box style={{ flex: 1 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1], display: 'block' }}>{i === 0 ? 'Minimum' : 'Maximum'}</Text>
                    <input type="number" aria-label={i === 0 ? 'Salary minimum' : 'Salary maximum'} style={inputStyle} placeholder="0" value={formData[k] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(k, Number(e.target.value))} />
                  </Box>
                </React.Fragment>
              ))}
            </Box>
            {SalarySlider}
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            <Box style={{ flex: 1 }}><Field fieldKey="signingBonus" label="Signing Bonus"><input type="number" aria-label="Signing bonus" style={inputStyle} placeholder="0" value={formData.signingBonus || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('signingBonus', Number(e.target.value))} /></Field></Box>
            <Box style={{ flex: 1 }}><Field fieldKey="equity" label="Equity"><input type="text" aria-label="Equity" style={inputStyle} placeholder="e.g. 0.1% - 0.5%" value={formData.equity ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('equity', e.target.value)} /></Field></Box>
          </Box>
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Benefits</Text>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: t.spacing[2] }}>
              {BENEFITS_OPTIONS.map((b, i) => {
                const ch = (formData.benefits ?? []).includes(b);
                return (
                  <Box key={b} role="checkbox" tabIndex={0} aria-checked={ch} aria-label={b} onClick={() => toggleBenefit(b)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => toggleBenefit(b))} style={{ ...animStyle(i), display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: ch ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: ch ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${ch ? t.colors.primaryScale[200] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Box style={{ width: 16, height: 16, borderRadius: t.borderRadius.sm, border: `${bdr} ${ch ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: ch ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ch && <Check size={10} color={t.colors.common.white} />}
                    </Box>
                    <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{b}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ),

      requirements: () => (
        <Box style={cardStyle}>
          <StepTitle icon={ClipboardCheck} label="Requirements & Screening" />
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Skills</Text>
            <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <input type="text" aria-label="Skill name" style={{ ...inputStyle, flex: 1 }} placeholder="Add a skill..." value={newSkillName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkillName(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <select aria-label="Proficiency level" style={{ ...selectStyle, width: 140 }} value={newSkillProficiency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewSkillProficiency(e.target.value as SkillTag['proficiency'])}>{PROFICIENCY_OPTIONS.map((o, i) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              <Box role="button" tabIndex={0} aria-label="Add skill" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, addSkill)} onClick={addSkill} style={primaryBtn}><Plus size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add</Text></Box>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{(formData.skills ?? []).map((s, i) => <SkillTag_ key={`${s.name}-${i}`} skill={s} idx={i} />)}</Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {(['experienceMin', 'experienceMax'] as const).map((k, i) => (
              <Box key={k} style={{ flex: 1 }}><Field fieldKey={k} label={i === 0 ? 'Min. Experience (years)' : 'Max. Experience (years)'}><input type="number" aria-label={i === 0 ? 'Minimum experience years' : 'Maximum experience years'} style={inputStyle} min={0} placeholder="0" value={formData[k] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(k, Number(e.target.value))} /></Field></Box>
            ))}
          </Box>
          <Field fieldKey="educationLevel" label="Education Level"><select aria-label="Education level" style={selectStyle} value={formData.educationLevel ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('educationLevel', e.target.value)}><option value="">Select education level...</option>{EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></Field>
          <Box style={fgStyle}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <Text as="label" style={{ ...labelStyle, marginBottom: 0 }}>Screening Questions</Text>
              <Box role="button" tabIndex={0} aria-label="Add screening question" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, addSQ)} onClick={addSQ} style={{ ...secondaryBtn, padding: `${t.spacing[1]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.xs }}><Plus size={12} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add Question</Text></Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              {(formData.screeningQuestions ?? []).map((q, idx) => (
                <Box key={q.id} style={{ ...animStyle(idx), padding: t.spacing[4], backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[200]}`, borderRadius: t.borderRadius.md }}>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3] }}>
                    <Box style={{ color: t.colors.neutral[400], paddingTop: t.spacing[2] }}><GripVertical size={14} /></Box>
                    <Box style={{ flex: 1 }}>
                      <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                        <input type="text" aria-label={`Question ${idx + 1}`} style={{ ...inputStyle, flex: 1 }} placeholder={`Question ${idx + 1}...`} value={q.question} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSQ(q.id, 'question', e.target.value)} />
                        <select aria-label={`Question ${idx + 1} type`} style={{ ...selectStyle, width: 120 }} value={q.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSQ(q.id, 'type', e.target.value)}><option value="text">Text</option><option value="boolean">Yes/No</option><option value="choice">Choice</option></select>
                      </Box>
                      {q.type === 'choice' && <input type="text" aria-label="Choice options" style={{ ...inputStyle, marginBottom: t.spacing[2] }} placeholder="Options (comma-separated)" value={(q.options ?? []).join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSQ(q.id, 'options', e.target.value.split(',').map((s, i) => s.trim()))} />}
                      <Box role="checkbox" tabIndex={0} aria-checked={q.required} aria-label="Required question" onClick={() => updateSQ(q.id, 'required', !q.required)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateSQ(q.id, 'required', !q.required))} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], cursor: 'pointer' }}>
                        <Box style={{ width: 14, height: 14, borderRadius: t.borderRadius.sm, border: `${bdr} ${q.required ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: q.required ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{q.required && <Check size={8} color={t.colors.common.white} />}</Box>
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Required</Text>
                      </Box>
                    </Box>
                    <Box role="button" tabIndex={0} aria-label={`Remove question ${idx + 1}`} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => removeSQ(q.id))} onClick={() => removeSQ(q.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', backgroundColor: 'transparent', color: t.colors.errorScale[400], borderRadius: t.borderRadius.sm, cursor: 'pointer' }}><Trash2 size={14} /></Box>
                  </Box>
                </Box>
              ))}
              {(formData.screeningQuestions ?? []).length === 0 && (
                <Box style={{ ...createEmptyStateStyle(t), padding: `${t.spacing[6]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
                  <HelpCircle size={24} style={{ marginBottom: t.spacing[2], color: t.colors.neutral[400] }} /><Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>No screening questions added yet</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ),

      configuration: () => (
        <Box style={cardStyle}>
          <StepTitle icon={Settings} label="Configuration" />
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Visibility *</Text>
            <Box role="radiogroup" aria-label="Visibility" style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {VISIBILITY_OPTIONS.map((o, i) => <RadioCard key={o.value} selected={(formData.visibility ?? 'public') === o.value} icon={<o.icon size={18} />} label={o.label} description={o.description} onClick={() => updateField('visibility', o.value)} />)}
            </Box>
          </Box>
          <Field fieldKey="openings" label="Number of Openings"><input type="number" aria-label="Number of openings" style={{ ...inputStyle, maxWidth: 120 }} min={1} value={formData.openings ?? 1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('openings', Number(e.target.value))} /></Field>
          {templates.length > 0 && <Field fieldKey="templateId" label="Job Template"><select aria-label="Job template" style={selectStyle} value={formData.templateId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { updateField('templateId', e.target.value); setSelectedTemplate(e.target.value); }}><option value="">None - Start from scratch</option>{templates.map((tp, i) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}</select></Field>}
          {clients.length > 0 && <Field fieldKey="clientId" label="Client Association"><select aria-label="Client association" style={selectStyle} value={formData.clientId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('clientId', e.target.value)}><option value="">No client association</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}

          {/* Work Mode */}
          <Field fieldKey="workMode" label="Work Mode">
            <Box role="radiogroup" aria-label="Work mode" style={{ display: 'flex', gap: t.spacing[2] }}>
              {[
                { value: 'onsite', label: 'On-site' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'flexible', label: 'Flexible' },
              ].map((o, i) => (
                <OptionBtn key={o.value} selected={(formData.workMode ?? 'onsite') === o.value} label={o.label} onClick={() => updateField('workMode', o.value as any)} flexOne />
              ))}
            </Box>
          </Field>

          {/* Compensation Extras */}
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            <Box style={{ flex: 1 }}>
              <Box role="checkbox" tabIndex={0} aria-checked={formData.equityEligible ?? false} aria-label="Equity eligible" onClick={() => updateField('equityEligible', !(formData.equityEligible ?? false))} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('equityEligible', !(formData.equityEligible ?? false)))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: (formData.equityEligible ?? false) ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: (formData.equityEligible ?? false) ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${(formData.equityEligible ?? false) ? t.colors.primaryScale[200] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                <Box style={{ width: 16, height: 16, borderRadius: t.borderRadius.sm, border: `${bdr} ${(formData.equityEligible ?? false) ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: (formData.equityEligible ?? false) ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(formData.equityEligible ?? false) && <Check size={10} color={t.colors.common.white} />}
                </Box>
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Equity Eligible</Text>
              </Box>
            </Box>
            <Box style={{ flex: 1 }}>
              <Box role="checkbox" tabIndex={0} aria-checked={formData.bonusEligible ?? false} aria-label="Bonus eligible" onClick={() => updateField('bonusEligible', !(formData.bonusEligible ?? false))} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('bonusEligible', !(formData.bonusEligible ?? false)))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: (formData.bonusEligible ?? false) ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: (formData.bonusEligible ?? false) ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${(formData.bonusEligible ?? false) ? t.colors.primaryScale[200] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                <Box style={{ width: 16, height: 16, borderRadius: t.borderRadius.sm, border: `${bdr} ${(formData.bonusEligible ?? false) ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: (formData.bonusEligible ?? false) ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(formData.bonusEligible ?? false) && <Check size={10} color={t.colors.common.white} />}
                </Box>
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Bonus Eligible</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      ),

      review: () => {
        const rvLbl: React.CSSProperties = { fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] };
        const rvVal: React.CSSProperties = { fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] };
        const pair = (label: string, value: string | number | undefined) => (
          <Box style={{ marginBottom: t.spacing[3] }}><Text style={{ ...rvLbl, display: 'block' }}>{label}</Text><Text style={rvVal}>{value || 'Not specified'}</Text></Box>
        );

        const reviewContent: Record<string, React.ReactNode> = {
          basics: <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Job Title', formData.title)}{pair('Job Code', formData.code)}{pair('Department', formData.department)}{pair('Seniority', formData.seniority)}{pair('Employment Type', formData.employmentType)}{pair('Urgency', formData.urgency)}</Box>,
          description: <Box>{pair('Description', formData.description)}{pair('Responsibilities', formData.responsibilities)}{pair('Requirements', formData.requirements)}</Box>,
          location: <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Work Arrangement', formData.workArrangement)}{pair('Primary Location', formData.primaryLocation)}{pair('Secondary Location', formData.secondaryLocation)}</Box>,
          compensation: (
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
              {pair('Salary Range', (formData.salaryMin || formData.salaryMax) ? `${formData.currency ?? 'USD'} ${(formData.salaryMin ?? 0).toLocaleString()} - ${(formData.salaryMax ?? 0).toLocaleString()}` : undefined)}
              {pair('Signing Bonus', formData.signingBonus ? `${formData.currency ?? 'USD'} ${formData.signingBonus.toLocaleString()}` : undefined)}
              {pair('Equity', formData.equity)}
              <Box style={{ gridColumn: '1 / -1' }}>
                <Text style={{ ...rvLbl, display: 'block' }}>Benefits</Text>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {(formData.benefits ?? []).length > 0 ? (formData.benefits ?? []).map((b, i) => <Text key={b} style={createBadgeStyle(t, 'primary')}>{b}</Text>) : <Text style={rvVal}>None specified</Text>}
                </Box>
              </Box>
            </Box>
          ),
          requirements: (
            <Box>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
                {pair('Experience', (formData.experienceMin || formData.experienceMax) ? `${formData.experienceMin ?? 0} - ${formData.experienceMax ?? 0} years` : undefined)}
                {pair('Education', formData.educationLevel)}
              </Box>
              <Box style={{ marginTop: t.spacing[2] }}><Text style={{ ...rvLbl, display: 'block' }}>Skills</Text><Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>{(formData.skills ?? []).length > 0 ? (formData.skills ?? []).map((s, i) => <Text key={i} style={createBadgeStyle(t, 'info')}>{s.name} ({s.proficiency})</Text>) : <Text style={rvVal}>None specified</Text>}</Box></Box>
              <Box style={{ marginTop: t.spacing[2] }}><Text style={{ ...rvLbl, display: 'block' }}>Screening Questions</Text>{(formData.screeningQuestions ?? []).length > 0 ? (formData.screeningQuestions ?? []).map((q, qi) => <Text key={q.id} style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], padding: `${t.spacing[1]}px 0`, display: 'block' }}>{qi + 1}. {q.question || 'Untitled'} ({q.type}){q.required ? ' *' : ''}</Text>) : <Text style={rvVal}>None</Text>}</Box>
            </Box>
          ),
          configuration: <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Visibility', formData.visibility)}{pair('Openings', formData.openings)}{pair('Template', templates.find((tp) => tp.id === formData.templateId)?.name)}{pair('Client', clients.find((c) => c.id === formData.clientId)?.name)}</Box>,
        };

        return (
          <Box style={cardStyle}>
            <StepTitle icon={ClipboardCheck} label="Review Job Posting" />
            {validationErrors.length > 0 && (
              <Box style={{ padding: t.spacing[4], backgroundColor: t.colors.errorScale[50], border: `${bdr} ${t.colors.errorScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[4] }} role="alert">
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.errorScale[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, marginBottom: t.spacing[2] }}><AlertCircle size={16} /><Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''} found</Text></Box>
                {validationErrors.map((err, i) => <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], padding: `${t.spacing[1]}px 0`, paddingLeft: t.spacing[6], display: 'block' }}><strong>{err.field}:</strong> {err.message}</Text>)}
              </Box>
            )}
            {REVIEW_SECTIONS.map(({ key, label, icon: Icon }) => {
              const isOpen = expandedReviewSections[key] ?? true;
              const hasErr = stepErrors(key).length > 0;
              return (
                <Box key={key} style={{ borderBottom: `${bdr} ${t.colors.neutral[200]}` }}>
                  <Box role="button" tabIndex={0} aria-expanded={isOpen} aria-label={`Toggle ${label} review`} onClick={() => setExpandedReviewSections((p) => ({ ...p, [key]: !p[key] }))} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => setExpandedReviewSections((p) => ({ ...p, [key]: !p[key] })))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[3]}px 0`, cursor: 'pointer' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ color: hasErr ? t.colors.errorScale[500] : t.colors.primaryScale[500] }}><Icon size={16} /></Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{label}</Text>
                      {hasErr && <Text style={createBadgeStyle(t, 'error')}>{stepErrors(key).length} error{stepErrors(key).length > 1 ? 's' : ''}</Text>}
                    </Box>
                    {isOpen ? <ChevronUp size={16} color={t.colors.neutral[400]} /> : <ChevronDown size={16} color={t.colors.neutral[400]} />}
                  </Box>
                  {isOpen && <Box style={{ paddingBottom: t.spacing[4] }}>{reviewContent[key]}</Box>}
                </Box>
              );
            })}
          </Box>
        );
      },
    };

    /* -- Step indicator -------------------------------------------- */

    const renderStepIndicator = useMemo(() => {
      const sw = 100 / steps.length;
      return (
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white, borderBottom: `${bdr} ${t.colors.neutral[200]}` }} role="navigation" aria-label="Wizard steps">
          <Box style={{ display: 'flex', alignItems: 'center', position: 'relative' as const }}>
            <svg style={{ position: 'absolute', top: '50%', left: `${sw / 2}%`, width: `${100 - sw}%`, height: 2, transform: 'translateY(-50%)' }} role="presentation">
              <line x1="0" y1="1" x2="100%" y2="1" stroke={t.colors.neutral[200]} strokeWidth="2" />
              {stepIdx > 0 && <line x1="0" y1="1" x2={`${(stepIdx / (steps.length - 1)) * 100}%`} y2="1" stroke={t.colors.primaryScale[500]} strokeWidth="2" />}
            </svg>
            {steps.map((step, idx) => {
              const isActive = step.key === currentStep;
              const isCompleted = step.isComplete || idx < stepIdx;
              const hasErr = step.hasErrors;
              const cc = hasErr ? t.colors.errorScale : isCompleted ? t.colors.successScale : isActive ? t.colors.primaryScale : null;
              const circleColor = cc ? cc[isCompleted ? 500 : isActive ? 600 : 500] : t.colors.neutral[300];
              const circleBg = cc ? cc[50] : t.colors.common.white;
              return (
                <Box key={step.key} role="button" tabIndex={0} aria-label={`Go to step ${step.label}`} aria-current={isActive ? 'step' : undefined} onClick={() => goToStep(step.key)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => goToStep(step.key))} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', position: 'relative' as const, zIndex: 1, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: circleBg, border: `${bdr} ${circleColor}`, color: circleColor, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, transition: `all ${t.motion.hover}`, boxShadow: isActive ? `0 0 0 4px ${t.colors.primaryScale[100]}` : 'none' }}>
                    {hasErr ? <AlertCircle size={14} /> : isCompleted ? <Check size={14} /> : <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{idx + 1}</Text>}
                  </Box>
                  <Text style={{ marginTop: t.spacing[1], fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : hasErr ? t.colors.errorScale[600] : t.colors.neutral[500] }}>{step.label}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }, [steps, stepIdx, currentStep, t, bdr, goToStep, handleKeyAction]);

    /* -- Sidebar --------------------------------------------------- */

    const renderSidebar = useMemo(() => {
      const sc = isDirty ? t.colors.warningScale : t.colors.successScale;
      return (
        <Box style={{ width: 280, borderLeft: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, padding: t.spacing[5], display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: t.spacing[3], backgroundColor: sc[50], border: `${bdr} ${sc[200]}`, borderRadius: t.borderRadius.md }} role="status" aria-live="polite">
            <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: sc[500] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc[700] }}>{isDirty ? 'Unsaved changes' : 'All changes saved'}</Text>
          </Box>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], marginBottom: t.spacing[2], display: 'block' }}>Progress</Text>
            <Box style={{ height: 6, backgroundColor: t.colors.neutral[200], borderRadius: t.borderRadius.full, overflow: 'hidden' }} role="progressbar" aria-valuenow={Math.round(((stepIdx + 1) / steps.length) * 100)} aria-valuemin={0} aria-valuemax={100}>
              <Box style={{ height: '100%', width: `${((stepIdx + 1) / steps.length) * 100}%`, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1], display: 'block' }}>Step {stepIdx + 1} of {steps.length}</Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            {steps.map((step, idx) => {
              const isActive = step.key === currentStep;
              const isCompleted = step.isComplete || idx < stepIdx;
              return (
                <Box key={step.key} role="button" tabIndex={0} aria-label={`Go to ${step.label}`} onClick={() => goToStep(step.key)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => goToStep(step.key))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  {step.hasErrors ? <AlertCircle size={14} color={t.colors.errorScale[500]} /> : isCompleted ? <Check size={14} color={t.colors.successScale[500]} /> : <Box style={{ width: 14, height: 14, borderRadius: t.borderRadius.full, border: `1.5px solid ${isActive ? t.colors.primaryScale[500] : t.colors.neutral[300]}` }} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : step.hasErrors ? t.colors.errorScale[600] : t.colors.neutral[600] }}>{step.label}</Text>
                </Box>
              );
            })}
          </Box>
          <Box style={{ flex: 1 }} />
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box role="button" tabIndex={0} aria-label="Save draft" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handleSave)} onClick={handleSave} style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }}><Save size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Save Draft</Text></Box>
            <Box role="button" tabIndex={0} aria-label="Preview" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handlePreview)} onClick={handlePreview} style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }}><Eye size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Preview</Text></Box>
            <Box role="button" tabIndex={0} aria-label="Publish job" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handlePublish)} onClick={handlePublish} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', backgroundColor: t.colors.successScale[600] }}><Send size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Publish Job</Text></Box>
          </Box>
        </Box>
      );
    }, [isDirty, steps, stepIdx, currentStep, t, bdr, goToStep, handleKeyAction, handleSave, handlePreview, handlePublish, secondaryBtn, primaryBtn]);

    /* -- Main render ----------------------------------------------- */

    return (
      <Box style={{ display: 'flex', flexDirection: 'column' as const, height: '100%', backgroundColor: t.colors.neutral[50], fontFamily: 'inherit', ...entrance.animate, transition: entrance.transition, ...style }} className={className}>
        {accentBar && <Box style={accentBar} />}
        {renderStepIndicator}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Box style={{ flex: 1, overflow: 'auto', padding: t.spacing[6] }} role="main">{stepRenderers[currentStep]?.() ?? stepRenderers.basics?.()}</Box>
          {renderSidebar}
        </Box>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${t.spacing[4]}px ${t.spacing[6]}px`, borderTop: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white }}>
          <Box role="button" tabIndex={0} aria-label="Previous step" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, goPrev)} onClick={goPrev} style={{ ...ghostBtn, visibility: stepIdx === 0 ? 'hidden' : 'visible' as const }}><ChevronLeft size={16} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Previous</Text></Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{steps[stepIdx]?.label}</Text>
          {stepIdx < steps.length - 1 ? (
            <Box role="button" tabIndex={0} aria-label="Next step" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, goNext)} onClick={goNext} style={primaryBtn}><Text style={{ fontSize: 'inherit', color: 'inherit' }}>Next</Text> <ChevronRight size={16} /></Box>
          ) : (
            <Box role="button" tabIndex={0} aria-label="Publish job" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handlePublish)} onClick={handlePublish} style={{ ...primaryBtn, backgroundColor: t.colors.successScale[600] }}><Send size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Publish</Text></Box>
          )}
        </Box>
      </Box>
    );
  },
});
