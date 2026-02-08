'use client';

/**
 * BhJobEditor - Single Page Preset
 * All job creation sections on one scrollable page with anchor navigation
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { BhJobEditorProps } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import type {
  JobFormData,
  SkillTag,
  ScreeningQuestion,
  ValidationError,
  WorkArrangement,
} from '../../core';
import { BH_JOB_EDITOR_DEFAULTS } from '../../core';
import {
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  Send,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  MapPin,
  DollarSign,
  Plus,
  X,
  Trash2,
  GripVertical,
  Briefcase,
  FileText,
  Building2,
  Users,
  Settings,
  ClipboardCheck,
  Globe,
  Lock,
  ShieldAlert,
  GraduationCap,
  Tag,
  HelpCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Legal', 'Customer Success'];
const SENIORITY_OPTIONS = [
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive' },
];
const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];
const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'info' as const },
  { value: 'medium', label: 'Medium', color: 'warning' as const },
  { value: 'high', label: 'High', color: 'error' as const },
  { value: 'critical', label: 'Critical', color: 'error' as const },
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR'];
const BENEFITS_OPTIONS = [
  'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k) Match',
  'Unlimited PTO', 'Remote Work', 'Gym Membership', 'Learning Budget',
  'Stock Options', 'Parental Leave', 'Commuter Benefits', 'Meal Allowance',
];
const EDUCATION_LEVELS = ['High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD', 'No Requirement'];
const PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const SECTIONS = [
  { key: 'basics', label: 'Basics', icon: Briefcase },
  { key: 'description', label: 'Description', icon: FileText },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'compensation', label: 'Compensation', icon: DollarSign },
  { key: 'requirements', label: 'Requirements', icon: ClipboardCheck },
  { key: 'configuration', label: 'Configuration', icon: Settings },
];

function generateJobCode(title: string): string {
  if (!title) return '';
  const words = title.trim().split(/\s+/);
  const prefix = words.map((w) => w[0]?.toUpperCase() || '').join('').slice(0, 4);
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const SinglePageBhJobEditor = createPreset<BhJobEditorProps>(
  'SinglePageBhJobEditor',
  ({ props, tokens, engine }) => {
    const isGlass = engine === 'modern' && !!tokens.glass;
    const {
      formData: formDataProp,
      validationErrors: validationErrorsProp,
      onChange,
      onSave,
      onPublish,
      onPreview,
      isDirty: isDirtyProp,
      templates = [],
      clients = [],
      className,
      style,
    } = props;

    /* ---------------------------------------------------------------- */
    /*  State                                                            */
    /* ---------------------------------------------------------------- */

    const defaultForm = BH_JOB_EDITOR_DEFAULTS.formData as JobFormData;

    const [internalFormData, setInternalFormData] = useState<Partial<JobFormData>>(
      formDataProp ?? defaultForm,
    );
    const [internalErrors, setInternalErrors] = useState<ValidationError[]>(validationErrorsProp ?? []);
    const [internalDirty, setInternalDirty] = useState<boolean>(isDirtyProp ?? false);
    const [activeSection, setActiveSection] = useState<string>('basics');
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillProficiency, setNewSkillProficiency] = useState<SkillTag['proficiency']>('intermediate');
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const formData = formDataProp ?? internalFormData;
    const validationErrors = validationErrorsProp ?? internalErrors;
    const isDirty = isDirtyProp ?? internalDirty;

    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    /* ---------------------------------------------------------------- */
    /*  Handlers                                                         */
    /* ---------------------------------------------------------------- */

    const updateField = useCallback(
      (field: keyof JobFormData, value: unknown) => {
        const updated = { ...formData, [field]: value };
        if (field === 'title' && !formData.code) {
          updated.code = generateJobCode(value as string);
        }
        setInternalFormData(updated);
        setInternalDirty(true);
        onChange?.(updated);
      },
      [formData, onChange],
    );

    const handleSave = useCallback(() => {
      onSave?.(formData);
      setInternalDirty(false);
    }, [formData, onSave]);

    const handlePublish = useCallback(() => {
      onPublish?.(formData);
    }, [formData, onPublish]);

    const handlePreview = useCallback(() => {
      onPreview?.(formData);
    }, [formData, onPreview]);

    const scrollToSection = useCallback((key: string) => {
      setActiveSection(key);
      const el = sectionRefs.current[key];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, []);

    const toggleSection = useCallback((key: string) => {
      setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const addSkill = useCallback(() => {
      if (!newSkillName.trim()) return;
      const skill: SkillTag = { name: newSkillName.trim(), proficiency: newSkillProficiency };
      updateField('skills', [...(formData.skills ?? []), skill]);
      setNewSkillName('');
    }, [newSkillName, newSkillProficiency, formData.skills, updateField]);

    const removeSkill = useCallback(
      (index: number) => {
        const updated = [...(formData.skills ?? [])];
        updated.splice(index, 1);
        updateField('skills', updated);
      },
      [formData.skills, updateField],
    );

    const addScreeningQuestion = useCallback(() => {
      const q: ScreeningQuestion = {
        id: `sq-${Date.now()}`,
        question: '',
        type: 'text',
        required: false,
      };
      updateField('screeningQuestions', [...(formData.screeningQuestions ?? []), q]);
    }, [formData.screeningQuestions, updateField]);

    const updateScreeningQuestion = useCallback(
      (id: string, field: keyof ScreeningQuestion, value: unknown) => {
        const updated = (formData.screeningQuestions ?? []).map((q) =>
          q.id === id ? { ...q, [field]: value } : q,
        );
        updateField('screeningQuestions', updated);
      },
      [formData.screeningQuestions, updateField],
    );

    const removeScreeningQuestion = useCallback(
      (id: string) => {
        updateField('screeningQuestions', (formData.screeningQuestions ?? []).filter((q) => q.id !== id));
      },
      [formData.screeningQuestions, updateField],
    );

    const toggleBenefit = useCallback(
      (benefit: string) => {
        const current = formData.benefits ?? [];
        const updated = current.includes(benefit)
          ? current.filter((b) => b !== benefit)
          : [...current, benefit];
        updateField('benefits', updated);
      },
      [formData.benefits, updateField],
    );

    const getFieldErrors = useCallback(
      (field: string) => validationErrors.filter((e) => e.field === field),
      [validationErrors],
    );

    const getSectionErrors = useCallback(
      (sectionKey: string) => validationErrors.filter((e) => e.step === sectionKey),
      [validationErrors],
    );

    /* ---------------------------------------------------------------- */
    /*  Styles                                                           */
    /* ---------------------------------------------------------------- */

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      height: '100%',
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: 'inherit',
      ...style,
    };

    const navStyle: React.CSSProperties = {
      width: 220,
      backgroundColor: tokens.colors.common.white,
      borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      padding: tokens.spacing[4],
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky' as const,
      top: 0,
      height: '100%',
      overflow: 'auto',
    };

    const mainStyle: React.CSSProperties = {
      flex: 1,
      overflow: 'auto',
      padding: tokens.spacing[6],
    };

    const cardStyle = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: 'sm', padding: tokens.spacing[6] }), [tokens]);

    const inputStyle: React.CSSProperties = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.normal,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
      borderRadius: tokens.borderRadius.md,
      outline: 'none',
      transition: `all ${tokens.motion.hover}`,
      boxSizing: 'border-box' as const,
    };

    const selectStyle: React.CSSProperties = {
      ...inputStyle,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `right ${tokens.spacing[3]}px center`,
      paddingRight: tokens.spacing[8],
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: tokens.spacing[1],
    };

    const fieldGroupStyle: React.CSSProperties = {
      marginBottom: tokens.spacing[5],
    };

    const errorTextStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.errorScale[600],
      marginTop: tokens.spacing[1],
    };

    const sectionHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
      marginBottom: tokens.spacing[4],
    };

    const sectionTitleStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
    };

    const primaryBtnStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.common.white,
      backgroundColor: tokens.colors.primaryScale[600],
      border: 'none',
      borderRadius: tokens.borderRadius.md,
      cursor: 'pointer',
      transition: `all ${tokens.motion.hover}`,
    };

    const secondaryBtnStyle: React.CSSProperties = {
      ...primaryBtnStyle,
      color: tokens.colors.neutral[700],
      backgroundColor: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
    };

    const textareaStyle: React.CSSProperties = {
      ...inputStyle,
      minHeight: 120,
      resize: 'vertical' as const,
      lineHeight: tokens.typography.lineHeight.relaxed,
      fontFamily: 'inherit',
    };

    /* ---------------------------------------------------------------- */
    /*  Helpers                                                          */
    /* ---------------------------------------------------------------- */

    const renderField = (
      fieldKey: keyof JobFormData,
      label: string,
      element: React.ReactNode,
    ) => {
      const errors = getFieldErrors(fieldKey);
      return (
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>{label}</label>
          {element}
          {errors.map((err, i) => (
            <div key={i} style={errorTextStyle}>{err.message}</div>
          ))}
        </div>
      );
    };

    const renderSectionWrapper = (
      key: string,
      label: string,
      icon: React.ReactNode,
      content: React.ReactNode,
    ) => {
      const isCollapsed = collapsedSections[key] ?? false;
      const sectionErrors = getSectionErrors(key);

      return (
        <div
          key={key}
          ref={(el) => { sectionRefs.current[key] = el; }}
          style={{
            ...cardStyle,
            marginBottom: tokens.spacing[5],
          }}
          id={`section-${key}`}
        >
          <div style={sectionHeaderStyle} onClick={() => toggleSection(key)}>
            <div style={sectionTitleStyle}>
              <span style={{ color: tokens.colors.primaryScale[500] }}>{icon}</span>
              {label}
              {sectionErrors.length > 0 && (
                <span style={createBadgeStyle(tokens, 'error')}>
                  {sectionErrors.length} error{sectionErrors.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {isCollapsed
              ? <ChevronDown size={18} color={tokens.colors.neutral[400]} />
              : <ChevronUp size={18} color={tokens.colors.neutral[400]} />
            }
          </div>
          {!isCollapsed && content}
        </div>
      );
    };

    /* ================================================================ */
    /*  ANCHOR NAVIGATION                                                */
    /* ================================================================ */

    const renderNav = () => (
      <div style={navStyle}>
        <div
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[800],
            marginBottom: tokens.spacing[4],
            padding: `0 ${tokens.spacing[2]}px`,
          }}
        >
          Sections
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            const hasErrors = getSectionErrors(section.key).length > 0;

            return (
              <div
                key={section.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                  borderLeft: isActive
                    ? `3px solid ${tokens.colors.primaryScale[500]}`
                    : '3px solid transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => scrollToSection(section.key)}
              >
                {hasErrors ? (
                  <AlertCircle size={14} color={tokens.colors.errorScale[500]} />
                ) : (
                  <Icon size={14} color={isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400]} />
                )}
                <span
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: isActive
                      ? tokens.typography.fontWeight.semibold
                      : tokens.typography.fontWeight.normal,
                    color: isActive
                      ? tokens.colors.primaryScale[700]
                      : hasErrors
                        ? tokens.colors.errorScale[600]
                        : tokens.colors.neutral[600],
                  }}
                >
                  {section.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: tokens.spacing[3],
            backgroundColor: isDirty ? tokens.colors.warningScale[50] : tokens.colors.successScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isDirty ? tokens.colors.warningScale[200] : tokens.colors.successScale[200]}`,
            borderRadius: tokens.borderRadius.md,
            marginBottom: tokens.spacing[3],
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: isDirty ? tokens.colors.warningScale[500] : tokens.colors.successScale[500],
            }}
          />
          <span
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: isDirty ? tokens.colors.warningScale[700] : tokens.colors.successScale[700],
            }}
          >
            {isDirty ? 'Unsaved' : 'Saved'}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          <button type="button" style={{ ...secondaryBtnStyle, width: '100%', justifyContent: 'center' }} onClick={handleSave}>
            <Save size={14} />
            Save Draft
          </button>
          <button type="button" style={{ ...secondaryBtnStyle, width: '100%', justifyContent: 'center' }} onClick={handlePreview}>
            <Eye size={14} />
            Preview
          </button>
          <button
            type="button"
            style={{ ...primaryBtnStyle, width: '100%', justifyContent: 'center', backgroundColor: tokens.colors.successScale[600] }}
            onClick={handlePublish}
          >
            <Send size={14} />
            Publish
          </button>
        </div>
      </div>
    );

    /* ================================================================ */
    /*  SECTION: BASICS                                                  */
    /* ================================================================ */

    const renderBasics = () => (
      <>
        {renderField('title', 'Job Title *', (
          <input
            type="text"
            style={inputStyle}
            placeholder="e.g. Senior Software Engineer"
            value={formData.title ?? ''}
            onChange={(e) => updateField('title', e.target.value)}
          />
        ))}
        {renderField('code', 'Job Code', (
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <input
              type="text"
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Auto-generated"
              value={formData.code ?? ''}
              onChange={(e) => updateField('code', e.target.value)}
            />
            <button
              type="button"
              style={secondaryBtnStyle}
              onClick={() => updateField('code', generateJobCode(formData.title ?? ''))}
            >
              Generate
            </button>
          </div>
        ))}
        {renderField('department', 'Department *', (
          <select
            style={selectStyle}
            value={formData.department ?? ''}
            onChange={(e) => updateField('department', e.target.value)}
          >
            <option value="">Select department...</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        ))}
        {renderField('seniority', 'Seniority Level *', (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
            {SENIORITY_OPTIONS.map((opt) => {
              const isSelected = formData.seniority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onClick={() => updateField('seniority', opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ))}
        {renderField('employmentType', 'Employment Type *', (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
            {EMPLOYMENT_TYPES.map((opt) => {
              const isSelected = formData.employmentType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                  onClick={() => updateField('employmentType', opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ))}
        {renderField('urgency', 'Urgency', (
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {URGENCY_OPTIONS.map((opt) => {
              const isSelected = formData.urgency === opt.value;
              const scale = opt.color === 'error'
                ? tokens.colors.errorScale
                : opt.color === 'warning'
                  ? tokens.colors.warningScale
                  : tokens.colors.infoScale;
              return (
                <button
                  key={opt.value}
                  type="button"
                  style={{
                    flex: 1,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    color: isSelected ? scale[700] : tokens.colors.neutral[600],
                    backgroundColor: isSelected ? scale[50] : tokens.colors.common.white,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? scale[300] : tokens.colors.neutral[300]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    textAlign: 'center' as const,
                  }}
                  onClick={() => updateField('urgency', opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ))}
      </>
    );

    /* ================================================================ */
    /*  SECTION: DESCRIPTION                                             */
    /* ================================================================ */

    const renderDescription = () => {
      const toolbarBtnStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        border: 'none',
        backgroundColor: 'transparent',
        color: tokens.colors.neutral[600],
        borderRadius: tokens.borderRadius.sm,
        cursor: 'pointer',
        transition: `all ${tokens.motion.hover}`,
      };

      return (
        <>
          {renderField('description', 'Description *', (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderBottom: 'none',
                  borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                }}
              >
                <button type="button" style={toolbarBtnStyle} title="Bold"><Bold size={14} /></button>
                <button type="button" style={toolbarBtnStyle} title="Italic"><Italic size={14} /></button>
                <button type="button" style={toolbarBtnStyle} title="Underline"><Underline size={14} /></button>
                <div style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[300], margin: `0 ${tokens.spacing[1]}px` }} />
                <button type="button" style={toolbarBtnStyle} title="Bullet List"><List size={14} /></button>
                <button type="button" style={toolbarBtnStyle} title="Numbered List"><ListOrdered size={14} /></button>
                <button type="button" style={toolbarBtnStyle} title="Insert Link"><Link size={14} /></button>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.secondaryScale[700],
                    backgroundColor: tokens.colors.secondaryScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.secondaryScale[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Sparkles size={12} />
                  AI Assist
                </button>
              </div>
              <textarea
                style={{ ...textareaStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                placeholder="Describe the role, team, and what success looks like..."
                value={formData.description ?? ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          ))}
          {renderField('responsibilities', 'Key Responsibilities', (
            <textarea
              style={textareaStyle}
              placeholder="List the main responsibilities..."
              value={formData.responsibilities ?? ''}
              onChange={(e) => updateField('responsibilities', e.target.value)}
            />
          ))}
          {renderField('requirements', 'Requirements', (
            <textarea
              style={textareaStyle}
              placeholder="Must-have qualifications..."
              value={formData.requirements ?? ''}
              onChange={(e) => updateField('requirements', e.target.value)}
            />
          ))}
        </>
      );
    };

    /* ================================================================ */
    /*  SECTION: LOCATION                                                */
    /* ================================================================ */

    const renderLocation = () => {
      const arrangementOptions: { value: WorkArrangement; label: string; icon: React.ReactNode }[] = [
        { value: 'onsite', label: 'On-site', icon: <Building2 size={16} /> },
        { value: 'remote', label: 'Remote', icon: <Globe size={16} /> },
        { value: 'hybrid', label: 'Hybrid', icon: <MapPin size={16} /> },
      ];

      return (
        <>
          {renderField('workArrangement', 'Work Arrangement *', (
            <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
              {arrangementOptions.map((opt) => {
                const isSelected = formData.workArrangement === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isSelected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.lg,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={() => updateField('workArrangement', opt.value)}
                  >
                    <div style={{ color: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[400] }}>
                      {opt.icon}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ))}
          {renderField('primaryLocation', 'Primary Location *', (
            <input
              type="text"
              style={inputStyle}
              placeholder="e.g. San Francisco, CA"
              value={formData.primaryLocation ?? ''}
              onChange={(e) => updateField('primaryLocation', e.target.value)}
            />
          ))}
          {renderField('secondaryLocation', 'Secondary Location', (
            <input
              type="text"
              style={inputStyle}
              placeholder="e.g. New York, NY (optional)"
              value={formData.secondaryLocation ?? ''}
              onChange={(e) => updateField('secondaryLocation', e.target.value)}
            />
          ))}
          <div
            style={{
              height: 160,
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            <MapPin size={20} style={{ marginRight: tokens.spacing[2] }} />
            Map preview - {formData.primaryLocation || 'Enter a location above'}
          </div>
        </>
      );
    };

    /* ================================================================ */
    /*  SECTION: COMPENSATION                                            */
    /* ================================================================ */

    const renderCompensation = () => {
      const salaryMin = formData.salaryMin ?? 0;
      const salaryMax = formData.salaryMax ?? 0;
      const maxSalary = 500000;
      const sliderW = 320;
      const minPct = Math.min((salaryMin / maxSalary) * 100, 100);
      const maxPct = Math.min((salaryMax / maxSalary) * 100, 100);

      return (
        <>
          {renderField('currency', 'Currency', (
            <select
              style={{ ...selectStyle, maxWidth: 160 }}
              value={formData.currency ?? 'USD'}
              onChange={(e) => updateField('currency', e.target.value)}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ))}

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Salary Range</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Minimum</div>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="0"
                  value={salaryMin || ''}
                  onChange={(e) => updateField('salaryMin', Number(e.target.value))}
                />
              </div>
              <span style={{ color: tokens.colors.neutral[400], paddingTop: tokens.spacing[4] }}>&mdash;</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Maximum</div>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="0"
                  value={salaryMax || ''}
                  onChange={(e) => updateField('salaryMax', Number(e.target.value))}
                />
              </div>
            </div>
            <svg width={sliderW} height={40} style={{ display: 'block', margin: '0 auto' }} viewBox={`0 0 ${sliderW} 40`}>
              <rect x={0} y={16} width={sliderW} height={8} rx={4} fill={tokens.colors.neutral[200]} />
              <rect x={(minPct / 100) * sliderW} y={16} width={Math.max(0, ((maxPct - minPct) / 100) * sliderW)} height={8} rx={4} fill={tokens.colors.primaryScale[400]} />
              <circle cx={(minPct / 100) * sliderW} cy={20} r={8} fill={tokens.colors.common.white} stroke={tokens.colors.primaryScale[500]} strokeWidth={2} />
              <circle cx={(maxPct / 100) * sliderW} cy={20} r={8} fill={tokens.colors.common.white} stroke={tokens.colors.primaryScale[500]} strokeWidth={2} />
              <text x={(minPct / 100) * sliderW} y={10} textAnchor="middle" fill={tokens.colors.neutral[600]} fontSize={10} fontWeight={tokens.typography.fontWeight.medium}>
                {salaryMin > 0 ? `${(salaryMin / 1000).toFixed(0)}k` : '0'}
              </text>
              <text x={(maxPct / 100) * sliderW} y={10} textAnchor="middle" fill={tokens.colors.neutral[600]} fontSize={10} fontWeight={tokens.typography.fontWeight.medium}>
                {salaryMax > 0 ? `${(salaryMax / 1000).toFixed(0)}k` : '0'}
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
            <div style={{ flex: 1 }}>
              {renderField('signingBonus', 'Signing Bonus', (
                <input type="number" style={inputStyle} placeholder="0" value={formData.signingBonus || ''} onChange={(e) => updateField('signingBonus', Number(e.target.value))} />
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {renderField('equity', 'Equity', (
                <input type="text" style={inputStyle} placeholder="e.g. 0.1% - 0.5%" value={formData.equity ?? ''} onChange={(e) => updateField('equity', e.target.value)} />
              ))}
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Benefits</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: tokens.spacing[2] }}>
              {BENEFITS_OPTIONS.map((benefit) => {
                const isChecked = (formData.benefits ?? []).includes(benefit);
                return (
                  <label
                    key={benefit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: isChecked ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                      backgroundColor: isChecked ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isChecked ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBenefit(benefit)}
                      style={{ accentColor: tokens.colors.primaryScale[600] }}
                    />
                    {benefit}
                  </label>
                );
              })}
            </div>
          </div>
        </>
      );
    };

    /* ================================================================ */
    /*  SECTION: REQUIREMENTS                                            */
    /* ================================================================ */

    const renderRequirements = () => (
      <>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Skills</label>
          <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
            <input
              type="text"
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Add a skill..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <select
              style={{ ...selectStyle, width: 140 }}
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value as SkillTag['proficiency'])}
            >
              {PROFICIENCY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button type="button" style={primaryBtnStyle} onClick={addSkill}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
            {(formData.skills ?? []).map((skill, idx) => {
              const profColor =
                skill.proficiency === 'expert' ? tokens.colors.errorScale :
                skill.proficiency === 'advanced' ? tokens.colors.warningScale :
                skill.proficiency === 'intermediate' ? tokens.colors.infoScale :
                tokens.colors.neutral;
              return (
                <div
                  key={`${skill.name}-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    backgroundColor: profColor[50],
                    color: profColor[700],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${profColor[200]}`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  <Tag size={10} />
                  {skill.name}
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: profColor[500], marginLeft: tokens.spacing[1] }}>
                    ({skill.proficiency})
                  </span>
                  <button
                    type="button"
                    style={{ display: 'inline-flex', alignItems: 'center', border: 'none', backgroundColor: 'transparent', color: profColor[400], cursor: 'pointer', padding: 0, marginLeft: tokens.spacing[1] }}
                    onClick={() => removeSkill(idx)}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
          <div style={{ flex: 1 }}>
            {renderField('experienceMin', 'Min. Experience (years)', (
              <input type="number" style={inputStyle} min={0} placeholder="0" value={formData.experienceMin || ''} onChange={(e) => updateField('experienceMin', Number(e.target.value))} />
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {renderField('experienceMax', 'Max. Experience (years)', (
              <input type="number" style={inputStyle} min={0} placeholder="0" value={formData.experienceMax || ''} onChange={(e) => updateField('experienceMax', Number(e.target.value))} />
            ))}
          </div>
        </div>

        {renderField('educationLevel', 'Education Level', (
          <select
            style={selectStyle}
            value={formData.educationLevel ?? ''}
            onChange={(e) => updateField('educationLevel', e.target.value)}
          >
            <option value="">Select education level...</option>
            {EDUCATION_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        ))}

        <div style={fieldGroupStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Screening Questions</label>
            <button
              type="button"
              style={{ ...secondaryBtnStyle, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs }}
              onClick={addScreeningQuestion}
            >
              <Plus size={12} /> Add Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {(formData.screeningQuestions ?? []).map((q, idx) => (
              <div
                key={q.id}
                style={{
                  padding: tokens.spacing[4],
                  backgroundColor: tokens.colors.neutral[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3] }}>
                  <div style={{ color: tokens.colors.neutral[400], paddingTop: tokens.spacing[2] }}>
                    <GripVertical size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <input
                        type="text"
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder={`Question ${idx + 1}...`}
                        value={q.question}
                        onChange={(e) => updateScreeningQuestion(q.id, 'question', e.target.value)}
                      />
                      <select
                        style={{ ...selectStyle, width: 120 }}
                        value={q.type}
                        onChange={(e) => updateScreeningQuestion(q.id, 'type', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="boolean">Yes/No</option>
                        <option value="choice">Choice</option>
                      </select>
                    </div>
                    {q.type === 'choice' && (
                      <input
                        type="text"
                        style={{ ...inputStyle, marginBottom: tokens.spacing[2] }}
                        placeholder="Options (comma-separated)"
                        value={(q.options ?? []).join(', ')}
                        onChange={(e) => updateScreeningQuestion(q.id, 'options', e.target.value.split(',').map((s) => s.trim()))}
                      />
                    )}
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateScreeningQuestion(q.id, 'required', e.target.checked)}
                        style={{ accentColor: tokens.colors.primaryScale[600] }}
                      />
                      Required
                    </label>
                  </div>
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: tokens.colors.errorScale[400],
                      borderRadius: tokens.borderRadius.sm,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={() => removeScreeningQuestion(q.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {(formData.screeningQuestions ?? []).length === 0 && (
              <div
                style={{
                  padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
                  textAlign: 'center' as const,
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                }}
              >
                <HelpCircle size={24} style={{ marginBottom: tokens.spacing[2] }} />
                <div>No screening questions added yet</div>
              </div>
            )}
          </div>
        </div>
      </>
    );

    /* ================================================================ */
    /*  SECTION: CONFIGURATION                                           */
    /* ================================================================ */

    const renderConfiguration = () => {
      const visibilityOptions = [
        { value: 'public' as const, label: 'Public', description: 'Visible to all candidates on career page', icon: <Globe size={18} /> },
        { value: 'internal' as const, label: 'Internal', description: 'Only visible to internal employees', icon: <Lock size={18} /> },
        { value: 'confidential' as const, label: 'Confidential', description: 'Hidden from public, sourced candidates only', icon: <ShieldAlert size={18} /> },
      ];

      return (
        <>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Visibility *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
              {visibilityOptions.map((opt) => {
                const isSelected = (formData.visibility ?? 'public') === opt.value;
                return (
                  <div
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[4],
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.lg,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={() => updateField('visibility', opt.value)}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                        color: isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                      }}
                    >
                      {opt.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800] }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: 2 }}>
                        {opt.description}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: tokens.borderRadius.full,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && (
                        <div style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500] }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {renderField('openings', 'Number of Openings', (
            <input
              type="number"
              style={{ ...inputStyle, maxWidth: 120 }}
              min={1}
              value={formData.openings ?? 1}
              onChange={(e) => updateField('openings', Number(e.target.value))}
            />
          ))}

          {templates.length > 0 && renderField('templateId', 'Job Template', (
            <select
              style={selectStyle}
              value={formData.templateId ?? ''}
              onChange={(e) => updateField('templateId', e.target.value)}
            >
              <option value="">None - Start from scratch</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ))}

          {clients.length > 0 && renderField('clientId', 'Client Association', (
            <select
              style={selectStyle}
              value={formData.clientId ?? ''}
              onChange={(e) => updateField('clientId', e.target.value)}
            >
              <option value="">No client association</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ))}
        </>
      );
    };

    /* ================================================================ */
    /*  MAIN RENDER                                                      */
    /* ================================================================ */

    return (
      <div style={containerStyle} className={className}>
        {renderNav()}

        <div style={mainStyle}>
          {/* Validation errors banner */}
          {validationErrors.length > 0 && (
            <div
              style={{
                padding: tokens.spacing[4],
                backgroundColor: tokens.colors.errorScale[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                borderRadius: tokens.borderRadius.md,
                marginBottom: tokens.spacing[5],
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  color: tokens.colors.errorScale[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  marginBottom: tokens.spacing[2],
                }}
              >
                <AlertCircle size={16} />
                {validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''} found
              </div>
              {validationErrors.map((err, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.errorScale[600],
                    padding: `${tokens.spacing[1]}px 0`,
                    paddingLeft: tokens.spacing[6],
                  }}
                >
                  <strong>{err.field}:</strong> {err.message}
                </div>
              ))}
            </div>
          )}

          {renderSectionWrapper('basics', 'Job Basics', <Briefcase size={18} />, renderBasics())}
          {renderSectionWrapper('description', 'Job Description', <FileText size={18} />, renderDescription())}
          {renderSectionWrapper('location', 'Location & Work Arrangement', <MapPin size={18} />, renderLocation())}
          {renderSectionWrapper('compensation', 'Compensation & Benefits', <DollarSign size={18} />, renderCompensation())}
          {renderSectionWrapper('requirements', 'Requirements & Screening', <ClipboardCheck size={18} />, renderRequirements())}
          {renderSectionWrapper('configuration', 'Configuration', <Settings size={18} />, renderConfiguration())}
        </div>
      </div>
    );
  },
);
