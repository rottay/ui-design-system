'use client';

/**
 * BhCandidateImport - Standard Preset
 * Step-by-step import wizard with method selection, file upload,
 * field mapping, dedup detection, validation, and import execution
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhCandidateImportProps,
  ImportMethod,
  ImportStep,
  FieldMapping,
  DedupMatch,
  ValidationResult,
  ImportProgress,
} from '../../core';
import { getStepStatusColors, formatFileSize } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Edit3,
  Upload,
  Link2,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2,
  GitMerge,
  SkipForward,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Loader,
  Check,
  X,
  Zap,
  FileSpreadsheet,
  MapPin,
} from 'lucide-react';

const DEFAULT_STEPS: ImportStep[] = [
  { key: 'method', label: 'Method', status: 'active' },
  { key: 'upload', label: 'Upload', status: 'pending' },
  { key: 'mapping', label: 'Field Mapping', status: 'pending' },
  { key: 'dedup', label: 'Dedup Check', status: 'pending' },
  { key: 'validation', label: 'Validation', status: 'pending' },
  { key: 'import', label: 'Import', status: 'pending' },
];

const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  { sourceField: 'full_name', targetField: 'name', autoDetected: true },
  { sourceField: 'email_address', targetField: 'email', autoDetected: true },
  { sourceField: 'phone', targetField: 'phone', autoDetected: true },
  { sourceField: 'current_title', targetField: 'currentRole', autoDetected: true },
  { sourceField: 'company', targetField: 'company', autoDetected: false },
  { sourceField: 'linkedin_url', targetField: 'linkedIn', autoDetected: false },
  { sourceField: 'location', targetField: 'location', autoDetected: true },
  { sourceField: 'skills_list', targetField: 'skills', autoDetected: false },
];

const DEFAULT_DEDUP_RESULTS: DedupMatch[] = [
  { candidateId: 'dup-1', name: 'Sarah Johnson', email: 'sarah.j@example.com', similarity: 95, action: 'merge' },
  { candidateId: 'dup-2', name: 'Michael Chen', email: 'm.chen@example.com', similarity: 87, action: 'skip' },
  { candidateId: 'dup-3', name: 'Emily Williams', email: 'e.williams@company.com', similarity: 72, action: 'create' },
];

const DEFAULT_VALIDATION: ValidationResult = {
  valid: 142,
  warnings: 8,
  errors: 3,
  details: [
    { row: 23, field: 'email', message: 'Invalid email format' },
    { row: 45, field: 'phone', message: 'Missing country code' },
    { row: 89, field: 'email', message: 'Duplicate email within file' },
    { row: 12, field: 'name', message: 'Name appears truncated' },
    { row: 34, field: 'location', message: 'Could not geocode address' },
    { row: 56, field: 'skills', message: 'Unrecognized skill format' },
    { row: 78, field: 'linkedin_url', message: 'Invalid URL format' },
    { row: 91, field: 'phone', message: 'Duplicate phone number' },
    { row: 102, field: 'email', message: 'Disposable email detected' },
    { row: 115, field: 'name', message: 'Special characters detected' },
    { row: 128, field: 'current_title', message: 'Title exceeds max length' },
  ],
};

const TARGET_FIELDS = [
  'name', 'email', 'phone', 'currentRole', 'company',
  'linkedIn', 'location', 'skills', 'education', 'experience',
  'salary', 'availability', 'source', 'notes',
];

function getMethodDetails(method: ImportMethod): { title: string; description: string } {
  switch (method) {
    case 'manual':
      return { title: 'Manual Entry', description: 'Enter candidate details one by one through a guided form' };
    case 'csv':
      return { title: 'CSV Upload', description: 'Upload a CSV or Excel file with candidate data in bulk' };
    case 'integration':
      return { title: 'ATS Integration', description: 'Connect to another ATS and import candidates automatically' };
  }
}

export const StandardBhCandidateImport = createPreset<BhCandidateImportProps>({
  name: 'BhCandidateImport.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateImportProps>) => {
    const { Box, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const isModern = engine === 'modern';

    const {
      steps: stepsProp,
      currentStep: currentStepProp,
      method: methodProp,
      uploadedFile: uploadedFileProp,
      fieldMapping: fieldMappingProp,
      dedupResults: dedupResultsProp,
      validationResults: validationResultsProp,
      importProgress: importProgressProp,
      onChange,
      onStepChange,
      onUpload,
      onMappingChange,
      onDedupAction,
      onStartImport,
      onCancel,
      loading,
      className,
      style,
    } = props;

    const [internalStep, setInternalStep] = useState(currentStepProp ?? 0);
    const [internalMethod, setInternalMethod] = useState<ImportMethod>(methodProp ?? 'csv');
    const [internalFile, setInternalFile] = useState<{ name: string; size: number; type: string } | null>(uploadedFileProp ?? null);
    const [internalMapping, setInternalMapping] = useState<FieldMapping[]>(fieldMappingProp ?? DEFAULT_FIELD_MAPPINGS);
    const [internalDedup, setInternalDedup] = useState<DedupMatch[]>(dedupResultsProp ?? DEFAULT_DEDUP_RESULTS);
    const [internalValidation, setInternalValidation] = useState<ValidationResult | null>(validationResultsProp ?? DEFAULT_VALIDATION);
    const [internalProgress, setInternalProgress] = useState<ImportProgress | null>(importProgressProp ?? null);
    const [dragOver, setDragOver] = useState(false);
    const [expandedErrors, setExpandedErrors] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

    const currentStep = currentStepProp ?? internalStep;
    const currentMethod = methodProp ?? internalMethod;
    const currentFile = uploadedFileProp ?? internalFile;
    const currentMapping = fieldMappingProp ?? internalMapping;
    const currentDedup = dedupResultsProp ?? internalDedup;
    const currentValidation = validationResultsProp ?? internalValidation;
    const currentProgress = importProgressProp ?? internalProgress;

    const steps = stepsProp ?? DEFAULT_STEPS.map((s, i) => ({
      ...s,
      status: i < currentStep ? 'complete' as const : i === currentStep ? 'active' as const : 'pending' as const,
    }));

    const goToStep = useCallback((step: number) => {
      setInternalStep(step);
      onStepChange?.(step);
    }, [onStepChange]);

    const handleMethodSelect = useCallback((method: ImportMethod) => {
      setInternalMethod(method);
      onChange?.('method', method);
    }, [onChange]);

    const handleDedupAction = useCallback((candidateId: string, action: 'merge' | 'skip' | 'create') => {
      setInternalDedup(prev => prev.map(d => d.candidateId === candidateId ? { ...d, action } : d));
      onDedupAction?.(candidateId, action);
    }, [onDedupAction]);

    const handleMappingChange = useCallback((index: number, targetField: string) => {
      const updated = currentMapping.map((m, i) => i === index ? { ...m, targetField, autoDetected: false } : m);
      setInternalMapping(updated);
      onMappingChange?.(updated);
    }, [currentMapping, onMappingChange]);

    const handleStartImport = useCallback(() => {
      const total = currentValidation ? currentValidation.valid + currentValidation.warnings : 150;
      setInternalProgress({ total, processed: 0, succeeded: 0, failed: 0, percentage: 0 });
      onStartImport?.();

      let processed = 0;
      const interval = setInterval(() => {
        processed += Math.floor(Math.random() * 8) + 3;
        if (processed >= total) {
          processed = total;
          clearInterval(interval);
        }
        const failed = Math.floor(processed * 0.02);
        setInternalProgress({
          total,
          processed,
          succeeded: processed - failed,
          failed,
          percentage: Math.round((processed / total) * 100),
        });
      }, 200);
    }, [currentValidation, onStartImport]);

    const stepColors = getStepStatusColors(tokens);
    const glassCardStyle = useMemo(() => isModern ? createCardStyle(tokens, { elevation: 'md', glass: true }) : createCardStyle(tokens, { glass: isGlass, elevation: 'sm' }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    /* ─── Progress Stepper ─── */
    const renderStepper = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
        gap: 0,
      }}>
        {steps.map((step, idx) => {
          const colors = stepColors[step.status];
          const isLast = idx === steps.length - 1;

          return (
            <Box key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              <Box
                onClick={() => step.status === 'complete' ? goToStep(idx) : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  cursor: step.status === 'complete' ? 'pointer' : 'default',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle
                    cx="16" cy="16" r="14"
                    fill={step.status === 'active' ? tokens.colors.primaryScale[500] : step.status === 'complete' ? tokens.colors.successScale[500] : step.status === 'error' ? tokens.colors.errorScale[500] : tokens.colors.neutral[200]}
                    stroke={step.status === 'active' ? tokens.colors.primaryScale[300] : 'none'}
                    strokeWidth={step.status === 'active' ? 2 : 0}
                  />
                  {step.status === 'complete' ? (
                    <polyline
                      points="10,16 14,20 22,12"
                      fill="none"
                      stroke={tokens.colors.common.white}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : step.status === 'error' ? (
                    <>
                      <line x1="12" y1="12" x2="20" y2="20" stroke={tokens.colors.common.white} strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="12" x2="12" y2="20" stroke={tokens.colors.common.white} strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <text x="16" y="16" textAnchor="middle" dominantBaseline="central" fill={step.status === 'active' ? tokens.colors.common.white : tokens.colors.neutral[500]} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
                      {idx + 1}
                    </text>
                  )}
                </svg>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: step.status === 'active' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  color: step.status === 'active' ? tokens.colors.primaryScale[600] : step.status === 'complete' ? tokens.colors.successScale[600] : tokens.colors.neutral[500],
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </Text>
              </Box>
              {!isLast && (
                <Box style={{
                  width: 48,
                  height: 2,
                  backgroundColor: idx < currentStep ? tokens.colors.successScale[400] : tokens.colors.neutral[200],
                  marginLeft: tokens.spacing[2],
                  marginRight: tokens.spacing[2],
                  marginBottom: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.full,
                  transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                }} />
              )}
            </Box>
          );
        })}
      </Box>
    );

    /* ─── Step 1: Method Selection ─── */
    const renderMethodStep = () => {
      const methods: ImportMethod[] = ['manual', 'csv', 'integration'];
      const icons = {
        manual: <Edit3 size={24} color={currentMethod === 'manual' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400]} />,
        csv: <Upload size={24} color={currentMethod === 'csv' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400]} />,
        integration: <Link2 size={24} color={currentMethod === 'integration' ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400]} />,
      };

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box style={{ textAlign: 'center', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              How would you like to import candidates?
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              Choose an import method to get started
            </Text>
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4], maxWidth: 720, margin: '0 auto', width: '100%' }}>
            {methods.map(method => {
              const isSelected = currentMethod === method;
              const details = getMethodDetails(method);
              return (
                <Box
                  key={method}
                  onClick={() => handleMethodSelect(method)}
                  style={{
                    ...glassCardStyle,
                    padding: tokens.spacing[5],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: tokens.spacing[3],
                    cursor: 'pointer',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    transition: `all ${tokens.motion.hover}`,
                    ...(isModern && isSelected && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur } : {}),
                  }}
                >
                  <Box style={{
                    width: 56,
                    height: 56,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    {icons[method]}
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800] }}>
                    {details.title}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500], lineHeight: tokens.typography.lineHeight.relaxed }}>
                    {details.description}
                  </Text>
                  {isSelected && (
                    <Box style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      fontSize: tokens.typography.fontSize.xs,
                    }}>
                      Selected
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    /* ─── Step 2: Upload ─── */
    const renderUploadStep = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <Box style={{ textAlign: 'center', marginBottom: tokens.spacing[1] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
            Upload your file
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
            Supported formats: CSV, XLSX, XLS (max 10MB)
          </Text>
        </Box>

        {!currentFile ? (
          <Box
            onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                setInternalFile({ name: file.name, size: file.size, type: file.type });
                onUpload?.(file);
              }
            }}
            style={{
              border: `2px dashed ${dragOver ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.lg,
              padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
              textAlign: 'center',
              backgroundColor: dragOver ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
              transition: `all ${tokens.motion.hover}`,
              cursor: 'pointer',
            }}
          >
            <Box style={{
              width: 64,
              height: 64,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: dragOver ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: tokens.spacing[4],
              transition: `all ${tokens.motion.hover}`,
            }}>
              <FileSpreadsheet size={28} color={dragOver ? tokens.colors.primaryScale[500] : tokens.colors.neutral[400]} />
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[2] }}>
              Drag and drop your file here
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[4] }}>
              or click to browse from your computer
            </Text>
            <Box style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}>
              <Upload size={16} />
              Browse Files
            </Box>
          </Box>
        ) : (
          <Box style={{
            ...glassCardStyle,
            padding: tokens.spacing[4],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{
                width: 44,
                height: 44,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={22} color={tokens.colors.successScale[600]} />
              </Box>
              <Box>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  {currentFile.name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {formatFileSize(currentFile.size)}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <CheckCircle size={20} color={tokens.colors.successScale[500]} />
              <button onClick={() => setInternalFile(null)} style={{
                padding: tokens.spacing[1],
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'flex',
                alignItems: 'center',
              }}>
                <Trash2 size={16} color={tokens.colors.neutral[400]} />
              </button>
            </Box>
          </Box>
        )}

        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], justifyContent: 'center' }}>
          <Download size={14} color={tokens.colors.primaryScale[500]} />
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500], cursor: 'pointer', fontWeight: tokens.typography.fontWeight.medium }}>
            Download sample CSV template
          </Text>
        </Box>
      </Box>
    );

    /* ─── Step 3: Field Mapping ─── */
    const renderMappingStep = () => {
      const unmappedCount = currentMapping.filter(m => !m.targetField).length;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                Map your fields
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                Match source columns to target candidate fields
              </Text>
            </Box>
            {unmappedCount > 0 && (
              <Box style={{
                ...createBadgeStyle(tokens, 'warning'),
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                <AlertTriangle size={12} />
                {unmappedCount} unmapped
              </Box>
            )}
          </Box>

          <Box style={{
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            overflow: 'hidden',
          }}>
            {/* Header */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '1fr 40px 1fr 80px',
              alignItems: 'center',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Source Field
              </Text>
              <Box />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Field
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                Status
              </Text>
            </Box>

            {/* Mapping rows */}
            {currentMapping.map((mapping, idx) => (
              <Box key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 1fr 80px',
                alignItems: 'center',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderBottom: idx < currentMapping.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                backgroundColor: tokens.colors.common.white,
                transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}>
                <Box style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], fontFamily: 'monospace' }}>
                    {mapping.sourceField}
                  </Text>
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <ArrowRight size={16} color={tokens.colors.neutral[300]} />
                </Box>

                <select
                  value={mapping.targetField}
                  onChange={(e) => handleMappingChange(idx, e.target.value)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${mapping.targetField ? tokens.colors.neutral[200] : tokens.colors.warningScale[300]}`,
                    backgroundColor: mapping.targetField ? tokens.colors.common.white : tokens.colors.warningScale[50],
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                    width: '100%',
                  }}
                >
                  <option value="">-- Select --</option>
                  {TARGET_FIELDS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  {mapping.autoDetected ? (
                    <Box style={{
                      ...createBadgeStyle(tokens, 'success'),
                      fontSize: tokens.typography.fontSize.xs,
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <Zap size={10} />
                      Auto
                    </Box>
                  ) : mapping.targetField ? (
                    <CheckCircle size={16} color={tokens.colors.successScale[500]} />
                  ) : (
                    <AlertTriangle size={16} color={tokens.colors.warningScale[500]} />
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Preview row */}
          <Box style={{
            ...glassCardStyle,
            padding: tokens.spacing[3],
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>
              Preview (Row 1)
            </Text>
            <Box style={{ display: 'flex', gap: tokens.spacing[3], overflowX: 'auto' }}>
              {currentMapping.filter(m => m.targetField).slice(0, 5).map((m, idx) => (
                <Box key={idx} style={{ minWidth: 120 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[1] }}>
                    {m.targetField}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                    {m.sourceField === 'full_name' ? 'John Smith' : m.sourceField === 'email_address' ? 'john@example.com' : m.sourceField === 'phone' ? '+1 555-0123' : m.sourceField === 'current_title' ? 'Sr. Engineer' : 'Sample data'}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    };

    /* ─── Step 4: Dedup Detection ─── */
    const renderDedupStep = () => (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
        <Box>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
            Duplicate Detection
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
            We found {currentDedup.length} potential duplicates in your import
          </Text>
        </Box>

        <Box style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 120px 200px',
            alignItems: 'center',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Candidate
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Similarity
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
              Action
            </Text>
          </Box>

          {/* Match rows */}
          {currentDedup.map((match, idx) => {
            const simColor = match.similarity >= 90 ? tokens.colors.errorScale[500]
              : match.similarity >= 75 ? tokens.colors.warningScale[500]
              : tokens.colors.infoScale[500];
            const simBg = match.similarity >= 90 ? tokens.colors.errorScale[50]
              : match.similarity >= 75 ? tokens.colors.warningScale[50]
              : tokens.colors.infoScale[50];

            return (
              <Box key={match.candidateId} style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.5fr 120px 200px',
                alignItems: 'center',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: idx < currentDedup.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                backgroundColor: tokens.colors.common.white,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                  {match.name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                  {match.email}
                </Text>

                {/* Similarity bar */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: simColor }}>
                      {match.similarity}%
                    </Text>
                  </Box>
                  <svg width="100%" height="6" viewBox="0 0 100 6" preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full }}>
                    <rect x="0" y="0" width="100" height="6" rx="3" fill={tokens.colors.neutral[100]} />
                    <rect x="0" y="0" width={match.similarity} height="6" rx="3" fill={simColor} />
                  </svg>
                </Box>

                {/* Action buttons */}
                <Box style={{ display: 'flex', gap: tokens.spacing[1], justifyContent: 'center' }}>
                  {(['merge', 'skip', 'create'] as const).map(action => {
                    const isActive = match.action === action;
                    const actionIcons = {
                      merge: <GitMerge size={12} />,
                      skip: <SkipForward size={12} />,
                      create: <PlusCircle size={12} />,
                    };
                    const actionColors = {
                      merge: 'primary' as const,
                      skip: 'warning' as const,
                      create: 'success' as const,
                    };

                    return (
                      <button
                        key={action}
                        onClick={() => handleDedupAction(match.candidateId, action)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors[`${actionColors[action]}Scale`][300] : tokens.colors.neutral[200]}`,
                          backgroundColor: isActive ? tokens.colors[`${actionColors[action]}Scale`][50] : tokens.colors.common.white,
                          color: isActive ? tokens.colors[`${actionColors[action]}Scale`][700] : tokens.colors.neutral[500],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          textTransform: 'capitalize',
                        }}
                      >
                        {actionIcons[action]}
                        {action}
                      </button>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );

    /* ─── Step 5: Validation ─── */
    const renderValidationStep = () => {
      if (!currentValidation) return null;

      const summaryCards = [
        { label: 'Valid', count: currentValidation.valid, color: 'success' as const, Icon: CheckCircle },
        { label: 'Warnings', count: currentValidation.warnings, color: 'warning' as const, Icon: AlertTriangle },
        { label: 'Errors', count: currentValidation.errors, color: 'error' as const, Icon: XCircle },
      ];

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              Validation Results
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              Review data quality before importing
            </Text>
          </Box>

          {/* Summary cards */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            {summaryCards.map(card => {
              const scaleKey = `${card.color}Scale` as const;
              const scale = (tokens.colors as any)[scaleKey];

              return (
                <Box key={card.label} style={{
                  ...glassCardStyle,
                  padding: tokens.spacing[4],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  borderLeft: `4px solid ${scale[500]}`,
                }}>
                  <Box style={{
                    width: 48,
                    height: 48,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: scale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <card.Icon size={24} color={scale[500]} />
                  </Box>
                  <Box>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: scale[700], lineHeight: tokens.typography.lineHeight.tight }}>
                      {card.count}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: scale[600], fontWeight: tokens.typography.fontWeight.medium }}>
                      {card.label}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Error details */}
          {currentValidation.details.length > 0 && (
            <Box style={{
              ...createSurfaceStyle(tokens, { elevation: 'sm' }),
              overflow: 'hidden',
            }}>
              <Box
                onClick={() => setExpandedErrors(!expandedErrors)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderBottom: expandedErrors ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                }}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <AlertTriangle size={16} color={tokens.colors.warningScale[500]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                    {currentValidation.details.length} issues found
                  </Text>
                </Box>
                {expandedErrors ? <ChevronUp size={16} color={tokens.colors.neutral[400]} /> : <ChevronDown size={16} color={tokens.colors.neutral[400]} />}
              </Box>
              {expandedErrors && (
                <Box style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {currentValidation.details.map((detail, idx) => (
                    <Box key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 100px 1fr',
                      alignItems: 'center',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderBottom: idx < currentValidation.details.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                      backgroundColor: tokens.colors.common.white,
                    }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontFamily: 'monospace' }}>
                        Row {detail.row}
                      </Text>
                      <Box style={{
                        ...createBadgeStyle(tokens, 'secondary'),
                        fontSize: tokens.typography.fontSize.xs,
                        display: 'inline-flex',
                        width: 'fit-content',
                      }}>
                        {detail.field}
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                        {detail.message}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      );
    };

    /* ─── Step 6: Review & Import ─── */
    const renderImportStep = () => {
      const isImporting = currentProgress !== null && currentProgress.percentage < 100;
      const isComplete = currentProgress !== null && currentProgress.percentage >= 100;

      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], padding: tokens.spacing[4], alignItems: 'center', maxWidth: 560, margin: '0 auto', width: '100%' }}>
          {!currentProgress ? (
            <>
              <Box style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                  Review & Import
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                  Review your import settings before starting
                </Text>
              </Box>

              <Box style={{
                ...glassCardStyle,
                padding: tokens.spacing[5],
                width: '100%',
              }}>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Method</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], textTransform: 'capitalize' }}>{currentMethod}</Text>
                  </Box>
                  {currentFile && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>File</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{currentFile.name}</Text>
                    </Box>
                  )}
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Fields mapped</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {currentMapping.filter(m => m.targetField).length} / {currentMapping.length}
                    </Text>
                  </Box>
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Duplicates resolved</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{currentDedup.length}</Text>
                  </Box>
                  {currentValidation && (
                    <>
                      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Records to import</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>{currentValidation.valid + currentValidation.warnings}</Text>
                      </Box>
                      <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Estimated time</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>~{Math.ceil((currentValidation.valid + currentValidation.warnings) / 50)}s</Text>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              <button
                onClick={handleStartImport}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <Upload size={18} />
                Start Import
              </button>
            </>
          ) : isComplete ? (
            /* Success celebration */
            <Box style={{ textAlign: 'center', padding: tokens.spacing[6] }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ margin: '0 auto', marginBottom: tokens.spacing[4] }}>
                <circle cx="40" cy="40" r="36" fill={tokens.colors.successScale[50]} stroke={tokens.colors.successScale[400]} strokeWidth="3" />
                <circle cx="40" cy="40" r="36" fill="none" stroke={tokens.colors.successScale[500]} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset="0" strokeLinecap="round" style={{ transition: `stroke-dashoffset 1s ease-out` }}>
                  <animate attributeName="stroke-dashoffset" from={`${2 * Math.PI * 36}`} to="0" dur="0.8s" fill="freeze" />
                </circle>
                <polyline
                  points="26,40 36,50 54,32"
                  fill="none"
                  stroke={tokens.colors.successScale[500]}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                >
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.5s" begin="0.5s" fill="freeze" />
                </polyline>
              </svg>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700], marginBottom: tokens.spacing[2] }}>
                Import Complete!
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
                Successfully imported {currentProgress.succeeded} candidates
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[3], justifyContent: 'center' }}>
                <Box style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[50],
                  textAlign: 'center',
                  minWidth: 100,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>{currentProgress.succeeded}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>Succeeded</Text>
                </Box>
                {currentProgress.failed > 0 && (
                  <Box style={{
                    padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.errorScale[50],
                    textAlign: 'center',
                    minWidth: 100,
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[700] }}>{currentProgress.failed}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600] }}>Failed</Text>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            /* Progress during import */
            <Box style={{ textAlign: 'center', padding: tokens.spacing[4], width: '100%' }}>
              <Box style={{ marginBottom: tokens.spacing[4] }}>
                <Loader size={32} color={tokens.colors.primaryScale[500]} style={{ animation: 'spin 1s linear infinite' }} />
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[2] }}>
                Importing candidates...
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[4] }}>
                {currentProgress.processed} of {currentProgress.total} processed
              </Text>

              {/* Animated progress bar */}
              <Box style={{ position: 'relative', width: '100%', marginBottom: tokens.spacing[3] }}>
                <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" style={{ borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                  <rect x="0" y="0" width="400" height="12" rx="6" fill={tokens.colors.neutral[100]} />
                  <rect x="0" y="0" width={currentProgress.percentage * 4} height="12" rx="6" fill={tokens.colors.primaryScale[500]} style={{ transition: `width 0.3s ease-out` }} />
                </svg>
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>
                {currentProgress.percentage}%
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[4], justifyContent: 'center', marginTop: tokens.spacing[3] }}>
                <Box style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[600] }}>{currentProgress.succeeded}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Succeeded</Text>
                </Box>
                <Box style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[600] }}>{currentProgress.failed}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Failed</Text>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      );
    };

    /* ─── Main Render ─── */
    const stepRenderers = [
      renderMethodStep,
      renderUploadStep,
      renderMappingStep,
      renderDedupStep,
      renderValidationStep,
      renderImportStep,
    ];

    const canGoBack = currentStep > 0 && !(currentProgress && currentProgress.percentage > 0);
    const canGoNext = currentStep < steps.length - 1;
    const isImportingOrComplete = currentProgress !== null;

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: isModern ? 'transparent' : tokens.colors.neutral[50],
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
        }}>
          <h1 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
            Import Candidates
          </h1>
          {onCancel && (
            <button onClick={onCancel} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <X size={14} />
              Cancel
            </button>
          )}
        </Box>

        {/* Stepper */}
        {renderStepper()}

        {/* Step Content */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {stepRenderers[currentStep]?.()}
        </Box>

        {/* Footer navigation */}
        {!isImportingOrComplete && (
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            ...(isModern && tokens.glass ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg } : {}),
          }}>
            <button
              onClick={() => canGoBack && goToStep(currentStep - 1)}
              disabled={!canGoBack}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: canGoBack ? tokens.colors.neutral[700] : tokens.colors.neutral[300],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: canGoBack ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                transition: `all ${tokens.motion.hover}`,
                opacity: canGoBack ? 1 : 0.5,
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              Step {currentStep + 1} of {steps.length}
            </Text>

            <button
              onClick={() => canGoNext && goToStep(currentStep + 1)}
              disabled={!canGoNext}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: canGoNext ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                color: canGoNext ? tokens.colors.common.white : tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          </Box>
        )}
      </Box>
    );
  },
});
