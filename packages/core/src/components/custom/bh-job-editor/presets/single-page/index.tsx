'use client';

/**
 * BhJobEditor - Single Page Preset
 * All job creation sections on one scrollable page with anchor navigation
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
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

  createDividerStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhJobEditorProps } from '../../core';
import type { JobFormData, SkillTag, ScreeningQuestion, WorkArrangement } from '../../core';
import { BH_JOB_EDITOR_DEFAULTS } from '../../core';
import {
  Check, AlertCircle, ChevronDown, ChevronUp, Save, Eye, Send, Sparkles,
  Bold, Italic, Underline, List, ListOrdered, Link, MapPin, DollarSign,
  Plus, X, Trash2, GripVertical, Briefcase, FileText, Building2,
  Settings, ClipboardCheck, Globe, Lock, ShieldAlert, Tag, HelpCircle,
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

const SECTIONS = [
  { key: 'basics', label: 'Basics', icon: Briefcase },
  { key: 'description', label: 'Description', icon: FileText },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'compensation', label: 'Compensation', icon: DollarSign },
  { key: 'requirements', label: 'Requirements', icon: ClipboardCheck },
  { key: 'configuration', label: 'Configuration', icon: Settings },
];

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

function generateJobCode(title: string): string {
  if (!title) return '';
  const prefix = title.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() || '').join('').slice(0, 4);
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const SinglePageBhJobEditor = createPreset<BhJobEditorProps>({
  name: 'BhJobEditor.SinglePage',
  render: ({ primitives, props, tokens }: PresetContext<BhJobEditorProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const isGlass = t.surface.useGlass && !!t.glass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const { formData: formDataProp, validationErrors: validationErrorsProp, onChange, onSave, onPublish, onPreview, isDirty: isDirtyProp, templates: rawTemplates = [], clients: rawClients = [], className, style } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];
    const clients = Array.isArray(rawClients) ? rawClients : [];

    const defaultForm = BH_JOB_EDITOR_DEFAULTS.formData as JobFormData;
    const [internalFormData, setInternalFormData] = useState<Partial<JobFormData>>(formDataProp ?? defaultForm);
    const [internalErrors, setInternalErrors] = useState(validationErrorsProp ?? []);
    const [internalDirty, setInternalDirty] = useState(isDirtyProp ?? false);
    const [activeSection, setActiveSection] = useState('basics');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillProficiency, setNewSkillProficiency] = useState<SkillTag['proficiency']>('intermediate');
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const formData = formDataProp ?? internalFormData;
    const validationErrors = validationErrorsProp ?? internalErrors;
    const isDirty = isDirtyProp ?? internalDirty;
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    /* -- Handlers -------------------------------------------------- */

    const updateField = useCallback((field: keyof JobFormData, value: unknown) => {
      const updated = { ...formData, [field]: value };
      if (field === 'title' && !formData.code) updated.code = generateJobCode(value as string);
      setInternalFormData(updated);
      setInternalDirty(true);
      onChange?.(updated);
    }, [formData, onChange]);

    const handleSave = useCallback(() => { onSave?.(formData); setInternalDirty(false); }, [formData, onSave]);
    const handlePublish = useCallback(() => { onPublish?.(formData); }, [formData, onPublish]);
    const handlePreview = useCallback(() => { onPreview?.(formData); }, [formData, onPreview]);

    const scrollToSection = useCallback((key: string) => {
      setActiveSection(key);
      sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const addSkill = useCallback(() => {
      if (!newSkillName.trim()) return;
      updateField('skills', [...(formData.skills ?? []), { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
      setNewSkillName('');
    }, [newSkillName, newSkillProficiency, formData.skills, updateField]);

    const removeSkill = useCallback((i: number) => {
      const u = [...(formData.skills ?? [])]; u.splice(i, 1); updateField('skills', u);
    }, [formData.skills, updateField]);

    const addScreeningQuestion = useCallback(() => {
      updateField('screeningQuestions', [...(formData.screeningQuestions ?? []), { id: `sq-${Date.now()}`, question: '', type: 'text', required: false } as ScreeningQuestion]);
    }, [formData.screeningQuestions, updateField]);

    const updateSQ = useCallback((id: string, field: keyof ScreeningQuestion, value: unknown) => {
      updateField('screeningQuestions', (formData.screeningQuestions ?? []).map((q) => q.id === id ? { ...q, [field]: value } : q));
    }, [formData.screeningQuestions, updateField]);

    const removeSQ = useCallback((id: string) => {
      updateField('screeningQuestions', (formData.screeningQuestions ?? []).filter((q) => q.id !== id));
    }, [formData.screeningQuestions, updateField]);

    const toggleBenefit = useCallback((b: string) => {
      const c = formData.benefits ?? [];
      updateField('benefits', c.includes(b) ? c.filter((x) => x !== b) : [...c, b]);
    }, [formData.benefits, updateField]);

    const fieldErrors = useCallback((f: string) => validationErrors.filter((e) => e.field === f), [validationErrors]);
    const sectionErrors = useCallback((s: string) => validationErrors.filter((e) => e.step === s), [validationErrors]);

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
    const textareaStyle: React.CSSProperties = useMemo(() => ({ ...inputStyle, minHeight: 120, resize: 'vertical' as const, lineHeight: t.typography.lineHeight.relaxed, fontFamily: 'inherit' }), [inputStyle, t]);

    /* -- Sub-components -------------------------------------------- */

    const OptionBtn = useCallback(({ selected, label, onClick, scale, flexOne }: { selected: boolean; label: string; onClick: () => void; scale?: any; flexOne?: boolean }) => {
      const s = scale ?? t.colors.primaryScale;
      return (
        <Box
          role="button"
          tabIndex={0}
          aria-label={`Select ${label}`}
          aria-pressed={selected}
          onClick={onClick}
          onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, onClick)}
          onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
          onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
          style={{ ...(flexOne ? { flex: 1 } : {}), padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: selected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: selected ? s[700] : t.colors.neutral[600], backgroundColor: selected ? s[50] : t.colors.common.white, border: `${bdr} ${selected ? s[300] : t.colors.neutral[300]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}`, textAlign: 'center' as const }}
        >
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

    const SectionWrapper = useCallback(({ sKey, label, icon, children }: { sKey: string; label: string; icon: React.ReactNode; children: React.ReactNode }) => {
      const isCollapsed = collapsedSections[sKey] ?? false;
      const errs = sectionErrors(sKey);
      const stagger = createStaggerDelay(t, SECTIONS.findIndex((s) => s.key === sKey));
      const itemEntrance = createEntranceAnimation(t, { index: SECTIONS.findIndex((s) => s.key === sKey) });
      return (
        <div ref={(el: HTMLDivElement | null) => { sectionRefs.current[sKey] = el; }} style={{ ...cardStyle, marginBottom: t.spacing[5], ...itemEntrance.animate, transition: itemEntrance.transition }} id={`section-${sKey}`}>
          <Box
            role="button"
            tabIndex={0}
            aria-expanded={!isCollapsed}
            aria-label={`Toggle ${label} section`}
            onClick={() => setCollapsedSections((p) => ({ ...p, [sKey]: !p[sKey] }))}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => setCollapsedSections((p) => ({ ...p, [sKey]: !p[sKey] })))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: `all ${t.motion.hover}`, marginBottom: t.spacing[4] }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={{ color: t.colors.primaryScale[500] }}>{icon}</Box>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>{label}</Text>
              {errs.length > 0 && <Text style={createBadgeStyle(t, 'error')}>{errs.length} error{errs.length > 1 ? 's' : ''}</Text>}
            </Box>
            {isCollapsed ? <ChevronDown size={18} color={t.colors.neutral[400]} /> : <ChevronUp size={18} color={t.colors.neutral[400]} />}
          </Box>
          {!isCollapsed && children}
        </div>
      );
    }, [collapsedSections, sectionErrors, cardStyle, t, ptypo, handleKeyAction]);

    const ToolbarEditor = useCallback(({ value, onChange: oc, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
      const tbBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', backgroundColor: 'transparent', color: t.colors.neutral[600], borderRadius: t.borderRadius.sm, cursor: 'pointer' };
      return (
        <Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[300]}`, borderBottom: 'none', borderRadius: `${t.borderRadius.md} ${t.borderRadius.md} 0 0` }}>
            {[Bold, Italic, Underline].map((I, i) => (
              <Box key={i} as="button" role="button" tabIndex={0} aria-label={['Bold', 'Italic', 'Underline'][i]} style={tbBtn}><I size={14} /></Box>
            ))}
            <Box style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[300], margin: `0 ${t.spacing[1]}px` }} />
            {[List, ListOrdered, Link].map((I, i) => (
              <Box key={i} as="button" role="button" tabIndex={0} aria-label={['Bullet list', 'Numbered list', 'Link'][i]} style={tbBtn}><I size={14} /></Box>
            ))}
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
          <Tag size={10} />
          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{skill.name}</Text>
          <Text style={{ color: sc[500], marginLeft: t.spacing[1], fontSize: 'inherit' }}>({skill.proficiency})</Text>
          <Box role="button" tabIndex={0} aria-label={`Remove skill ${skill.name}`} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => removeSkill(idx))} onClick={() => removeSkill(idx)} style={{ display: 'inline-flex', border: 'none', backgroundColor: 'transparent', color: sc[400], cursor: 'pointer', padding: 0, marginLeft: t.spacing[1] }}><X size={12} /></Box>
        </Box>
      );
    }, [t, bdr, removeSkill, handleKeyAction]);

    const RadioCard = useCallback(({ selected, icon, label, description, onClick }: { selected: boolean; icon: React.ReactNode; label: string; description: string; onClick: () => void }) => (
      <Box
        role="radio"
        tabIndex={0}
        aria-checked={selected}
        aria-label={label}
        onClick={onClick}
        onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, onClick)}
        style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[4], backgroundColor: selected ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${selected ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}
      >
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

    /* -- Salary SVG Slider ----------------------------------------- */

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

    /* -- Section renderers ----------------------------------------- */

    const sectionRenderers: Record<string, () => React.ReactNode> = {
      basics: () => (
        <>
          <Field fieldKey="title" label="Job Title *"><input type="text" aria-label="Job title" style={inputStyle} placeholder="e.g. Senior Software Engineer" value={formData.title ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('title', e.target.value)} /></Field>
          <Field fieldKey="code" label="Job Code">
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              <input type="text" aria-label="Job code" style={{ ...inputStyle, flex: 1 }} placeholder="Auto-generated" value={formData.code ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('code', e.target.value)} />
              <Box role="button" tabIndex={0} aria-label="Generate job code" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('code', generateJobCode(formData.title ?? '')))} onClick={() => updateField('code', generateJobCode(formData.title ?? ''))} style={secondaryBtn}>
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Generate</Text>
              </Box>
            </Box>
          </Field>
          <Field fieldKey="department" label="Department *">
            <select aria-label="Department" style={selectStyle} value={formData.department ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('department', e.target.value)}>
              <option value="">Select department...</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field fieldKey="seniority" label="Seniority Level *">
            <Box role="radiogroup" aria-label="Seniority level" style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {SENIORITY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.seniority === o.value} label={o.label} onClick={() => updateField('seniority', o.value)} />)}
            </Box>
          </Field>
          <Field fieldKey="employmentType" label="Employment Type *">
            <Box role="radiogroup" aria-label="Employment type" style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {EMPLOYMENT_TYPES.map((o) => <OptionBtn key={o.value} selected={formData.employmentType === o.value} label={o.label} onClick={() => updateField('employmentType', o.value)} />)}
            </Box>
          </Field>
          <Field fieldKey="urgency" label="Urgency">
            <Box role="radiogroup" aria-label="Urgency" style={{ display: 'flex', gap: t.spacing[2] }}>
              {URGENCY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.urgency === o.value} label={o.label} onClick={() => updateField('urgency', o.value)} scale={t.colors[o.scale]} flexOne />)}
            </Box>
          </Field>
        </>
      ),

      description: () => (
        <>
          <Field fieldKey="description" label="Description *"><ToolbarEditor value={formData.description ?? ''} onChange={(v) => updateField('description', v)} placeholder="Describe the role, team, and what success looks like..." /></Field>
          <Field fieldKey="responsibilities" label="Key Responsibilities"><textarea aria-label="Key responsibilities" style={textareaStyle} placeholder="List the main responsibilities..." value={formData.responsibilities ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('responsibilities', e.target.value)} /></Field>
          <Field fieldKey="requirements" label="Requirements"><textarea aria-label="Requirements" style={textareaStyle} placeholder="Must-have qualifications..." value={formData.requirements ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('requirements', e.target.value)} /></Field>
        </>
      ),

      location: () => (
        <>
          <Field fieldKey="workArrangement" label="Work Arrangement *">
            <Box role="radiogroup" aria-label="Work arrangement" style={{ display: 'flex', gap: t.spacing[3] }}>
              {ARRANGEMENT_OPTIONS.map((o) => {
                const sel = formData.workArrangement === o.value;
                return (
                  <Box key={o.value} role="radio" tabIndex={0} aria-checked={sel} aria-label={o.label} onClick={() => updateField('workArrangement', o.value)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateField('workArrangement', o.value))} style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[4]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: sel ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Box style={{ color: sel ? t.colors.primaryScale[500] : t.colors.neutral[400] }}><o.icon size={16} /></Box>
                    <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{o.label}</Text>
                  </Box>
                );
              })}
            </Box>
          </Field>
          <Field fieldKey="primaryLocation" label="Primary Location *"><input type="text" aria-label="Primary location" style={inputStyle} placeholder="e.g. San Francisco, CA" value={formData.primaryLocation ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('primaryLocation', e.target.value)} /></Field>
          <Field fieldKey="secondaryLocation" label="Secondary Location"><input type="text" aria-label="Secondary location" style={inputStyle} placeholder="e.g. New York, NY (optional)" value={formData.secondaryLocation ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('secondaryLocation', e.target.value)} /></Field>
          <Box style={{ height: 160, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }} role="img" aria-label="Map preview">
            <MapPin size={20} style={{ marginRight: t.spacing[2] }} />
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Map preview - {formData.primaryLocation || 'Enter a location above'}</Text>
          </Box>
        </>
      ),

      compensation: () => (
        <>
          <Field fieldKey="currency" label="Currency"><select aria-label="Currency" style={{ ...selectStyle, maxWidth: 160 }} value={formData.currency ?? 'USD'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('currency', e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
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
              {BENEFITS_OPTIONS.map((b) => {
                const ch = (formData.benefits ?? []).includes(b);
                return (
                  <Box key={b} role="checkbox" tabIndex={0} aria-checked={ch} aria-label={b} onClick={() => toggleBenefit(b)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => toggleBenefit(b))} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: ch ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: ch ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${ch ? t.colors.primaryScale[200] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <Box style={{ width: 16, height: 16, borderRadius: t.borderRadius.sm, border: `${bdr} ${ch ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: ch ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ch && <Check size={10} color={t.colors.common.white} />}
                    </Box>
                    <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{b}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </>
      ),

      requirements: () => (
        <>
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Skills</Text>
            <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <input type="text" aria-label="Skill name" style={{ ...inputStyle, flex: 1 }} placeholder="Add a skill..." value={newSkillName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkillName(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <select aria-label="Proficiency level" style={{ ...selectStyle, width: 140 }} value={newSkillProficiency} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewSkillProficiency(e.target.value as SkillTag['proficiency'])}>{PROFICIENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              <Box role="button" tabIndex={0} aria-label="Add skill" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, addSkill)} onClick={addSkill} style={primaryBtn}><Plus size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add</Text></Box>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {(formData.skills ?? []).map((s, i) => <SkillTag_ key={`${s.name}-${i}`} skill={s} idx={i} />)}
            </Box>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[4] }}>
            {(['experienceMin', 'experienceMax'] as const).map((k, i) => (
              <Box key={k} style={{ flex: 1 }}><Field fieldKey={k} label={i === 0 ? 'Min. Experience (years)' : 'Max. Experience (years)'}><input type="number" aria-label={i === 0 ? 'Minimum experience years' : 'Maximum experience years'} style={inputStyle} min={0} placeholder="0" value={formData[k] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(k, Number(e.target.value))} /></Field></Box>
            ))}
          </Box>
          <Field fieldKey="educationLevel" label="Education Level">
            <select aria-label="Education level" style={selectStyle} value={formData.educationLevel ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('educationLevel', e.target.value)}>
              <option value="">Select education level...</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Box style={fgStyle}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <Text as="label" style={{ ...labelStyle, marginBottom: 0 }}>Screening Questions</Text>
              <Box role="button" tabIndex={0} aria-label="Add screening question" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, addScreeningQuestion)} onClick={addScreeningQuestion} style={{ ...secondaryBtn, padding: `${t.spacing[1]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.xs }}><Plus size={12} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add Question</Text></Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              {(formData.screeningQuestions ?? []).map((q, idx) => (
                <Box key={q.id} style={{ padding: t.spacing[4], backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[200]}`, borderRadius: t.borderRadius.md }}>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3] }}>
                    <Box style={{ color: t.colors.neutral[400], paddingTop: t.spacing[2] }}><GripVertical size={14} /></Box>
                    <Box style={{ flex: 1 }}>
                      <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                        <input type="text" aria-label={`Question ${idx + 1}`} style={{ ...inputStyle, flex: 1 }} placeholder={`Question ${idx + 1}...`} value={q.question} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSQ(q.id, 'question', e.target.value)} />
                        <select aria-label={`Question ${idx + 1} type`} style={{ ...selectStyle, width: 120 }} value={q.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSQ(q.id, 'type', e.target.value)}><option value="text">Text</option><option value="boolean">Yes/No</option><option value="choice">Choice</option></select>
                      </Box>
                      {q.type === 'choice' && <input type="text" aria-label="Choice options" style={{ ...inputStyle, marginBottom: t.spacing[2] }} placeholder="Options (comma-separated)" value={(q.options ?? []).join(', ')} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSQ(q.id, 'options', e.target.value.split(',').map((s) => s.trim()))} />}
                      <Box role="checkbox" tabIndex={0} aria-checked={q.required} aria-label="Required question" onClick={() => updateSQ(q.id, 'required', !q.required)} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => updateSQ(q.id, 'required', !q.required))} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], cursor: 'pointer' }}>
                        <Box style={{ width: 14, height: 14, borderRadius: t.borderRadius.sm, border: `${bdr} ${q.required ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, backgroundColor: q.required ? t.colors.primaryScale[500] : t.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {q.required && <Check size={8} color={t.colors.common.white} />}
                        </Box>
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Required</Text>
                      </Box>
                    </Box>
                    <Box role="button" tabIndex={0} aria-label={`Remove question ${idx + 1}`} onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => removeSQ(q.id))} onClick={() => removeSQ(q.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', backgroundColor: 'transparent', color: t.colors.errorScale[400], borderRadius: t.borderRadius.sm, cursor: 'pointer' }}><Trash2 size={14} /></Box>
                  </Box>
                </Box>
              ))}
              {(formData.screeningQuestions ?? []).length === 0 && (
                <Box style={{ ...createEmptyStateStyle(t), padding: `${t.spacing[6]}px ${t.spacing[4]}px`, textAlign: 'center' as const }}>
                  <HelpCircle size={24} style={{ marginBottom: t.spacing[2], color: t.colors.neutral[400] }} />
                  <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>No screening questions added yet</Text>
                </Box>
              )}
            </Box>
          </Box>
        </>
      ),

      configuration: () => (
        <>
          <Box style={fgStyle}>
            <Text as="label" style={labelStyle}>Visibility *</Text>
            <Box role="radiogroup" aria-label="Visibility" style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {VISIBILITY_OPTIONS.map((o) => <RadioCard key={o.value} selected={(formData.visibility ?? 'public') === o.value} icon={<o.icon size={18} />} label={o.label} description={o.description} onClick={() => updateField('visibility', o.value)} />)}
            </Box>
          </Box>
          <Field fieldKey="openings" label="Number of Openings"><input type="number" aria-label="Number of openings" style={{ ...inputStyle, maxWidth: 120 }} min={1} value={formData.openings ?? 1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('openings', Number(e.target.value))} /></Field>
          {templates.length > 0 && <Field fieldKey="templateId" label="Job Template"><select aria-label="Job template" style={selectStyle} value={formData.templateId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('templateId', e.target.value)}><option value="">None - Start from scratch</option>{templates.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}</select></Field>}
          {clients.length > 0 && <Field fieldKey="clientId" label="Client Association"><select aria-label="Client association" style={selectStyle} value={formData.clientId ?? ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField('clientId', e.target.value)}><option value="">No client association</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
        </>
      ),
    };

    /* -- Main render ----------------------------------------------- */

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    return (
      <Box style={{ display: 'flex', height: '100%', backgroundColor: t.colors.neutral[50], fontFamily: 'inherit', ...entrance.animate, transition: entrance.transition, ...style }} className={className}>
        {accentBar && <Box style={accentBar} />}
        {/* Nav sidebar */}
        <Box style={{ width: 220, backgroundColor: t.colors.common.white, borderRight: `${bdr} ${t.colors.neutral[200]}`, padding: t.spacing[4], display: 'flex', flexDirection: 'column' as const, position: 'sticky' as const, top: 0, height: '100%', overflow: 'auto' }} role="navigation" aria-label="Job editor sections">
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[800], marginBottom: t.spacing[4], padding: `0 ${t.spacing[2]}px` }}>Sections</Text>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            {SECTIONS.map((s) => {
              const Icon = s.icon, isActive = activeSection === s.key, hasErr = sectionErrors(s.key).length > 0;

              return (
                <Box
                  key={s.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to ${s.label} section`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => scrollToSection(s.key)}
                  onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, () => scrollToSection(s.key))}
                  style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent', borderLeft: isActive ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent', cursor: 'pointer', transition: `all ${t.motion.hover}` }}
                >
                  {hasErr ? <AlertCircle size={14} color={t.colors.errorScale[500]} /> : <Icon size={14} color={isActive ? t.colors.primaryScale[600] : t.colors.neutral[400]} />}
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : hasErr ? t.colors.errorScale[600] : t.colors.neutral[600] }}>{s.label}</Text>
                </Box>
              );
            })}
          </Box>
          <Box style={{ flex: 1 }} />
          {/* Status */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: t.spacing[3], backgroundColor: isDirty ? t.colors.warningScale[50] : t.colors.successScale[50], border: `${bdr} ${isDirty ? t.colors.warningScale[200] : t.colors.successScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[3] }} role="status" aria-live="polite">
            <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: isDirty ? t.colors.warningScale[500] : t.colors.successScale[500] }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: isDirty ? t.colors.warningScale[700] : t.colors.successScale[700] }}>{isDirty ? 'Unsaved' : 'Saved'}</Text>
          </Box>
          {/* Actions */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
            <Box role="button" tabIndex={0} aria-label="Save draft" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handleSave)} onClick={handleSave} style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }}><Save size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Save Draft</Text></Box>
            <Box role="button" tabIndex={0} aria-label="Preview" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handlePreview)} onClick={handlePreview} style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }}><Eye size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Preview</Text></Box>
            <Box role="button" tabIndex={0} aria-label="Publish job" onKeyDown={(e: React.KeyboardEvent) => handleKeyAction(e, handlePublish)} onClick={handlePublish} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', backgroundColor: t.colors.successScale[600] }}><Send size={14} /> <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Publish</Text></Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: t.spacing[6] }} role="main">
          {validationErrors.length > 0 && (
            <Box style={{ padding: t.spacing[4], backgroundColor: t.colors.errorScale[50], border: `${bdr} ${t.colors.errorScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[5] }} role="alert">
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.errorScale[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, marginBottom: t.spacing[2] }}>
                <AlertCircle size={16} />
                <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>{validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''} found</Text>
              </Box>
              {validationErrors.map((err, i) => <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], padding: `${t.spacing[1]}px 0`, paddingLeft: t.spacing[6], display: 'block' }}><strong>{err.field}:</strong> {err.message}</Text>)}
            </Box>
          )}
          {SECTIONS.map((s) => (
            <SectionWrapper key={s.key} sKey={s.key} label={s.key === 'location' ? 'Location & Work Arrangement' : s.key === 'compensation' ? 'Compensation & Benefits' : s.key === 'requirements' ? 'Requirements & Screening' : s.label} icon={<s.icon size={18} />}>
              {sectionRenderers[s.key]?.()}
            </SectionWrapper>
          ))}
        </Box>
      </Box>
    );
  },
});
