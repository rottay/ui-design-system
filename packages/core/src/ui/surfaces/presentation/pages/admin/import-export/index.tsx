'use client';

/**
 * @fileoverview ImportExportSurface -- bulk data import/export page shell.
 * @description Step-by-step flow for file upload (import), field selection (export),
 * and operation history. The surface owns flow structure; the app owns file
 * processing, field mapping, and data transformation.
 */

import React, { useCallback, useState } from 'react';
import { Box, Button, Card, Checkbox, Flex, Grid, Stack, Tag, Text } from '../../../../../primitives';
import type {
  ExportField,
  FieldMapping,
  ImportExportSurfaceConfig,
  ImportResult,
} from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface ImportExportSurfaceProps {
  config: ImportExportSurfaceConfig;
  loading?: boolean;
}

type ImportStep = 'upload' | 'preview' | 'complete';

function ImportPanel({
  config,
}: {
  config: ImportExportSurfaceConfig;
}): React.ReactElement {
  const importConfig = config.behavior.importConfig;
  const [step, setStep] = useState<ImportStep>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // File selection triggers the upload callback provided by the app. The app
  // is responsible for parsing the file and returning validation results.
  // The surface then transitions to the preview step where the user can
  // review errors before confirming.
  const handleFileSelect = useCallback(async () => {
    if (!importConfig?.onUpload) return;
    setUploading(true);
    try {
      // In practice the app would use a file input; here we model the flow
      const fakeFile = new File([], 'import.csv');
      const result = await importConfig.onUpload(fakeFile);
      setImportResult(result);
      setStep('preview');
    } finally {
      setUploading(false);
    }
  }, [importConfig]);

  const handleConfirm = useCallback(async () => {
    if (!importConfig?.onConfirm || !importResult?.detectedMappings) return;
    setConfirming(true);
    try {
      await importConfig.onConfirm(importResult.detectedMappings);
      setStep('complete');
    } finally {
      setConfirming(false);
    }
  }, [importConfig, importResult]);

  if (!importConfig) {
    return (
      <SurfaceEmptyState
        title="Import not configured"
        description="Import functionality has not been set up."
      />
    );
  }

  return (
    <Card className="ds-import-export__import-card" variant="outlined">
      <Card.Body>
        <Stack spacing="lg">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Import Data</Text>

          {step === 'upload' && (
            <Stack spacing="md">
              <Card
                className="ds-import-export__dropzone"
                variant="outlined"
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                }}
              >
                <Card.Body>
                  <Stack spacing="md">
                    <Text
                      className="ds-import-export__muted-text"
                      data-part="muted-text"
                    >
                      Drop a file here or click to browse
                    </Text>
                    <Text
                      className="ds-import-export__muted-text"
                      data-part="muted-text"
                      style={{ fontSize: 12 }}
                    >
                      Accepted formats: {importConfig.acceptedFormats.join(', ')}
                    </Text>
                    <Button
                      variant="primary"
                      onClick={handleFileSelect}
                      loading={uploading}
                    >
                      <Text>Select File</Text>
                    </Button>
                  </Stack>
                </Card.Body>
              </Card>
              {importConfig.templateUrl && (
                <Text
                  className="ds-import-export__muted-text"
                  data-part="muted-text"
                  style={{ fontSize: 13 }}
                >
                  Need a template? Download it from the provided URL.
                </Text>
              )}
            </Stack>
          )}

          {step === 'preview' && importResult && (
            <Stack spacing="md">
              <Flex gap={12} wrap="wrap">
                <Tag color="success">Valid: {importResult.validRows}</Tag>
                <Tag color="error">Errors: {importResult.errorRows}</Tag>
                <Tag color="default">Total: {importResult.totalRows}</Tag>
              </Flex>
              {importResult.errors && importResult.errors.length > 0 && (
                <Card
                  className="ds-import-export__error-card"
                  variant="outlined"
                >
                  <Card.Body>
                    <Stack spacing="xs">
                      <Text
                        className="ds-import-export__error-title"
                        data-part="error-title"
                        style={{ fontWeight: 600 }}
                      >
                        Validation Errors
                      </Text>
                      {/* Cap displayed errors at 5 to prevent the preview step from
                  becoming unreadable with hundreds of validation failures. The
                  overflow count is shown below. */}
              {importResult.errors.slice(0, 5).map((err, i) => (
                        <Text
                          key={i}
                          className="ds-import-export__muted-text"
                          data-part="muted-text"
                          style={{ fontSize: 13 }}
                        >
                          Row {err.row}, {err.field}: {err.message}
                        </Text>
                      ))}
                      {importResult.errors.length > 5 && (
                        <Text
                          className="ds-import-export__muted-text"
                          data-part="muted-text"
                          style={{ fontSize: 12 }}
                        >
                          ...and {importResult.errors.length - 5} more
                        </Text>
                      )}
                    </Stack>
                  </Card.Body>
                </Card>
              )}
              <Flex gap={8} justify="end">
                <Button variant="secondary" onClick={() => setStep('upload')}>
                  <Text>Back</Text>
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={confirming}
                  disabled={importResult.validRows === 0}
                >
                  <Text>Confirm Import</Text>
                </Button>
              </Flex>
            </Stack>
          )}

          {step === 'complete' && (
            <Stack spacing="md">
              <Text
                className="ds-import-export__success-message"
                data-part="success-message"
                style={{ fontWeight: 600 }}
              >
                Import completed successfully
              </Text>
              <Button variant="secondary" onClick={() => { setStep('upload'); setImportResult(null); }}>
                <Text>Import More</Text>
              </Button>
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ExportPanel({
  config,
}: {
  config: ImportExportSurfaceConfig;
}): React.ReactElement {
  const exportConfig = config.behavior.exportConfig;
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

  const handleExport = useCallback(async () => {
    if (!exportConfig?.onExport) return;
    setExporting(true);
    try {
      await exportConfig.onExport(selectedFormat, selectedFields);
    } finally {
      setExporting(false);
    }
  }, [exportConfig, selectedFormat, selectedFields]);

  const toggleField = useCallback((fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((k) => k !== fieldKey)
        : [...prev, fieldKey]
    );
  }, []);

  if (!exportConfig) {
    return (
      <SurfaceEmptyState
        title="Export not configured"
        description="Export functionality has not been set up."
      />
    );
  }

  return (
    <Card className="ds-import-export__export-card" variant="outlined">
      <Card.Body>
        <Stack spacing="lg">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Export Data</Text>

          <Stack spacing="md">
            <Text style={{ fontWeight: 500 }}>Format</Text>
            <Flex gap={8} wrap="wrap">
              {exportConfig.formats.map((format) => (
                <Button
                  key={format}
                  variant={selectedFormat === format ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedFormat(format)}
                >
                  <Text>{format.toUpperCase()}</Text>
                </Button>
              ))}
            </Flex>
          </Stack>

          <Stack spacing="md">
            <Flex justify="between" align="center">
              <Text style={{ fontWeight: 500 }}>Fields</Text>
              <Text
                className="ds-import-export__muted-text"
                data-part="muted-text"
                style={{ fontSize: 12 }}
              >
                {selectedFields.length} of {exportConfig.fields.length} selected
              </Text>
            </Flex>
            <Grid columns={2} gap="sm">
              {exportConfig.fields.map((field) => (
                <Box key={field.key}>
                  <Checkbox
                    checked={selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                  >
                    {field.label}
                  </Checkbox>
                </Box>
              ))}
            </Grid>
          </Stack>

          <Flex justify="end">
            <Button
              variant="primary"
              onClick={handleExport}
              loading={exporting}
              disabled={selectedFields.length === 0}
            >
              <Text>Export</Text>
            </Button>
          </Flex>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function HistoryPanel({
  config,
}: {
  config: ImportExportSurfaceConfig;
}): React.ReactElement | null {
  const { history } = config.behavior;

  if (!history || history.length === 0) return null;

  return (
    <Card className="ds-import-export__history-card" variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>History</Text>
          {history.map((entry) => (
            <Flex
              key={entry.id}
              className="ds-import-export__divider"
              justify="between"
              align="center"
              style={{ padding: '8px 0' }}
            >
              <Flex gap={12} align="center">
                <Tag color={entry.type === 'import' ? 'processing' : 'default'}>
                  {entry.type}
                </Tag>
                <Text style={{ fontWeight: 500 }}>{entry.date}</Text>
                <Text
                  className="ds-import-export__muted-text"
                  data-part="muted-text"
                  style={{ fontSize: 13 }}
                >
                  {entry.recordCount} records
                </Text>
              </Flex>
              <Tag
                color={
                  entry.status === 'completed'
                    ? 'success'
                    : entry.status === 'failed'
                      ? 'error'
                      : 'warning'
                }
              >
                {entry.status}
              </Tag>
            </Flex>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function ImportExportSurface({
  config,
  loading = false,
}: ImportExportSurfaceProps): React.ReactElement {
  // Mode controls which panels are visible. Apps that only need one direction
  // can hide the other entirely, keeping the UI focused.
  const { mode } = config.behavior;
  const showImport = mode === 'import' || mode === 'both';
  const showExport = mode === 'export' || mode === 'both';

  return (
    <PageShellSurface
      chrome={{
        ...config.presentation.chrome,
        maxWidth: config.visual.maxWidth ?? config.presentation.chrome.maxWidth,
      }}
      loading={loading}
    >
      <Stack
        className="ds-surface ds-import-export"
        data-part="root"
        data-loading={loading ? 'true' : 'false'}
        data-mode={mode}
        spacing="lg"
      >
        {showImport && <ImportPanel config={config} />}
        {showExport && <ExportPanel config={config} />}
        <HistoryPanel config={config} />
      </Stack>
    </PageShellSurface>
  );
}
