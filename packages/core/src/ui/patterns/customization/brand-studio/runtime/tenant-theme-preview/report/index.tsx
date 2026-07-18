'use client';

/**
 * @fileoverview TenantThemePreviewReport -- the quiet, honest read-out beneath
 * the Brand Studio live preview.
 *
 * Renders three things from {@link useTenantThemePreview}: the compiler's
 * structured validation issues (when the document is invalid), the APCA
 * autocorrections the compiler applied (each named foreground token, its ground,
 * the hex it moved from and to, and the Lc it reached), and font-pack warnings
 * when a referenced `--ds-font-pack-*` is not loaded in the host document. It is
 * purely presentational and domain-agnostic: it knows nothing about tenants,
 * candidates, roles, or events.
 *
 * @module Patterns/Customization/BrandStudio/Runtime/TenantThemePreview/Report
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import type { TenantThemeValidationIssue } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { Badge, Box, Flex, Stack, Text } from '@/ui/primitives';

// Sourced from the owner barrel rather than the sibling leaf modules so the
// report stays a downstream consumer of its own owner, not a peer of them.
import type {
  TenantThemeContrastAdjustment,
  TenantThemePackWarning,
} from '../index';

export interface TenantThemePreviewReportProps {
  /** Structured validation issues; a non-empty list renders the invalid-document panel. */
  issues?: readonly TenantThemeValidationIssue[] | null;
  /** APCA autocorrections recorded on the compiled artifact. */
  adjustments?: readonly TenantThemeContrastAdjustment[];
  /** Referenced font packs not loaded in the host document. */
  packWarnings?: readonly TenantThemePackWarning[];
}

/**
 * Readable phrases for the foreground tokens the compiler most commonly snaps,
 * so the quiet list reads as prose. Unknown tokens fall back to their raw name;
 * the hex/Lc detail line below is always exact.
 */
const ADJUSTMENT_LABELS: Record<string, string> = {
  '--ds-button-primary-color': 'Text on primary button',
  '--ds-button-secondary-color': 'Text on secondary button',
  '--ds-button-success-color': 'Text on success button',
  '--ds-button-warning-color': 'Text on warning button',
  '--ds-button-error-color': 'Text on error button',
  '--ds-button-info-color': 'Text on info button',
  '--ds-table-header-color': 'Table header text',
  '--ds-sidebar-text': 'Sidebar text',
  '--ds-sidebar-item-color-active': 'Active sidebar item text',
  '--ds-color-text-primary': 'Body text',
};

function adjustmentLabel(token: string): string {
  return ADJUSTMENT_LABELS[token] ?? token;
}

const SECTION_STYLE: CSSProperties = { marginTop: 12, padding: 12 };
const ROW_STYLE: CSSProperties = { padding: '8px 10px' };
const BLOCK: CSSProperties = { display: 'block' };
const EYEBROW: CSSProperties = {
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

function IssuesView({
  issues,
}: {
  issues: readonly TenantThemeValidationIssue[];
}): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__preview-issues"
      data-part="preview-issues"
      data-state="invalid"
      style={SECTION_STYLE}
    >
      <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
        <Text size="xs" weight="semibold" style={EYEBROW}>
          Document not valid
        </Text>
        <Badge variant="error" data-state="invalid">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
        </Badge>
      </Flex>
      <Stack spacing="xs" style={{ marginTop: 8 }}>
        {issues.map((issue) => (
          <Box
            key={`${issue.path}:${issue.code}:${issue.message}`}
            className="ds-pattern-brand-studio__preview-issue"
            data-part="preview-issue"
            data-code={issue.code}
            style={ROW_STYLE}
          >
            <Text size="xs" weight="semibold" style={BLOCK}>
              {issue.path}
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-issue-message"
              data-part="preview-issue-message"
              size="xs"
              style={{ ...BLOCK, marginTop: 4 }}
            >
              {issue.message}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function AdjustmentsView({
  adjustments,
}: {
  adjustments: readonly TenantThemeContrastAdjustment[];
}): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__preview-adjustments"
      data-part="preview-adjustments"
      data-state="adjusted"
      style={SECTION_STYLE}
    >
      <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
        <Text size="xs" weight="semibold" style={EYEBROW}>
          Contrast autocorrections
        </Text>
        <Badge variant="secondary">
          {adjustments.length} {adjustments.length === 1 ? 'change' : 'changes'}
        </Badge>
      </Flex>
      <Stack spacing="xs" style={{ marginTop: 8 }}>
        {adjustments.map((adjustment) => (
          <Box
            key={`${adjustment.token}:${adjustment.pairedWith}`}
            className="ds-pattern-brand-studio__preview-adjustment"
            data-part="preview-adjustment"
            style={ROW_STYLE}
          >
            <Text size="xs" weight="semibold" style={BLOCK}>
              {adjustmentLabel(adjustment.token)} adjusted {adjustment.from} &rarr;{' '}
              {adjustment.to} to reach Lc {Math.round(adjustment.lcAfter)}
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-adjustment-detail"
              data-part="preview-adjustment-detail"
              size="xs"
              style={{ ...BLOCK, marginTop: 4 }}
            >
              on {adjustment.pairedWith} &middot; was Lc {Math.round(adjustment.lcBefore)}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function PackWarningsView({
  packWarnings,
}: {
  packWarnings: readonly TenantThemePackWarning[];
}): React.ReactElement {
  return (
    <Box
      className="ds-pattern-brand-studio__preview-pack-warnings"
      data-part="preview-pack-warnings"
      data-state="warning"
      style={SECTION_STYLE}
    >
      <Flex align="center" justify="between" gap={8} style={{ flexWrap: 'wrap' }}>
        <Text size="xs" weight="semibold" style={EYEBROW}>
          Font packs not loaded
        </Text>
        <Badge variant="warning" data-state="warning">
          {packWarnings.length} {packWarnings.length === 1 ? 'pack' : 'packs'}
        </Badge>
      </Flex>
      <Stack spacing="xs" style={{ marginTop: 8 }}>
        {packWarnings.map((warning) => (
          <Box
            key={`${warning.referencedBy}:${warning.variable}`}
            className="ds-pattern-brand-studio__preview-pack-warning"
            data-part="preview-pack-warning"
            style={ROW_STYLE}
          >
            <Text size="xs" weight="semibold" style={BLOCK}>
              {warning.variable} is referenced but not loaded
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-pack-warning-detail"
              data-part="preview-pack-warning-detail"
              size="xs"
              style={{ ...BLOCK, marginTop: 4 }}
            >
              {warning.referencedBy} falls through to its authored fallback fonts
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

/**
 * Report surface for the tenant-theme live preview: invalid-document issues,
 * APCA autocorrections, and font-pack warnings. Renders nothing when a valid
 * document produced no adjustments and no warnings.
 */
export function TenantThemePreviewReport({
  issues,
  adjustments = [],
  packWarnings = [],
}: TenantThemePreviewReportProps): React.ReactElement | null {
  const hasIssues = (issues?.length ?? 0) > 0;
  if (hasIssues) {
    return (
      <Stack
        className="ds-pattern-brand-studio__preview-report"
        data-part="preview-report"
        data-state="invalid"
        spacing="sm"
      >
        <IssuesView issues={issues as readonly TenantThemeValidationIssue[]} />
      </Stack>
    );
  }

  if (adjustments.length === 0 && packWarnings.length === 0) {
    return null;
  }

  return (
    <Stack
      className="ds-pattern-brand-studio__preview-report"
      data-part="preview-report"
      data-state="valid"
      spacing="sm"
    >
      {adjustments.length > 0 ? <AdjustmentsView adjustments={adjustments} /> : null}
      {packWarnings.length > 0 ? <PackWarningsView packWarnings={packWarnings} /> : null}
    </Stack>
  );
}
