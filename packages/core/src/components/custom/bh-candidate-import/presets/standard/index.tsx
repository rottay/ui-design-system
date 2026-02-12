'use client';

/**
 * BhCandidateImport - Standard Preset
 * Step-by-step import wizard with method selection, file upload,
 * field mapping, dedup detection, validation, and progress tracking.
 * Slite-inspired warm design with clear step progression.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type {
  BhCandidateImportProps, ImportStep, FieldMapping, DedupMatch,
  ValidationResult, ImportProgress, ImportMethod,
} from '../../core';
import { getStepStatusColors, formatFileSize } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Upload, FileText, Link2, Edit3, CheckCircle, AlertTriangle,
  XCircle, ArrowRight, ArrowLeft, X, ChevronDown, RefreshCw,
  Users, GitMerge, SkipForward, Plus, Loader2,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_STEPS: ImportStep[] = [
  { key: 'method', label: 'Import Method', status: 'active' },
  { key: 'upload', label: 'Upload', status: 'pending' },
  { key: 'mapping', label: 'Field Mapping', status: 'pending' },
  { key: 'dedup', label: 'Dedup Check', status: 'pending' },
  { key: 'validate', label: 'Validation', status: 'pending' },
  { key: 'import', label: 'Import', status: 'pending' },
];

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { sourceField: 'Full Name', targetField: 'name', autoDetected: true },
  { sourceField: 'Email Address', targetField: 'email', autoDetected: true },
  { sourceField: 'Phone', targetField: 'phone', autoDetected: true },
  { sourceField: 'Current Company', targetField: 'company', autoDetected: false },
  { sourceField: 'Job Title', targetField: 'currentRole', autoDetected: true },
  { sourceField: 'LinkedIn URL', targetField: 'linkedinUrl', autoDetected: false },
  { sourceField: 'Location', targetField: 'location', autoDetected: true },
];

const DEFAULT_DEDUP: DedupMatch[] = [
  { candidateId: 'c-1', name: 'Sarah Johnson', email: 'sarah.j@google.com', similarity: 98, action: 'merge' },
  { candidateId: 'c-2', name: 'Michael Chen', email: 'mchen@stripe.com', similarity: 85, action: 'skip' },
  { candidateId: 'c-3', name: 'Emily R.', email: 'emily@meta.com', similarity: 72, action: 'create' },
];

const DEFAULT_VALIDATION: ValidationResult = {
  valid: 142, warnings: 8, errors: 3,
  details: [
    { row: 23, field: 'email', message: 'Invalid email format' },
    { row: 47, field: 'phone', message: 'Missing country code' },
    { row: 89, field: 'email', message: 'Duplicate email within file' },
  ],
};

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------*/

function getStepIcon(key: string, status: string) {
  if (status === 'complete') return <CheckCircle size={16} />;
  if (status === 'error') return <XCircle size={16} />;
  const icons: Record<string, React.ReactNode> = {
    method: <Edit3 size={16} />,
    upload: <Upload size={16} />,
    mapping: <Link2 size={16} />,
    dedup: <GitMerge size={16} />,
    validate: <AlertTriangle size={16} />,
    import: <RefreshCw size={16} />,
  };
  return icons[key] ?? <FileText size={16} />;
}

function getDedupActionConfig(action: string, t: DesignTokens) {
  const m: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
    merge: { label: 'Merge', icon: <GitMerge size={12} />, bg: t.colors.primaryScale[50], color: t.colors.primaryScale[700] },
    skip: { label: 'Skip', icon: <SkipForward size={12} />, bg: t.colors.warningScale[50], color: t.colors.warningScale[700] },
    create: { label: 'Create New', icon: <Plus size={12} />, bg: t.colors.successScale[50], color: t.colors.successScale[700] },
  };
  return m[action] ?? m.create;
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const StandardBhCandidateImport = createPreset<BhCandidateImportProps>({
  name: 'BhCandidateImport.Standard',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateImportProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const stepColors = getStepStatusColors(t);

    const {
      steps = DEFAULT_STEPS, currentStep: csp = 0,
      method: mp, uploadedFile: ufp,
      fieldMapping = DEFAULT_MAPPINGS, dedupResults = DEFAULT_DEDUP,
      validationResults = DEFAULT_VALIDATION, importProgress: ipp,
      onChange, onStepChange, onUpload, onMappingChange, onDedupAction,
      onStartImport, onCancel, loading,
      className, style,
    } = props;

    const [iStep, setIStep] = useState(csp);
    const [iMethod, setIMethod] = useState<ImportMethod>('csv');
    const currentStep = csp ?? iStep;
    const method = mp ?? iMethod;

    const activeStepKey = steps[currentStep]?.key ?? 'method';

    const goNext = () => { const n = Math.min(currentStep + 1, steps.length - 1); onStepChange ? onStepChange(n) : setIStep(n); };
    const goPrev = () => { const n = Math.max(currentStep - 1, 0); onStepChange ? onStepChange(n) : setIStep(n); };

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Import Candidates</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: 4 }}>
              Step {currentStep + 1} of {steps.length} - {steps[currentStep]?.label}
            </Text>
          </Box>
          {onCancel && (
            <button onClick={onCancel} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
              borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white, color: t.colors.neutral[500], cursor: 'pointer',
            }}><X size={16} /></button>
          )}
        </Box>

        {/* Step indicator */}
        <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[7]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {steps.map((step, i) => {
              const sc = stepColors[step.status];
              const isCurrent = i === currentStep;
              return (
                <Box key={step.key} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flex: 1 }}>
                  <Box style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[2],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: isCurrent ? t.colors.primaryScale[50] : step.status === 'complete' ? t.colors.successScale[50] : 'transparent',
                    border: isCurrent ? `1px solid ${t.colors.primaryScale[200]}` : '1px solid transparent',
                    transition: `all ${t.motion.hover}`,
                  }}>
                    <Box style={{ color: isCurrent ? t.colors.primaryScale[600] : sc.text }}>{getStepIcon(step.key, step.status)}</Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs, fontWeight: isCurrent ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                      color: isCurrent ? t.colors.primaryScale[700] : sc.text, whiteSpace: 'nowrap',
                    }}>{step.label}</Text>
                  </Box>
                  {i < steps.length - 1 && (
                    <Box style={{ flex: 1, height: 1, backgroundColor: step.status === 'complete' ? t.colors.successScale[300] : t.colors.neutral[200], minWidth: 12 }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Content area */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[7]}px` }}>

          {/* Method selection */}
          {activeStepKey === 'method' && (
            <Box style={{ maxWidth: 560, margin: '0 auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[2] }}>
                How would you like to import candidates?
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[6] }}>
                Choose the method that best fits your data source.
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {([
                  { key: 'csv', icon: <Upload size={22} />, title: 'CSV / Excel Upload', desc: 'Upload a spreadsheet with candidate data' },
                  { key: 'manual', icon: <Edit3 size={22} />, title: 'Manual Entry', desc: 'Add candidates one at a time' },
                  { key: 'integration', icon: <Link2 size={22} />, title: 'Integration Sync', desc: 'Import from LinkedIn Recruiter, Greenhouse, etc.' },
                ] as { key: ImportMethod; icon: React.ReactNode; title: string; desc: string }[]).map(m => {
                  const active = method === m.key;
                  return (
                    <Box key={m.key} onClick={() => { onChange?.('method', m.key); setIMethod(m.key); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[4],
                        padding: `${t.spacing[5]}px`, borderRadius: t.borderRadius.xl,
                        border: `1px solid ${active ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                        backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                        cursor: 'pointer', transition: `all ${t.motion.hover}`,
                      }}>
                      <Box style={{
                        width: 48, height: 48, borderRadius: t.borderRadius.lg,
                        backgroundColor: active ? t.colors.primaryScale[100] : t.colors.neutral[50],
                        color: active ? t.colors.primaryScale[600] : t.colors.neutral[500],
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{m.icon}</Box>
                      <Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{m.title}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>{m.desc}</Text>
                      </Box>
                      {active && <Box style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[500] }} />}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Upload step */}
          {activeStepKey === 'upload' && (
            <Box style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
              <Box style={{
                padding: `${t.spacing[10]}px`, borderRadius: t.borderRadius.xl,
                border: `2px dashed ${t.colors.neutral[200]}`, backgroundColor: t.colors.neutral[50],
                cursor: 'pointer', transition: `border-color ${t.motion.hover}`,
              }}>
                <Upload size={36} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700], marginBottom: t.spacing[1] }}>
                  Drop your file here or click to browse
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  Supports .csv, .xlsx, .xls up to 10MB
                </Text>
              </Box>
              {ufp && (
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[3],
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.successScale[50], border: `1px solid ${t.colors.successScale[200]}`,
                  marginTop: t.spacing[4],
                }}>
                  <FileText size={18} style={{ color: t.colors.successScale[600] }} />
                  <Box style={{ flex: 1, textAlign: 'left' }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{ufp.name}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{formatFileSize(ufp.size)}</Text>
                  </Box>
                  <CheckCircle size={18} style={{ color: t.colors.successScale[500] }} />
                </Box>
              )}
            </Box>
          )}

          {/* Mapping step */}
          {activeStepKey === 'mapping' && (
            <Box style={{ maxWidth: 640, margin: '0 auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[1] }}>Field Mapping</Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[5] }}>
                Map columns from your file to candidate fields. Auto-detected mappings are highlighted.
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {fieldMapping.map((fm, i) => (
                  <Box key={i} style={{
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: fm.autoDetected ? t.colors.successScale[50] : t.colors.neutral[50],
                    border: `1px solid ${fm.autoDetected ? t.colors.successScale[200] : t.colors.neutral[100]}`,
                  }}>
                    <Text style={{ flex: 1, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{fm.sourceField}</Text>
                    <ArrowRight size={14} style={{ color: t.colors.neutral[300], flexShrink: 0 }} />
                    <Text style={{ flex: 1, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontWeight: t.typography.fontWeight.semibold }}>{fm.targetField}</Text>
                    {fm.autoDetected && (
                      <Box style={{ padding: `1px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.successScale[100], color: t.colors.successScale[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
                        Auto
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Dedup step */}
          {activeStepKey === 'dedup' && (
            <Box style={{ maxWidth: 640, margin: '0 auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[1] }}>Duplicate Detection</Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[5] }}>
                {dedupResults.length} potential duplicates found. Choose how to handle each.
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {dedupResults.map(d => {
                  const ac = getDedupActionConfig(d.action, t);
                  return (
                    <Box key={d.candidateId} style={{
                      padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                      border: `1px solid ${t.colors.neutral[100]}`, backgroundColor: t.colors.common.white,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                          <Box style={{
                            width: 36, height: 36, borderRadius: t.borderRadius.full,
                            backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                          }}><Users size={16} /></Box>
                          <Box>
                            <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{d.name}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{d.email}</Text>
                          </Box>
                        </Box>
                        <Box style={{
                          padding: `2px ${t.spacing[3]}px`, borderRadius: br,
                          backgroundColor: d.similarity >= 90 ? t.colors.errorScale[50] : d.similarity >= 80 ? t.colors.warningScale[50] : t.colors.infoScale[50],
                          color: d.similarity >= 90 ? t.colors.errorScale[700] : d.similarity >= 80 ? t.colors.warningScale[700] : t.colors.infoScale[700],
                          fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                        }}>{d.similarity}% match</Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                        {(['merge', 'skip', 'create'] as const).map(action => {
                          const cfg = getDedupActionConfig(action, t);
                          const active = d.action === action;
                          return (
                            <button key={action} onClick={() => onDedupAction?.(d.candidateId, action)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: br,
                                border: `1px solid ${active ? cfg.color : t.colors.neutral[200]}`,
                                backgroundColor: active ? cfg.bg : t.colors.common.white,
                                color: active ? cfg.color : t.colors.neutral[600],
                                fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                              }}>
                              {cfg.icon} {cfg.label}
                            </button>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Validation step */}
          {activeStepKey === 'validate' && validationResults && (
            <Box style={{ maxWidth: 640, margin: '0 auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[5] }}>Validation Results</Text>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t.spacing[3], marginBottom: t.spacing[5] }}>
                {[
                  { label: 'Valid', value: validationResults.valid, color: t.colors.successScale[600], bg: t.colors.successScale[50], icon: <CheckCircle size={18} /> },
                  { label: 'Warnings', value: validationResults.warnings, color: t.colors.warningScale[600], bg: t.colors.warningScale[50], icon: <AlertTriangle size={18} /> },
                  { label: 'Errors', value: validationResults.errors, color: t.colors.errorScale[600], bg: t.colors.errorScale[50], icon: <XCircle size={18} /> },
                ].map(s => (
                  <Box key={s.label} style={{
                    padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                    backgroundColor: s.bg, textAlign: 'center',
                  }}>
                    <Box style={{ color: s.color, marginBottom: t.spacing[2], display: 'flex', justifyContent: 'center' }}>{s.icon}</Box>
                    <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: s.color }}>{s.value}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: s.color, marginTop: 2 }}>{s.label}</Text>
                  </Box>
                ))}
              </Box>
              {validationResults.details.length > 0 && (
                <Box style={{ borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[100]}`, overflow: 'hidden' }}>
                  {validationResults.details.map((d, i) => (
                    <Box key={i} style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderBottom: i < validationResults.details.length - 1 ? `1px solid ${t.colors.neutral[100]}` : undefined,
                      backgroundColor: t.colors.common.white,
                    }}>
                      <Box style={{ padding: `2px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.neutral[100], fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                        Row {d.row}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{d.field}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], flex: 1 }}>{d.message}</Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Import progress step */}
          {activeStepKey === 'import' && (
            <Box style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
              {ipp ? (
                <>
                  <Box style={{ marginBottom: t.spacing[5] }}>
                    <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{ipp.percentage}%</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginTop: t.spacing[1] }}>
                      {ipp.processed} of {ipp.total} records processed
                    </Text>
                  </Box>
                  <Box style={{ height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden', marginBottom: t.spacing[4] }}>
                    <Box style={{ height: '100%', width: `${ipp.percentage}%`, backgroundColor: t.colors.primaryScale[500], borderRadius: t.borderRadius.full, transition: 'width 0.3s ease' }} />
                  </Box>
                  <Box style={{ display: 'flex', justifyContent: 'center', gap: t.spacing[6] }}>
                    <Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.successScale[600] }}>{ipp.succeeded}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Succeeded</Text>
                    </Box>
                    <Box>
                      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.errorScale[600] }}>{ipp.failed}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Failed</Text>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box style={{
                    width: 64, height: 64, borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[600],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    marginBottom: t.spacing[4],
                  }}>
                    <Upload size={28} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900], marginBottom: t.spacing[2] }}>Ready to Import</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginBottom: t.spacing[5] }}>
                    All checks passed. Click start to begin importing candidates.
                  </Text>
                  <button onClick={onStartImport} style={{
                    display: 'inline-flex', alignItems: 'center', gap: t.spacing[2],
                    padding: `${t.spacing[3]}px ${t.spacing[6]}px`, borderRadius: t.borderRadius.lg,
                    border: 'none', backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
                    fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
                  }}>
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                    Start Import
                  </button>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Footer navigation */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[7]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button onClick={goPrev} disabled={currentStep === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
              border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
              color: currentStep === 0 ? t.colors.neutral[300] : t.colors.neutral[700],
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: currentStep === 0 ? 'default' : 'pointer',
            }}>
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={goNext} disabled={currentStep === steps.length - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
              border: 'none', backgroundColor: currentStep === steps.length - 1 ? t.colors.neutral[200] : t.colors.primaryScale[600],
              color: t.colors.common.white,
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, cursor: currentStep === steps.length - 1 ? 'default' : 'pointer',
            }}>
            Continue <ArrowRight size={14} />
          </button>
        </Box>
      </Box>
    );
  },
});
