'use client';

/**
 * BhJobEditor - Wizard Preset
 * Multi-step wizard for creating and editing job postings
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createBadgeStyle, createCardStyle } from '../../../helpers';
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

const DEFAULT_STEPS: JobEditorStep[] = [
  { key: 'basics', label: 'Basics', isComplete: false, isActive: true, hasErrors: false },
  { key: 'description', label: 'Description', isComplete: false, isActive: false, hasErrors: false },
  { key: 'location', label: 'Location', isComplete: false, isActive: false, hasErrors: false },
  { key: 'compensation', label: 'Compensation', isComplete: false, isActive: false, hasErrors: false },
  { key: 'requirements', label: 'Requirements', isComplete: false, isActive: false, hasErrors: false },
  { key: 'configuration', label: 'Configuration', isComplete: false, isActive: false, hasErrors: false },
  { key: 'review', label: 'Review', isComplete: false, isActive: false, hasErrors: false },
];

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

function generateJobCode(title: string): string {
  if (!title) return '';
  const prefix = title.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() || '').join('').slice(0, 4);
  return `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const WizardBhJobEditor = createPreset<BhJobEditorProps>(
  'WizardBhJobEditor',
  ({ props, tokens }) => {
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { formData: formDataProp, steps: stepsProp, currentStep: currentStepProp, validationErrors: validationErrorsProp, onChange, onStepChange, onSave, onPublish, onPreview, isDirty: isDirtyProp, templates = [], clients = [], className, style } = props;

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
    const stepErrors = useCallback((s: string) => validationErrors.filter((e) => e.step === s), [validationErrors]);

    /* -- Styles ---------------------------------------------------- */

    const t = tokens;
    const bdr = `${t.surface.borderWidth} ${t.surface.borderStyle}`;
    const cardStyle = useMemo(() => createCardStyle(t, { glass: isGlass, elevation: 'sm', padding: t.spacing[6] }), [t]);
    const inputStyle: React.CSSProperties = { width: '100%', padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.normal, color: t.colors.neutral[900], backgroundColor: t.colors.common.white, border: `${bdr} ${t.colors.neutral[300]}`, borderRadius: t.borderRadius.md, outline: 'none', transition: `all ${t.motion.hover}`, boxSizing: 'border-box' };
    const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: `right ${t.spacing[3]}px center`, paddingRight: t.spacing[8] };
    const labelStyle: React.CSSProperties = { display: 'block', fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] };
    const fgStyle: React.CSSProperties = { marginBottom: t.spacing[5] };
    const primaryBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white, backgroundColor: t.colors.primaryScale[600], border: 'none', borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` };
    const secondaryBtn: React.CSSProperties = { ...primaryBtn, color: t.colors.neutral[700], backgroundColor: t.colors.common.white, border: `${bdr} ${t.colors.neutral[300]}` };
    const ghostBtn: React.CSSProperties = { ...primaryBtn, color: t.colors.neutral[600], backgroundColor: 'transparent', border: 'none' };
    const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 160, resize: 'vertical' as const, lineHeight: t.typography.lineHeight.relaxed, fontFamily: 'inherit' };
    const titleStyle: React.CSSProperties = { fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[4] };

    /* -- Sub-components -------------------------------------------- */

    const OptionBtn = ({ selected, label, onClick, scale, flexOne }: { selected: boolean; label: string; onClick: () => void; scale?: any; flexOne?: boolean }) => {
      const s = scale ?? t.colors.primaryScale;
      return (
        <button type="button" onClick={onClick} style={{ ...(flexOne ? { flex: 1 } : {}), padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: selected ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: selected ? s[700] : t.colors.neutral[600], backgroundColor: selected ? s[50] : t.colors.common.white, border: `${bdr} ${selected ? s[300] : t.colors.neutral[300]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}`, textAlign: 'center' as const }}>
          {label}
        </button>
      );
    };

    const Field = ({ fieldKey, label, children }: { fieldKey: string; label: string; children: React.ReactNode }) => {
      const errs = fieldErrors(fieldKey);
      return (
        <div style={fgStyle}>
          <label style={labelStyle}>{label}</label>
          {children}
          {errs.map((e, i) => <div key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], marginTop: t.spacing[1] }}>{e.message}</div>)}
        </div>
      );
    };

    const StepTitle = ({ icon: Icon, label }: { icon: typeof Briefcase; label: string }) => (
      <div style={titleStyle}><Icon size={18} style={{ marginRight: t.spacing[2], verticalAlign: 'middle', color: t.colors.primaryScale[500] }} />{label}</div>
    );

    const ToolbarEditor = ({ value, onChange: oc, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
      const tbBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', backgroundColor: 'transparent', color: t.colors.neutral[600], borderRadius: t.borderRadius.sm, cursor: 'pointer' };
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[300]}`, borderBottom: 'none', borderRadius: `${t.borderRadius.md} ${t.borderRadius.md} 0 0` }}>
            {[Bold, Italic, Underline].map((I, i) => <button key={i} type="button" style={tbBtn}><I size={14} /></button>)}
            <div style={{ width: 1, height: 20, backgroundColor: t.colors.neutral[300], margin: `0 ${t.spacing[1]}px` }} />
            {[List, ListOrdered, Link].map((I, i) => <button key={i} type="button" style={tbBtn}><I size={14} /></button>)}
            <div style={{ flex: 1 }} />
            <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[2]}px`, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.secondaryScale[700], backgroundColor: t.colors.secondaryScale[50], border: `${bdr} ${t.colors.secondaryScale[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer' }}>
              <Sparkles size={12} /> AI Assist
            </button>
          </div>
          <textarea style={{ ...textareaStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0 }} placeholder={placeholder} value={value} onChange={(e) => oc(e.target.value)} />
        </div>
      );
    };

    const SkillTag_ = ({ skill, idx }: { skill: SkillTag; idx: number }) => {
      const sc = (t.colors as any)[PROF_SCALES[skill.proficiency] ?? 'neutral'] ?? t.colors.neutral;
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[3]}px`, backgroundColor: sc[50], color: sc[700], border: `${bdr} ${sc[200]}`, borderRadius: t.borderRadius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
          <Tag size={10} />{skill.name}
          <span style={{ color: sc[500], marginLeft: t.spacing[1] }}>({skill.proficiency})</span>
          <button type="button" style={{ display: 'inline-flex', border: 'none', backgroundColor: 'transparent', color: sc[400], cursor: 'pointer', padding: 0, marginLeft: t.spacing[1] }} onClick={() => removeSkill(idx)}><X size={12} /></button>
        </div>
      );
    };

    const RadioCard = ({ selected, icon, label, description, onClick }: { selected: boolean; icon: React.ReactNode; label: string; description: string; onClick: () => void }) => (
      <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[4], backgroundColor: selected ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${selected ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.md, backgroundColor: selected ? t.colors.primaryScale[100] : t.colors.neutral[100], color: selected ? t.colors.primaryScale[600] : t.colors.neutral[500] }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: selected ? t.colors.primaryScale[700] : t.colors.neutral[800] }}>{label}</div>
          <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{description}</div>
        </div>
        <div style={{ width: 18, height: 18, borderRadius: t.borderRadius.full, border: `${bdr} ${selected ? t.colors.primaryScale[500] : t.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selected && <div style={{ width: 10, height: 10, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />}
        </div>
      </div>
    );

    const SalarySlider = () => {
      const min = formData.salaryMin ?? 0, max = formData.salaryMax ?? 0, W = 320, cap = 500000;
      const pMin = Math.min((min / cap) * 100, 100), pMax = Math.min((max / cap) * 100, 100);
      return (
        <svg width={W} height={40} style={{ display: 'block', margin: '0 auto' }} viewBox={`0 0 ${W} 40`}>
          <rect x={0} y={16} width={W} height={8} rx={4} fill={t.colors.neutral[200]} />
          <rect x={(pMin / 100) * W} y={16} width={Math.max(0, ((pMax - pMin) / 100) * W)} height={8} rx={4} fill={t.colors.primaryScale[400]} />
          {[pMin, pMax].map((p, i) => <circle key={i} cx={(p / 100) * W} cy={20} r={8} fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth={2} />)}
          {[[pMin, min], [pMax, max]].map(([p, v], i) => <text key={i} x={(p / 100) * W} y={10} textAnchor="middle" fill={t.colors.neutral[600]} fontSize={10} fontWeight={t.typography.fontWeight.medium}>{(v as number) > 0 ? `${((v as number) / 1000).toFixed(0)}k` : '0'}</text>)}
        </svg>
      );
    };

    /* -- Step renderers -------------------------------------------- */

    const stepRenderers: Record<string, () => React.ReactNode> = {
      basics: () => (
        <div style={cardStyle}>
          <StepTitle icon={Briefcase} label="Job Basics" />
          <Field fieldKey="title" label="Job Title *"><input type="text" style={inputStyle} placeholder="e.g. Senior Software Engineer" value={formData.title ?? ''} onChange={(e) => updateField('title', e.target.value)} /></Field>
          <Field fieldKey="code" label="Job Code">
            <div style={{ display: 'flex', gap: t.spacing[2] }}>
              <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="Auto-generated" value={formData.code ?? ''} onChange={(e) => updateField('code', e.target.value)} />
              <button type="button" style={secondaryBtn} onClick={() => updateField('code', generateJobCode(formData.title ?? ''))}>Generate</button>
            </div>
          </Field>
          <Field fieldKey="department" label="Department *"><select style={selectStyle} value={formData.department ?? ''} onChange={(e) => updateField('department', e.target.value)}><option value="">Select department...</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
          <Field fieldKey="seniority" label="Seniority Level *"><div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{SENIORITY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.seniority === o.value} label={o.label} onClick={() => updateField('seniority', o.value)} />)}</div></Field>
          <Field fieldKey="employmentType" label="Employment Type *"><div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{EMPLOYMENT_TYPES.map((o) => <OptionBtn key={o.value} selected={formData.employmentType === o.value} label={o.label} onClick={() => updateField('employmentType', o.value)} />)}</div></Field>
          <Field fieldKey="urgency" label="Urgency"><div style={{ display: 'flex', gap: t.spacing[2] }}>{URGENCY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.urgency === o.value} label={o.label} onClick={() => updateField('urgency', o.value)} scale={t.colors[o.scale]} flexOne />)}</div></Field>
        </div>
      ),

      description: () => (
        <div style={cardStyle}>
          <StepTitle icon={FileText} label="Job Description" />
          <Field fieldKey="description" label="Description *"><ToolbarEditor value={formData.description ?? ''} onChange={(v) => updateField('description', v)} placeholder="Describe the role, team, and what success looks like..." /></Field>
          <Field fieldKey="responsibilities" label="Key Responsibilities"><textarea style={textareaStyle} placeholder="List the main responsibilities for this role..." value={formData.responsibilities ?? ''} onChange={(e) => updateField('responsibilities', e.target.value)} /></Field>
          <Field fieldKey="requirements" label="Requirements"><textarea style={textareaStyle} placeholder="What are the must-have qualifications?" value={formData.requirements ?? ''} onChange={(e) => updateField('requirements', e.target.value)} /></Field>
        </div>
      ),

      location: () => (
        <div style={cardStyle}>
          <StepTitle icon={MapPin} label="Location & Work Arrangement" />
          <Field fieldKey="workArrangement" label="Work Arrangement *">
            <div style={{ display: 'flex', gap: t.spacing[3] }}>
              {ARRANGEMENT_OPTIONS.map((o) => {
                const sel = formData.workArrangement === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => updateField('workArrangement', o.value)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[4]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: sel ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <div style={{ color: sel ? t.colors.primaryScale[500] : t.colors.neutral[400] }}><o.icon size={16} /></div>{o.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field fieldKey="primaryLocation" label="Primary Location *"><input type="text" style={inputStyle} placeholder="e.g. San Francisco, CA" value={formData.primaryLocation ?? ''} onChange={(e) => updateField('primaryLocation', e.target.value)} /></Field>
          <Field fieldKey="secondaryLocation" label="Secondary Location"><input type="text" style={inputStyle} placeholder="e.g. New York, NY (optional)" value={formData.secondaryLocation ?? ''} onChange={(e) => updateField('secondaryLocation', e.target.value)} /></Field>
          <div style={{ height: 200, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm, marginTop: t.spacing[4] }}>
            <MapPin size={20} style={{ marginRight: t.spacing[2] }} />Map preview - {formData.primaryLocation || 'Enter a location above'}
          </div>
        </div>
      ),

      compensation: () => (
        <div style={cardStyle}>
          <StepTitle icon={DollarSign} label="Compensation & Benefits" />
          <Field fieldKey="currency" label="Currency"><select style={{ ...selectStyle, maxWidth: 160 }} value={formData.currency ?? 'USD'} onChange={(e) => updateField('currency', e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
          <div style={fgStyle}>
            <label style={labelStyle}>Salary Range</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3] }}>
              {(['salaryMin', 'salaryMax'] as const).map((k, i) => (
                <React.Fragment key={k}>
                  {i === 1 && <span style={{ color: t.colors.neutral[400], paddingTop: t.spacing[4] }}>&mdash;</span>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] }}>{i === 0 ? 'Minimum' : 'Maximum'}</div>
                    <input type="number" style={inputStyle} placeholder="0" value={formData[k] || ''} onChange={(e) => updateField(k, Number(e.target.value))} />
                  </div>
                </React.Fragment>
              ))}
            </div>
            <SalarySlider />
          </div>
          <div style={{ display: 'flex', gap: t.spacing[4] }}>
            <div style={{ flex: 1 }}><Field fieldKey="signingBonus" label="Signing Bonus"><input type="number" style={inputStyle} placeholder="0" value={formData.signingBonus || ''} onChange={(e) => updateField('signingBonus', Number(e.target.value))} /></Field></div>
            <div style={{ flex: 1 }}><Field fieldKey="equity" label="Equity"><input type="text" style={inputStyle} placeholder="e.g. 0.1% - 0.5%" value={formData.equity ?? ''} onChange={(e) => updateField('equity', e.target.value)} /></Field></div>
          </div>
          <div style={fgStyle}>
            <label style={labelStyle}>Benefits</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: t.spacing[2] }}>
              {BENEFITS_OPTIONS.map((b) => {
                const ch = (formData.benefits ?? []).includes(b);
                return (
                  <label key={b} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, color: ch ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: ch ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${ch ? t.colors.primaryScale[200] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.md, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <input type="checkbox" checked={ch} onChange={() => toggleBenefit(b)} style={{ accentColor: t.colors.primaryScale[600] }} />{b}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ),

      requirements: () => (
        <div style={cardStyle}>
          <StepTitle icon={ClipboardCheck} label="Requirements & Screening" />
          <div style={fgStyle}>
            <label style={labelStyle}>Skills</label>
            <div style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="Add a skill..." value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <select style={{ ...selectStyle, width: 140 }} value={newSkillProficiency} onChange={(e) => setNewSkillProficiency(e.target.value as SkillTag['proficiency'])}>{PROFICIENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              <button type="button" style={primaryBtn} onClick={addSkill}><Plus size={14} /> Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>{(formData.skills ?? []).map((s, i) => <SkillTag_ key={`${s.name}-${i}`} skill={s} idx={i} />)}</div>
          </div>
          <div style={{ display: 'flex', gap: t.spacing[4] }}>
            {(['experienceMin', 'experienceMax'] as const).map((k, i) => (
              <div key={k} style={{ flex: 1 }}><Field fieldKey={k} label={i === 0 ? 'Min. Experience (years)' : 'Max. Experience (years)'}><input type="number" style={inputStyle} min={0} placeholder="0" value={formData[k] || ''} onChange={(e) => updateField(k, Number(e.target.value))} /></Field></div>
            ))}
          </div>
          <Field fieldKey="educationLevel" label="Education Level"><select style={selectStyle} value={formData.educationLevel ?? ''} onChange={(e) => updateField('educationLevel', e.target.value)}><option value="">Select education level...</option>{EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></Field>
          <div style={fgStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Screening Questions</label>
              <button type="button" style={{ ...secondaryBtn, padding: `${t.spacing[1]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.xs }} onClick={addSQ}><Plus size={12} /> Add Question</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
              {(formData.screeningQuestions ?? []).map((q, idx) => (
                <div key={q.id} style={{ padding: t.spacing[4], backgroundColor: t.colors.neutral[50], border: `${bdr} ${t.colors.neutral[200]}`, borderRadius: t.borderRadius.md }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3] }}>
                    <div style={{ color: t.colors.neutral[400], paddingTop: t.spacing[2] }}><GripVertical size={14} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                        <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder={`Question ${idx + 1}...`} value={q.question} onChange={(e) => updateSQ(q.id, 'question', e.target.value)} />
                        <select style={{ ...selectStyle, width: 120 }} value={q.type} onChange={(e) => updateSQ(q.id, 'type', e.target.value)}><option value="text">Text</option><option value="boolean">Yes/No</option><option value="choice">Choice</option></select>
                      </div>
                      {q.type === 'choice' && <input type="text" style={{ ...inputStyle, marginBottom: t.spacing[2] }} placeholder="Options (comma-separated)" value={(q.options ?? []).join(', ')} onChange={(e) => updateSQ(q.id, 'options', e.target.value.split(',').map((s) => s.trim()))} />}
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], cursor: 'pointer' }}>
                        <input type="checkbox" checked={q.required} onChange={(e) => updateSQ(q.id, 'required', e.target.checked)} style={{ accentColor: t.colors.primaryScale[600] }} />Required
                      </label>
                    </div>
                    <button type="button" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', backgroundColor: 'transparent', color: t.colors.errorScale[400], borderRadius: t.borderRadius.sm, cursor: 'pointer' }} onClick={() => removeSQ(q.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {(formData.screeningQuestions ?? []).length === 0 && (
                <div style={{ padding: `${t.spacing[6]}px ${t.spacing[4]}px`, textAlign: 'center' as const, color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm, backgroundColor: t.colors.neutral[50], borderRadius: t.borderRadius.md, border: `${t.surface.borderWidth} dashed ${t.colors.neutral[300]}` }}>
                  <HelpCircle size={24} style={{ marginBottom: t.spacing[2] }} /><div>No screening questions added yet</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),

      configuration: () => (
        <div style={cardStyle}>
          <StepTitle icon={Settings} label="Configuration" />
          <div style={fgStyle}>
            <label style={labelStyle}>Visibility *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {VISIBILITY_OPTIONS.map((o) => <RadioCard key={o.value} selected={(formData.visibility ?? 'public') === o.value} icon={<o.icon size={18} />} label={o.label} description={o.description} onClick={() => updateField('visibility', o.value)} />)}
            </div>
          </div>
          <Field fieldKey="openings" label="Number of Openings"><input type="number" style={{ ...inputStyle, maxWidth: 120 }} min={1} value={formData.openings ?? 1} onChange={(e) => updateField('openings', Number(e.target.value))} /></Field>
          {templates.length > 0 && <Field fieldKey="templateId" label="Job Template"><select style={selectStyle} value={formData.templateId ?? ''} onChange={(e) => { updateField('templateId', e.target.value); setSelectedTemplate(e.target.value); }}><option value="">None - Start from scratch</option>{templates.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}</select></Field>}
          {clients.length > 0 && <Field fieldKey="clientId" label="Client Association"><select style={selectStyle} value={formData.clientId ?? ''} onChange={(e) => updateField('clientId', e.target.value)}><option value="">No client association</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
        </div>
      ),

      review: () => {
        const rvLbl: React.CSSProperties = { fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginBottom: t.spacing[1] };
        const rvVal: React.CSSProperties = { fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800] };
        const pair = (label: string, value: string | number | undefined) => (
          <div style={{ marginBottom: t.spacing[3] }}><div style={rvLbl}>{label}</div><div style={rvVal}>{value || 'Not specified'}</div></div>
        );

        const reviewContent: Record<string, React.ReactNode> = {
          basics: <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Job Title', formData.title)}{pair('Job Code', formData.code)}{pair('Department', formData.department)}{pair('Seniority', formData.seniority)}{pair('Employment Type', formData.employmentType)}{pair('Urgency', formData.urgency)}</div>,
          description: <div>{pair('Description', formData.description)}{pair('Responsibilities', formData.responsibilities)}{pair('Requirements', formData.requirements)}</div>,
          location: <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Work Arrangement', formData.workArrangement)}{pair('Primary Location', formData.primaryLocation)}{pair('Secondary Location', formData.secondaryLocation)}</div>,
          compensation: (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
              {pair('Salary Range', (formData.salaryMin || formData.salaryMax) ? `${formData.currency ?? 'USD'} ${(formData.salaryMin ?? 0).toLocaleString()} - ${(formData.salaryMax ?? 0).toLocaleString()}` : undefined)}
              {pair('Signing Bonus', formData.signingBonus ? `${formData.currency ?? 'USD'} ${formData.signingBonus.toLocaleString()}` : undefined)}
              {pair('Equity', formData.equity)}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={rvLbl}>Benefits</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
                  {(formData.benefits ?? []).length > 0 ? (formData.benefits ?? []).map((b) => <span key={b} style={createBadgeStyle(t, 'primary')}>{b}</span>) : <span style={rvVal}>None specified</span>}
                </div>
              </div>
            </div>
          ),
          requirements: (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>
                {pair('Experience', (formData.experienceMin || formData.experienceMax) ? `${formData.experienceMin ?? 0} - ${formData.experienceMax ?? 0} years` : undefined)}
                {pair('Education', formData.educationLevel)}
              </div>
              <div style={{ marginTop: t.spacing[2] }}><div style={rvLbl}>Skills</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>{(formData.skills ?? []).length > 0 ? (formData.skills ?? []).map((s, i) => <span key={i} style={createBadgeStyle(t, 'info')}>{s.name} ({s.proficiency})</span>) : <span style={rvVal}>None specified</span>}</div></div>
              <div style={{ marginTop: t.spacing[2] }}><div style={rvLbl}>Screening Questions</div>{(formData.screeningQuestions ?? []).length > 0 ? (formData.screeningQuestions ?? []).map((q, i) => <div key={q.id} style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], padding: `${t.spacing[1]}px 0` }}>{i + 1}. {q.question || 'Untitled'} ({q.type}){q.required ? ' *' : ''}</div>) : <span style={rvVal}>None</span>}</div>
            </div>
          ),
          configuration: <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[3] }}>{pair('Visibility', formData.visibility)}{pair('Openings', formData.openings)}{pair('Template', templates.find((tp) => tp.id === formData.templateId)?.name)}{pair('Client', clients.find((c) => c.id === formData.clientId)?.name)}</div>,
        };

        return (
          <div style={cardStyle}>
            <StepTitle icon={ClipboardCheck} label="Review Job Posting" />
            {validationErrors.length > 0 && (
              <div style={{ padding: t.spacing[4], backgroundColor: t.colors.errorScale[50], border: `${bdr} ${t.colors.errorScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[4] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.errorScale[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, marginBottom: t.spacing[2] }}><AlertCircle size={16} />{validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''} found</div>
                {validationErrors.map((err, i) => <div key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], padding: `${t.spacing[1]}px 0`, paddingLeft: t.spacing[6] }}><strong>{err.field}:</strong> {err.message}</div>)}
              </div>
            )}
            {REVIEW_SECTIONS.map(({ key, label, icon: Icon }) => {
              const isOpen = expandedReviewSections[key] ?? true;
              const hasErr = stepErrors(key).length > 0;
              return (
                <div key={key} style={{ borderBottom: `${bdr} ${t.colors.neutral[200]}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[3]}px 0`, cursor: 'pointer' }} onClick={() => setExpandedReviewSections((p) => ({ ...p, [key]: !p[key] }))}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <span style={{ color: hasErr ? t.colors.errorScale[500] : t.colors.primaryScale[500] }}><Icon size={16} /></span>
                      <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{label}</span>
                      {hasErr && <span style={createBadgeStyle(t, 'error')}>{stepErrors(key).length} error{stepErrors(key).length > 1 ? 's' : ''}</span>}
                    </div>
                    {isOpen ? <ChevronUp size={16} color={t.colors.neutral[400]} /> : <ChevronDown size={16} color={t.colors.neutral[400]} />}
                  </div>
                  {isOpen && <div style={{ paddingBottom: t.spacing[4] }}>{reviewContent[key]}</div>}
                </div>
              );
            })}
          </div>
        );
      },
    };

    /* -- Step indicator -------------------------------------------- */

    const renderStepIndicator = () => {
      const sw = 100 / steps.length;
      return (
        <div style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, backgroundColor: t.colors.common.white, borderBottom: `${bdr} ${t.colors.neutral[200]}` }}>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <svg style={{ position: 'absolute', top: '50%', left: `${sw / 2}%`, width: `${100 - sw}%`, height: 2, transform: 'translateY(-50%)' }}>
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
                <div key={step.key} onClick={() => goToStep(step.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: circleBg, border: `${bdr} ${circleColor}`, color: circleColor, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, transition: `all ${t.motion.hover}`, boxShadow: isActive ? `0 0 0 4px ${t.colors.primaryScale[100]}` : 'none' }}>
                    {hasErr ? <AlertCircle size={14} /> : isCompleted ? <Check size={14} /> : idx + 1}
                  </div>
                  <span style={{ marginTop: t.spacing[1], fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : hasErr ? t.colors.errorScale[600] : t.colors.neutral[500] }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* -- Sidebar --------------------------------------------------- */

    const renderSidebar = () => {
      const sc = isDirty ? t.colors.warningScale : t.colors.successScale;
      return (
        <div style={{ width: 280, borderLeft: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, padding: t.spacing[5], display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: t.spacing[3], backgroundColor: sc[50], border: `${bdr} ${sc[200]}`, borderRadius: t.borderRadius.md }}>
            <div style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: sc[500] }} />
            <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: sc[700] }}>{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
          </div>
          <div>
            <div style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], marginBottom: t.spacing[2] }}>Progress</div>
            <div style={{ height: 6, backgroundColor: t.colors.neutral[200], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((stepIdx + 1) / steps.length) * 100}%`, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full, transition: `width ${t.transitions?.normal || t.motion.hover}` }} />
            </div>
            <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>Step {stepIdx + 1} of {steps.length}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
            {steps.map((step, idx) => {
              const isActive = step.key === currentStep;
              const isCompleted = step.isComplete || idx < stepIdx;
              return (
                <div key={step.key} onClick={() => goToStep(step.key)} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent', cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  {step.hasErrors ? <AlertCircle size={14} color={t.colors.errorScale[500]} /> : isCompleted ? <Check size={14} color={t.colors.successScale[500]} /> : <div style={{ width: 14, height: 14, borderRadius: t.borderRadius.full, border: `1.5px solid ${isActive ? t.colors.primaryScale[500] : t.colors.neutral[300]}` }} />}
                  <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : step.hasErrors ? t.colors.errorScale[600] : t.colors.neutral[600] }}>{step.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            <button type="button" style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }} onClick={handleSave}><Save size={14} /> Save Draft</button>
            <button type="button" style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }} onClick={handlePreview}><Eye size={14} /> Preview</button>
            <button type="button" style={{ ...primaryBtn, width: '100%', justifyContent: 'center', backgroundColor: t.colors.successScale[600] }} onClick={handlePublish}><Send size={14} /> Publish Job</button>
          </div>
        </div>
      );
    };

    /* -- Main render ----------------------------------------------- */

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: t.colors.neutral[50], fontFamily: 'inherit', ...style }} className={className}>
        {renderStepIndicator()}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: t.spacing[6] }}>{stepRenderers[currentStep]?.() ?? stepRenderers.basics?.()}</div>
          {renderSidebar()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${t.spacing[4]}px ${t.spacing[6]}px`, borderTop: `${bdr} ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white }}>
          <button type="button" style={{ ...ghostBtn, visibility: stepIdx === 0 ? 'hidden' : 'visible' }} onClick={goPrev}><ChevronLeft size={16} /> Previous</button>
          <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{steps[stepIdx]?.label}</div>
          {stepIdx < steps.length - 1 ? (
            <button type="button" style={primaryBtn} onClick={goNext}>Next <ChevronRight size={16} /></button>
          ) : (
            <button type="button" style={{ ...primaryBtn, backgroundColor: t.colors.successScale[600] }} onClick={handlePublish}><Send size={14} /> Publish</button>
          )}
        </div>
      </div>
    );
  },
);
