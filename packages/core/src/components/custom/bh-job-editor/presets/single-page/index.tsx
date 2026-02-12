'use client';

/**
 * BhJobEditor - Single Page Preset
 * All job creation sections on one scrollable page with anchor navigation
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { createPreset } from '../../../factory';
import { createBadgeStyle, createCardStyle } from '../../../helpers';
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

export const SinglePageBhJobEditor = createPreset<BhJobEditorProps>(
  'SinglePageBhJobEditor',
  ({ props, tokens }) => {
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { formData: formDataProp, validationErrors: validationErrorsProp, onChange, onSave, onPublish, onPreview, isDirty: isDirtyProp, templates = [], clients = [], className, style } = props;

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
    const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 120, resize: 'vertical' as const, lineHeight: t.typography.lineHeight.relaxed, fontFamily: 'inherit' };

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

    const SectionWrapper = ({ sKey, label, icon, children }: { sKey: string; label: string; icon: React.ReactNode; children: React.ReactNode }) => {
      const isCollapsed = collapsedSections[sKey] ?? false;
      const errs = sectionErrors(sKey);
      return (
        <div ref={(el) => { sectionRefs.current[sKey] = el; }} style={{ ...cardStyle, marginBottom: t.spacing[5] }} id={`section-${sKey}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: `all ${t.motion.hover}`, marginBottom: t.spacing[4] }} onClick={() => setCollapsedSections((p) => ({ ...p, [sKey]: !p[sKey] }))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
              <span style={{ color: t.colors.primaryScale[500] }}>{icon}</span>
              {label}
              {errs.length > 0 && <span style={createBadgeStyle(t, 'error')}>{errs.length} error{errs.length > 1 ? 's' : ''}</span>}
            </div>
            {isCollapsed ? <ChevronDown size={18} color={t.colors.neutral[400]} /> : <ChevronUp size={18} color={t.colors.neutral[400]} />}
          </div>
          {!isCollapsed && children}
        </div>
      );
    };

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

    /* -- Salary SVG Slider ----------------------------------------- */

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

    /* -- Section renderers ----------------------------------------- */

    const sectionRenderers: Record<string, () => React.ReactNode> = {
      basics: () => (
        <>
          <Field fieldKey="title" label="Job Title *"><input type="text" style={inputStyle} placeholder="e.g. Senior Software Engineer" value={formData.title ?? ''} onChange={(e) => updateField('title', e.target.value)} /></Field>
          <Field fieldKey="code" label="Job Code">
            <div style={{ display: 'flex', gap: t.spacing[2] }}>
              <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="Auto-generated" value={formData.code ?? ''} onChange={(e) => updateField('code', e.target.value)} />
              <button type="button" style={secondaryBtn} onClick={() => updateField('code', generateJobCode(formData.title ?? ''))}>Generate</button>
            </div>
          </Field>
          <Field fieldKey="department" label="Department *">
            <select style={selectStyle} value={formData.department ?? ''} onChange={(e) => updateField('department', e.target.value)}>
              <option value="">Select department...</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field fieldKey="seniority" label="Seniority Level *">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {SENIORITY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.seniority === o.value} label={o.label} onClick={() => updateField('seniority', o.value)} />)}
            </div>
          </Field>
          <Field fieldKey="employmentType" label="Employment Type *">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {EMPLOYMENT_TYPES.map((o) => <OptionBtn key={o.value} selected={formData.employmentType === o.value} label={o.label} onClick={() => updateField('employmentType', o.value)} />)}
            </div>
          </Field>
          <Field fieldKey="urgency" label="Urgency">
            <div style={{ display: 'flex', gap: t.spacing[2] }}>
              {URGENCY_OPTIONS.map((o) => <OptionBtn key={o.value} selected={formData.urgency === o.value} label={o.label} onClick={() => updateField('urgency', o.value)} scale={t.colors[o.scale]} flexOne />)}
            </div>
          </Field>
        </>
      ),

      description: () => (
        <>
          <Field fieldKey="description" label="Description *"><ToolbarEditor value={formData.description ?? ''} onChange={(v) => updateField('description', v)} placeholder="Describe the role, team, and what success looks like..." /></Field>
          <Field fieldKey="responsibilities" label="Key Responsibilities"><textarea style={textareaStyle} placeholder="List the main responsibilities..." value={formData.responsibilities ?? ''} onChange={(e) => updateField('responsibilities', e.target.value)} /></Field>
          <Field fieldKey="requirements" label="Requirements"><textarea style={textareaStyle} placeholder="Must-have qualifications..." value={formData.requirements ?? ''} onChange={(e) => updateField('requirements', e.target.value)} /></Field>
        </>
      ),

      location: () => (
        <>
          <Field fieldKey="workArrangement" label="Work Arrangement *">
            <div style={{ display: 'flex', gap: t.spacing[3] }}>
              {ARRANGEMENT_OPTIONS.map((o) => {
                const sel = formData.workArrangement === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => updateField('workArrangement', o.value)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[4]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.sm, fontWeight: sel ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: sel ? t.colors.primaryScale[700] : t.colors.neutral[600], backgroundColor: sel ? t.colors.primaryScale[50] : t.colors.common.white, border: `${bdr} ${sel ? t.colors.primaryScale[400] : t.colors.neutral[200]}`, borderRadius: t.borderRadius.lg, cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                    <div style={{ color: sel ? t.colors.primaryScale[500] : t.colors.neutral[400] }}><o.icon size={16} /></div>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field fieldKey="primaryLocation" label="Primary Location *"><input type="text" style={inputStyle} placeholder="e.g. San Francisco, CA" value={formData.primaryLocation ?? ''} onChange={(e) => updateField('primaryLocation', e.target.value)} /></Field>
          <Field fieldKey="secondaryLocation" label="Secondary Location"><input type="text" style={inputStyle} placeholder="e.g. New York, NY (optional)" value={formData.secondaryLocation ?? ''} onChange={(e) => updateField('secondaryLocation', e.target.value)} /></Field>
          <div style={{ height: 160, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.lg, border: `${bdr} ${t.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>
            <MapPin size={20} style={{ marginRight: t.spacing[2] }} />Map preview - {formData.primaryLocation || 'Enter a location above'}
          </div>
        </>
      ),

      compensation: () => (
        <>
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
        </>
      ),

      requirements: () => (
        <>
          <div style={fgStyle}>
            <label style={labelStyle}>Skills</label>
            <div style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
              <input type="text" style={{ ...inputStyle, flex: 1 }} placeholder="Add a skill..." value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <select style={{ ...selectStyle, width: 140 }} value={newSkillProficiency} onChange={(e) => setNewSkillProficiency(e.target.value as SkillTag['proficiency'])}>{PROFICIENCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              <button type="button" style={primaryBtn} onClick={addSkill}><Plus size={14} /> Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {(formData.skills ?? []).map((s, i) => <SkillTag_ key={`${s.name}-${i}`} skill={s} idx={i} />)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: t.spacing[4] }}>
            {(['experienceMin', 'experienceMax'] as const).map((k, i) => (
              <div key={k} style={{ flex: 1 }}><Field fieldKey={k} label={i === 0 ? 'Min. Experience (years)' : 'Max. Experience (years)'}><input type="number" style={inputStyle} min={0} placeholder="0" value={formData[k] || ''} onChange={(e) => updateField(k, Number(e.target.value))} /></Field></div>
            ))}
          </div>
          <Field fieldKey="educationLevel" label="Education Level">
            <select style={selectStyle} value={formData.educationLevel ?? ''} onChange={(e) => updateField('educationLevel', e.target.value)}>
              <option value="">Select education level...</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <div style={fgStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Screening Questions</label>
              <button type="button" style={{ ...secondaryBtn, padding: `${t.spacing[1]}px ${t.spacing[3]}px`, fontSize: t.typography.fontSize.xs }} onClick={addScreeningQuestion}><Plus size={12} /> Add Question</button>
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
        </>
      ),

      configuration: () => (
        <>
          <div style={fgStyle}>
            <label style={labelStyle}>Visibility *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {VISIBILITY_OPTIONS.map((o) => <RadioCard key={o.value} selected={(formData.visibility ?? 'public') === o.value} icon={<o.icon size={18} />} label={o.label} description={o.description} onClick={() => updateField('visibility', o.value)} />)}
            </div>
          </div>
          <Field fieldKey="openings" label="Number of Openings"><input type="number" style={{ ...inputStyle, maxWidth: 120 }} min={1} value={formData.openings ?? 1} onChange={(e) => updateField('openings', Number(e.target.value))} /></Field>
          {templates.length > 0 && <Field fieldKey="templateId" label="Job Template"><select style={selectStyle} value={formData.templateId ?? ''} onChange={(e) => updateField('templateId', e.target.value)}><option value="">None - Start from scratch</option>{templates.map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}</select></Field>}
          {clients.length > 0 && <Field fieldKey="clientId" label="Client Association"><select style={selectStyle} value={formData.clientId ?? ''} onChange={(e) => updateField('clientId', e.target.value)}><option value="">No client association</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
        </>
      ),
    };

    /* -- Main render ----------------------------------------------- */

    return (
      <div style={{ display: 'flex', height: '100%', backgroundColor: t.colors.neutral[50], fontFamily: 'inherit', ...style }} className={className}>
        {/* Nav sidebar */}
        <div style={{ width: 220, backgroundColor: t.colors.common.white, borderRight: `${bdr} ${t.colors.neutral[200]}`, padding: t.spacing[4], display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100%', overflow: 'auto' }}>
          <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800], marginBottom: t.spacing[4], padding: `0 ${t.spacing[2]}px` }}>Sections</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
            {SECTIONS.map((s) => {
              const Icon = s.icon, isActive = activeSection === s.key, hasErr = sectionErrors(s.key).length > 0;
              return (
                <div key={s.key} onClick={() => scrollToSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent', borderLeft: isActive ? `3px solid ${t.colors.primaryScale[500]}` : '3px solid transparent', cursor: 'pointer', transition: `all ${t.motion.hover}` }}>
                  {hasErr ? <AlertCircle size={14} color={t.colors.errorScale[500]} /> : <Icon size={14} color={isActive ? t.colors.primaryScale[600] : t.colors.neutral[400]} />}
                  <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.normal, color: isActive ? t.colors.primaryScale[700] : hasErr ? t.colors.errorScale[600] : t.colors.neutral[600] }}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: t.spacing[3], backgroundColor: isDirty ? t.colors.warningScale[50] : t.colors.successScale[50], border: `${bdr} ${isDirty ? t.colors.warningScale[200] : t.colors.successScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[3] }}>
            <div style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: isDirty ? t.colors.warningScale[500] : t.colors.successScale[500] }} />
            <span style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: isDirty ? t.colors.warningScale[700] : t.colors.successScale[700] }}>{isDirty ? 'Unsaved' : 'Saved'}</span>
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            <button type="button" style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }} onClick={handleSave}><Save size={14} /> Save Draft</button>
            <button type="button" style={{ ...secondaryBtn, width: '100%', justifyContent: 'center' }} onClick={handlePreview}><Eye size={14} /> Preview</button>
            <button type="button" style={{ ...primaryBtn, width: '100%', justifyContent: 'center', backgroundColor: t.colors.successScale[600] }} onClick={handlePublish}><Send size={14} /> Publish</button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', padding: t.spacing[6] }}>
          {validationErrors.length > 0 && (
            <div style={{ padding: t.spacing[4], backgroundColor: t.colors.errorScale[50], border: `${bdr} ${t.colors.errorScale[200]}`, borderRadius: t.borderRadius.md, marginBottom: t.spacing[5] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], color: t.colors.errorScale[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, marginBottom: t.spacing[2] }}>
                <AlertCircle size={16} />{validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''} found
              </div>
              {validationErrors.map((err, i) => <div key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[600], padding: `${t.spacing[1]}px 0`, paddingLeft: t.spacing[6] }}><strong>{err.field}:</strong> {err.message}</div>)}
            </div>
          )}
          {SECTIONS.map((s) => (
            <SectionWrapper key={s.key} sKey={s.key} label={s.key === 'location' ? 'Location & Work Arrangement' : s.key === 'compensation' ? 'Compensation & Benefits' : s.key === 'requirements' ? 'Requirements & Screening' : s.label} icon={<s.icon size={18} />}>
              {sectionRenderers[s.key]?.()}
            </SectionWrapper>
          ))}
        </div>
      </div>
    );
  },
);
