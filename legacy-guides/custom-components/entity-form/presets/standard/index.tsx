'use client';

import { useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { EntityFormProps, FormFieldConfig } from '../../core';
import { ENTITY_FORM_DEFAULTS } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const StandardEntityForm = createPreset<EntityFormProps>({
  name: 'EntityForm.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<EntityFormProps>) => {
    const { Box } = primitives;
    const {
      fields,
      values,
      onChange,
      onSubmit,
      onCancel,
      sections: rawSections = [],
      errors = {},
      readOnly = false,
      loading = false,
      submitLabel = ENTITY_FORM_DEFAULTS.submitLabel,
      cancelLabel = ENTITY_FORM_DEFAULTS.cancelLabel,
      title,
      description,
      className,
      style,
    } = props;

    const sections = Array.isArray(rawSections) ? rawSections : [];

    const visibleFields = useMemo(() => fields.filter((f) => !f.hidden), [fields]);

    const groupedFields = useMemo(() => {
      if (sections.length === 0) return { '': visibleFields };
      const groups: Record<string, FormFieldConfig[]> = {};
      sections.forEach((s) => { groups[s.key] = []; });
      groups[''] = [];
      visibleFields.forEach((f) => {
        const section = f.section ?? '';
        if (!groups[section]) groups[section] = [];
        groups[section].push(f);
      });
      return groups;
    }, [visibleFields, sections]);

    const inputBaseStyle = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      fontSize: tokens.typography.fontSize.sm,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      borderRadius: tokens.borderRadius.md,
      backgroundColor: readOnly ? tokens.colors.neutral[50] : tokens.colors.common.white,
      color: tokens.colors.neutral[900],
      outline: 'none',
      fontFamily: 'inherit',
    };

    const renderField = (field: FormFieldConfig) => {
      const value = values[field.key];
      const error = errors[field.key];
      const isDisabled = readOnly || field.disabled || loading;

      const fieldErrorBorder = error ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[400]}` : inputBaseStyle.border;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
          return (
            <input
              type={field.type}
              value={(value as string) ?? ''}
              onChange={(e) => onChange(field.key, field.type === 'number' ? e.target.value : e.target.value)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              style={{ ...inputBaseStyle, border: fieldErrorBorder, cursor: isDisabled ? 'not-allowed' : 'text' }}
            />
          );

        case 'textarea':
          return (
            <textarea
              value={(value as string) ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              disabled={isDisabled}
              rows={3}
              style={{ ...inputBaseStyle, border: fieldErrorBorder, resize: 'vertical' as const, cursor: isDisabled ? 'not-allowed' : 'text' }}
            />
          );

        case 'select':
          return (
            <select
              value={(value as string) ?? ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={isDisabled}
              style={{ ...inputBaseStyle, border: fieldErrorBorder, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
              <option value="">{field.placeholder ?? `Select ${field.label}`}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );

        case 'multiselect':
          return (
            <div style={{
              boxShadow: tokens.shadows.md, display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
              {field.options?.map((opt) => {
                const selected = Array.isArray(value) && value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      const arr = Array.isArray(value) ? value : [];
                      onChange(field.key, selected ? arr.filter((v: string) => v !== opt.value) : [...arr, opt.value]);
                    }}
                    style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: selected ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      color: selected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                      backgroundColor: selected ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selected ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                      borderRadius: tokens.borderRadius.full,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );

        case 'checkbox':
        case 'toggle':
          return (
            <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(field.key, e.target.checked)}
                disabled={isDisabled}
                style={{ accentColor: tokens.colors.primaryScale[600] }}
              />
              {field.placeholder && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{field.placeholder}</span>}
            </label>
          );

        case 'avatar':
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                {value ? (
                  <img src={value as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.primaryScale[500] }}>{'\u{1F464}'}</span>
                )}
              </div>
              {!readOnly && (
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Upload via props
                </span>
              )}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Title */}
        {title && (
          <div style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[5]}px ${tokens.spacing[3]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {title}
            </div>
            {description && (
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                {description}
              </div>
            )}
          </div>
        )}

        {/* Form body */}
        <div style={{ padding: tokens.spacing[5] }}>
          {Object.entries(groupedFields).map(([sectionKey, sectionFields]) => {
            if (sectionFields.length === 0) return null;
            const section = sections.find((s) => s.key === sectionKey);

            return (
              <div key={sectionKey || '_default'} style={{ marginBottom: tokens.spacing[5] }}>
                {section && (
                  <div style={{ marginBottom: tokens.spacing[4] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {section.icon && <span style={{ color: tokens.colors.neutral[400] }}>{section.icon}</span>}
                      <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                        {section.title}
                      </span>
                    </div>
                    {section.description && (
                      <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                        {section.description}
                      </div>
                    )}
                    <div style={{ height: 1, backgroundColor: tokens.colors.neutral[100], marginTop: tokens.spacing[3] }} />
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                }}>
                  {sectionFields.map((field) => (
                    <div key={field.key} style={{ gridColumn: field.colSpan === 2 ? '1 / -1' : undefined }}>
                      {field.type !== 'checkbox' && field.type !== 'toggle' && (
                        <label style={{
                          display: 'block',
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          marginBottom: tokens.spacing[1],
                        }}>
                          {field.label}
                          {field.required && <span style={{ color: tokens.colors.errorScale[500], marginLeft: tokens.spacing[1] }}>*</span>}
                        </label>
                      )}
                      {renderField(field)}
                      {errors[field.key] && (
                        <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[500], marginTop: tokens.spacing[1] }}>
                          {errors[field.key]}
                        </div>
                      )}
                      {field.helpText && !errors[field.key] && (
                        <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                          {field.helpText}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {(onSubmit || onCancel) && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.neutral[50],
          }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700],
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {cancelLabel}
              </button>
            )}
            {onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={loading || readOnly}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  cursor: (loading || readOnly) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Saving...' : submitLabel}
              </button>
            )}
          </div>
        )}
      </Box>
    );
  },
});
