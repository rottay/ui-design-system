'use client';

/**
 * ImportExportSurface
 *
 * Config-driven bulk data import/export page. The surface owns the flow
 * structure (file intake -> validation preview -> confirmation for imports,
 * format/field selection for exports, and an operation history) while the
 * app owns file parsing, field mapping, and data transformation through the
 * contract callbacks.
 *
 * Composition: PageShellSurface chrome + Card sections + Upload.Dragger
 * (file intake), Segmented (format choice), Checkbox grid (field selection),
 * and the shared state kits (loading skeleton, empty, error with retry).
 * Visible copy resolves through `tSurfaceOr` under `surfaces.import_export.*`
 * with an English floor, and visual defaults cascade config -> product
 * profile -> DS defaults via `useSurfaceProfileDefaultsWithOverrides`.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { FadeIn } from '@/graphics/motion';
import { ActionDownloadIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-download';
import { ActionUploadIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-upload';
import { DataExportIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-export';
import { DataImportIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-import';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { TimeTimestampIcon } from '@/graphics/icons/presentation/semantic/generated/roles/time-timestamp';
import React, { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  NavLink,
  Segmented,
  Spinner,
  Stack,
  Tag,
  Text,
  Upload,
  type CardVariant,
  type UploadChangeInfo,
} from '../../../../../primitives';
import type {
  ImportExportSurfaceConfig,
  ImportResult,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import {
  SurfaceEmptyState,
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';

export interface ImportExportSurfaceProps {
  config: ImportExportSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

type ImportStep = 'upload' | 'preview' | 'complete';

/** A rejected async job plus the closure that re-runs it, kept for retry. */
interface FlowFailure {
  error: unknown;
  retry: () => void;
}

/** History status vocabulary is open-ended; only the two known terminals get a firm tone. */
function statusTone(status: string): 'success' | 'danger' | 'warning' {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'danger';
  return 'warning';
}

/** Section header: governed semantic icon + title + optional supporting copy. */
function PanelHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}): React.ReactElement {
  return (
    <Flex gap={12} align="center">
      {icon}
      <Stack spacing="xs">
        <Text size="lg" weight="semibold">
          {title}
        </Text>
        {description && (
          <Text size="sm" color="muted" className="ds-import-export__muted-text">
            {description}
          </Text>
        )}
      </Stack>
    </Flex>
  );
}

function ImportPanel({
  config,
  cardVariant,
}: {
  config: ImportExportSurfaceConfig;
  cardVariant: CardVariant;
}): React.ReactElement {
  const importConfig = config.behavior.importConfig;
  const { tSurfaceOr } = useSurfaceTranslations();
  const [step, setStep] = useState<ImportStep>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [failure, setFailure] = useState<FlowFailure | null>(null);

  // The app's onUpload parses the file and returns validation results; the
  // surface then transitions to the preview step where the user reviews
  // errors before confirming. A rejection parks the panel in an error state
  // whose retry re-runs the same upload.
  async function runUpload(file: File): Promise<void> {
    if (!importConfig?.onUpload) return;
    setUploading(true);
    setFailure(null);
    try {
      const result = await importConfig.onUpload(file);
      setImportResult(result);
      setStep('preview');
    } catch (error) {
      setFailure({ error, retry: () => { void runUpload(file); } });
    } finally {
      setUploading(false);
    }
  }

  // File intake is the Upload.Dragger primitive: it owns the file dialog,
  // drag-drop, keyboard trigger and dropzone chrome; the surface only
  // forwards the accepted File to the app's callback.
  function handleFileAccepted(info: UploadChangeInfo): void {
    const file = info.file.originFileObj;
    if (file) void runUpload(file);
  }

  async function handleConfirm(): Promise<void> {
    if (!importConfig?.onConfirm || !importResult?.detectedMappings) return;
    setConfirming(true);
    setFailure(null);
    try {
      await importConfig.onConfirm(importResult.detectedMappings);
      setStep('complete');
    } catch (error) {
      setFailure({ error, retry: () => { void handleConfirm(); } });
    } finally {
      setConfirming(false);
    }
  }

  if (!importConfig) {
    return (
      <SurfaceEmptyState
        title={tSurfaceOr('import_export.import_not_configured_title', 'Import not configured')}
        description={tSurfaceOr(
          'import_export.import_not_configured_description',
          'Import functionality has not been set up.'
        )}
      />
    );
  }

  // A failed job swaps the panel for the shared error kit (it brings its own
  // card chrome, so the panel card would be redundant nesting).
  if (failure) {
    return (
      <SurfaceErrorState
        error={failure.error}
        title={tSurfaceOr('import_export.import_failed_title', 'Import failed')}
        onRetry={failure.retry}
      />
    );
  }

  return (
    <Card className="ds-import-export__import-card" variant={cardVariant}>
      <Card.Body>
        <Stack spacing="lg">
          <PanelHeader
            icon={<DataImportIcon decorative size={20} />}
            title={tSurfaceOr('import_export.import_title', 'Import Data')}
            description={tSurfaceOr(
              'import_export.import_description',
              'Upload a file to validate its rows, review any errors, and confirm the import.'
            )}
          />

          {step === 'upload' && (
            <Stack spacing="md">
              {/*
                Pinned anatomy hook: `ds-import-export__dropzone` lands on the
                Dragger root (the class used to mark the hand-rolled Card
                dropzone it replaced).
              */}
              <Upload.Dragger
                className="ds-import-export__dropzone"
                accept={importConfig.acceptedFormats.join(',')}
                showUploadList={false}
                disabled={!importConfig.onUpload || uploading}
                onChange={handleFileAccepted}
              >
                {uploading ? (
                  <Spinner
                    size="md"
                    label={tSurfaceOr('import_export.processing_file', 'Processing file...')}
                  />
                ) : (
                  <Stack spacing="sm" align="center">
                    <ActionUploadIcon decorative size={28} />
                    <Text align="center" color="muted" className="ds-import-export__muted-text">
                      {tSurfaceOr(
                        'import_export.dropzone_hint',
                        'Drop a file here or click to browse'
                      )}
                    </Text>
                    <Text
                      size="sm"
                      align="center"
                      color="muted"
                      className="ds-import-export__muted-text"
                    >
                      {tSurfaceOr(
                        'import_export.accepted_formats',
                        'Accepted formats: {formats}',
                        { formats: importConfig.acceptedFormats.join(', ') }
                      )}
                    </Text>
                  </Stack>
                )}
              </Upload.Dragger>
              {importConfig.templateUrl && (
                <Text size="sm" color="muted" className="ds-import-export__muted-text">
                  {tSurfaceOr('import_export.template_hint', 'Need a template?')}{' '}
                  <NavLink href={importConfig.templateUrl}>
                    <ActionDownloadIcon decorative size={13} />{' '}
                    {tSurfaceOr('import_export.template_download', 'Download template')}
                  </NavLink>
                </Text>
              )}
            </Stack>
          )}

          {step === 'preview' && importResult && (
            <Stack spacing="md">
              <Flex gap={8} wrap="wrap">
                <Tag tone="success">
                  {tSurfaceOr('import_export.preview_valid', 'Valid: {count}', {
                    count: importResult.validRows,
                  })}
                </Tag>
                <Tag tone="danger">
                  {tSurfaceOr('import_export.preview_errors', 'Errors: {count}', {
                    count: importResult.errorRows,
                  })}
                </Tag>
                <Tag tone="neutral">
                  {tSurfaceOr('import_export.preview_total', 'Total: {count}', {
                    count: importResult.totalRows,
                  })}
                </Tag>
              </Flex>
              {importResult.errors && importResult.errors.length > 0 && (
                <Card className="ds-import-export__error-card" variant="outlined">
                  <Card.Body>
                    <Stack spacing="xs">
                      <Text weight="semibold" color="error" data-part="error-title">
                        {tSurfaceOr(
                          'import_export.validation_errors_title',
                          'Validation Errors'
                        )}
                      </Text>
                      {/* Cap displayed errors at 5 to prevent the preview step from
                          becoming unreadable with hundreds of validation failures.
                          The overflow count is shown below. */}
                      {importResult.errors.slice(0, 5).map((err, index) => (
                        <Text
                          key={`${err.row}-${err.field}-${index}`}
                          size="sm"
                          color="muted"
                          className="ds-import-export__muted-text"
                        >
                          {tSurfaceOr(
                            'import_export.error_row',
                            'Row {row}, {field}: {message}',
                            { row: err.row, field: err.field, message: err.message }
                          )}
                        </Text>
                      ))}
                      {importResult.errors.length > 5 && (
                        <Text size="xs" color="muted" className="ds-import-export__muted-text">
                          {tSurfaceOr('import_export.more_errors', '...and {count} more', {
                            count: importResult.errors.length - 5,
                          })}
                        </Text>
                      )}
                    </Stack>
                  </Card.Body>
                </Card>
              )}
              {importResult.validRows === 0 && (
                <Text size="sm" color="muted" className="ds-import-export__muted-text">
                  {tSurfaceOr(
                    'import_export.no_valid_rows',
                    'No valid rows to import. Upload a corrected file to continue.'
                  )}
                </Text>
              )}
              <Flex gap={8} justify="end" wrap="wrap">
                <Button
                  variant="secondary"
                  onClick={() => { setStep('upload'); setImportResult(null); }}
                  disabled={confirming}
                >
                  {tSurfaceOr('import_export.back', 'Back')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { void handleConfirm(); }}
                  loading={confirming}
                  disabled={importResult.validRows === 0}
                >
                  {tSurfaceOr('import_export.confirm_import', 'Confirm Import')}
                </Button>
              </Flex>
            </Stack>
          )}

          {step === 'complete' && (
            <Stack spacing="md">
              <Flex gap={8} align="center">
                <StatusSuccessIcon decorative size={18} />
                <Text weight="semibold" color="success" data-part="success-message">
                  {tSurfaceOr(
                    'import_export.import_success',
                    'Import completed successfully'
                  )}
                </Text>
              </Flex>
              <Flex justify="start">
                <Button
                  variant="secondary"
                  onClick={() => { setStep('upload'); setImportResult(null); }}
                >
                  {tSurfaceOr('import_export.import_more', 'Import More')}
                </Button>
              </Flex>
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ExportPanel({
  config,
  cardVariant,
}: {
  config: ImportExportSurfaceConfig;
  cardVariant: CardVariant;
}): React.ReactElement {
  const exportConfig = config.behavior.exportConfig;
  const { tSurfaceOr } = useSurfaceTranslations();
  // Pre-select all fields that are not explicitly opted out. This matches
  // the typical export UX where users want everything by default and
  // deselect what they do not need.
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    if (!exportConfig?.fields) return [];
    return exportConfig.fields.filter((f) => f.selected !== false).map((f) => f.key);
  });
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(
    exportConfig?.formats[0] ?? 'csv'
  );
  const [failure, setFailure] = useState<FlowFailure | null>(null);

  async function handleExport(): Promise<void> {
    if (!exportConfig?.onExport) return;
    setExporting(true);
    setFailure(null);
    try {
      await exportConfig.onExport(selectedFormat, selectedFields);
    } catch (error) {
      setFailure({ error, retry: () => { void handleExport(); } });
    } finally {
      setExporting(false);
    }
  }

  function toggleField(fieldKey: string): void {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((k) => k !== fieldKey)
        : [...prev, fieldKey]
    );
  }

  if (!exportConfig) {
    return (
      <SurfaceEmptyState
        title={tSurfaceOr('import_export.export_not_configured_title', 'Export not configured')}
        description={tSurfaceOr(
          'import_export.export_not_configured_description',
          'Export functionality has not been set up.'
        )}
      />
    );
  }

  if (failure) {
    return (
      <SurfaceErrorState
        error={failure.error}
        title={tSurfaceOr('import_export.export_failed_title', 'Export failed')}
        onRetry={failure.retry}
      />
    );
  }

  const allSelected = selectedFields.length === exportConfig.fields.length;

  return (
    <Card className="ds-import-export__export-card" variant={cardVariant}>
      <Card.Body>
        <Stack spacing="lg">
          <PanelHeader
            icon={<DataExportIcon decorative size={20} />}
            title={tSurfaceOr('import_export.export_title', 'Export Data')}
            description={tSurfaceOr(
              'import_export.export_description',
              'Choose a format and the fields to include in the exported file.'
            )}
          />

          <Stack spacing="sm">
            <Text weight="medium">{tSurfaceOr('import_export.format_label', 'Format')}</Text>
            {/*
              Single-choice format selection is a Segmented (radiogroup
              semantics, arrow-key roving, per-option accessible names) — the
              idiom SU12 flagged for hand-rolled button-pair switches.
            */}
            <Segmented
              size="small"
              value={selectedFormat}
              onChange={(value) => setSelectedFormat(String(value))}
              ariaLabel={tSurfaceOr('import_export.format_group_aria', 'Export format')}
              options={exportConfig.formats.map((format) => ({
                label: format.toUpperCase(),
                value: format,
                ariaLabel: tSurfaceOr(
                  'import_export.export_format_aria',
                  'Export as {format}',
                  { format: format.toUpperCase() }
                ),
              }))}
            />
          </Stack>

          <Stack spacing="sm">
            <Flex justify="between" align="center" wrap="wrap" gap={8}>
              <Text weight="medium">{tSurfaceOr('import_export.fields_label', 'Fields')}</Text>
              <Flex gap={12} align="center" wrap="wrap">
                <Text size="xs" color="muted" className="ds-import-export__muted-text">
                  {tSurfaceOr(
                    'import_export.fields_selected',
                    '{selected} of {total} selected',
                    { selected: selectedFields.length, total: exportConfig.fields.length }
                  )}
                </Text>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() =>
                    setSelectedFields(
                      allSelected ? [] : exportConfig.fields.map((field) => field.key)
                    )
                  }
                >
                  {allSelected
                    ? tSurfaceOr('import_export.clear_all', 'Clear')
                    : tSurfaceOr('import_export.select_all', 'Select all')}
                </Button>
              </Flex>
            </Flex>
            <Grid columns={{ xs: 1, sm: 2 }} gap="sm">
              {exportConfig.fields.map((field) => (
                <Checkbox
                  key={field.key}
                  checked={selectedFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                >
                  {field.label}
                </Checkbox>
              ))}
            </Grid>
          </Stack>

          <Flex justify="end">
            <Button
              variant="primary"
              onClick={() => { void handleExport(); }}
              loading={exporting}
              disabled={selectedFields.length === 0}
            >
              {tSurfaceOr('import_export.export_action', 'Export')}
            </Button>
          </Flex>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function HistoryPanel({
  config,
  cardVariant,
}: {
  config: ImportExportSurfaceConfig;
  cardVariant: CardVariant;
}): React.ReactElement | null {
  const { history } = config.behavior;
  const { tSurfaceOr } = useSurfaceTranslations();

  // `undefined` means the app never configured the feature (render nothing);
  // an empty list means it did and there is simply nothing recorded yet.
  if (!history) return null;

  return (
    <Card className="ds-import-export__history-card" variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <PanelHeader
            icon={<TimeTimestampIcon decorative size={20} />}
            title={tSurfaceOr('import_export.history_title', 'History')}
          />
          {history.length === 0 ? (
            <Text size="sm" color="muted" className="ds-import-export__muted-text">
              {tSurfaceOr(
                'import_export.history_empty',
                'No import or export operations yet.'
              )}
            </Text>
          ) : (
            <Stack
              spacing="none"
              role="list"
              aria-label={tSurfaceOr(
                'import_export.history_list_aria',
                'Import and export operations'
              )}
            >
              {history.map((entry) => (
                <Flex
                  key={entry.id}
                  role="listitem"
                  className="ds-import-export__divider"
                  justify="between"
                  align="center"
                  wrap="wrap"
                  gap={8}
                >
                  <Flex gap={12} align="center" wrap="wrap">
                    <Tag tone={entry.type === 'import' ? 'primary' : 'neutral'}>
                      {entry.type === 'import'
                        ? tSurfaceOr('import_export.type_import', 'Import')
                        : tSurfaceOr('import_export.type_export', 'Export')}
                    </Tag>
                    <Text weight="medium">{entry.date}</Text>
                    <Text size="sm" color="muted" className="ds-import-export__muted-text">
                      {tSurfaceOr('import_export.history_records', '{count} records', {
                        count: entry.recordCount,
                      })}
                    </Text>
                  </Flex>
                  <Tag tone={statusTone(entry.status)}>{entry.status}</Tag>
                </Flex>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function ImportExportSurface({
  config,
  loading = false,
  error,
  onRetry,
}: ImportExportSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { isMobile } = useBreakpoints();
  // Mode controls which panels are visible. Apps that only need one direction
  // can hide the other entirely, keeping the UI focused.
  const { mode } = config.behavior;
  const showImport = mode === 'import' || mode === 'both';
  const showExport = mode === 'export' || mode === 'both';
  const cardVariant = profileDefaults.cardVariant;
  const isCompact = profileDefaults.density === 'compact';

  const chrome = {
    ...config.presentation.chrome,
    maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
  };

  // Error short-circuits the whole body: the shell keeps the page chrome so
  // retry never loses context (ListSurface/AuditSurface precedent).
  if (error) {
    return (
      <PageShellSurface chrome={chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  /*
    Loading keeps the real page chrome and renders shaped section skeletons
    instead of the shell's whole-page placeholder: PatternPageShell's
    `loading` early return never renders children, so a body skeleton that
    mirrors the final sections can only exist here (AuditSurface precedent).
    Only configured sections get a skeleton — never a history placeholder
    when the app opted out of history.
  */
  const content = (
    <Stack
      className="ds-surface ds-import-export"
      data-part="root"
      data-mode={mode}
      data-loading={loading ? 'true' : 'false'}
      data-mobile={isMobile ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {loading ? (
        <>
          {showImport && (
            <Card variant={cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={isCompact ? 6 : 4} />
              </Card.Body>
            </Card>
          )}
          {showExport && (
            <Card variant={cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={isCompact ? 6 : 4} />
              </Card.Body>
            </Card>
          )}
          {config.behavior.history && (
            <Card variant={cardVariant}>
              <Card.Body>
                <SurfaceLoadingSkeleton rows={3} />
              </Card.Body>
            </Card>
          )}
        </>
      ) : (
        <>
          {showImport && <ImportPanel config={config} cardVariant={cardVariant} />}
          {showExport && <ExportPanel config={config} cardVariant={cardVariant} />}
          <HistoryPanel config={config} cardVariant={cardVariant} />
        </>
      )}
    </Stack>
  );

  return (
    <PageShellSurface chrome={chrome} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
      ) : (
        content
      )}
    </PageShellSurface>
  );
}
