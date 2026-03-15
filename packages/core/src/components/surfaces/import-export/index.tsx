'use client';

/**
 * ImportExportSurface
 *
 * Data bulk operations surface supporting import uploads, export field
 * selection, and operation history. The surface owns the step-by-step flow
 * structure while the app owns the actual file processing, field mapping,
 * and data transformation logic.
 */

import React, { useCallback, useState } from 'react';
import { Box, Button, Card, Checkbox, Flex, Grid, Stack, Tag, Text } from '../../primitives';
import type {
  ExportField,
  FieldMapping,
  ImportExportSurfaceConfig,
  ImportResult,
} from '../types';
import { PageShellSurface } from '../page-shell';
import { SurfaceEmptyState } from '../states';

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
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="lg">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Import Data</Text>

          {step === 'upload' && (
            <Stack spacing="md">
              <Card
                variant="outlined"
                style={{
                  border: '2px dashed var(--ds-color-border)',
                  textAlign: 'center',
                  padding: '32px 16px',
                }}
              >
                <Card.Body>
                  <Stack spacing="md">
                    <Text style={{ color: 'var(--ds-color-text-muted)' }}>
                      Drop a file here or click to browse
                    </Text>
                    <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
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
                <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
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
                <Card variant="outlined" style={{ borderColor: 'var(--ds-color-error-500)' }}>
                  <Card.Body>
                    <Stack spacing="xs">
                      <Text style={{ fontWeight: 600, color: 'var(--ds-color-error-500)' }}>
                        Validation Errors
                      </Text>
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <Text key={i} style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
                          Row {err.row}, {err.field}: {err.message}
                        </Text>
                      ))}
                      {importResult.errors.length > 5 && (
                        <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
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
              <Text style={{ fontWeight: 600, color: 'var(--ds-color-success-500)' }}>
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
    <Card variant="outlined">
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
              <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 12 }}>
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
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>History</Text>
          {history.map((entry) => (
            <Flex
              key={entry.id}
              justify="between"
              align="center"
              style={{ padding: '8px 0', borderBottom: '1px solid var(--ds-color-border)' }}
            >
              <Flex gap={12} align="center">
                <Tag color={entry.type === 'import' ? 'processing' : 'default'}>
                  {entry.type}
                </Tag>
                <Text style={{ fontWeight: 500 }}>{entry.date}</Text>
                <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: 13 }}>
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
      <Stack spacing="lg">
        {showImport && <ImportPanel config={config} />}
        {showExport && <ExportPanel config={config} />}
        <HistoryPanel config={config} />
      </Stack>
    </PageShellSurface>
  );
}
